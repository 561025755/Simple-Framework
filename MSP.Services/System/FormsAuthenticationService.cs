using System;
using System.Web;
using System.Linq;
using System.Collections.Generic;
using System.Web.Security;

using SD.Core.Domain;
using SD.Interface;
using System.Net.NetworkInformation;
using System.Management;
using SD.FrameWork.Caching;
using SD.Core.Enum;

namespace Nop.Services.Authentication
{
    /// <summary>
    /// Authentication service
    /// </summary>
    public partial class FormsAuthenticationService : IAuthenticationService
    {
        private readonly HttpContextBase httpContext;
        private readonly IUserService userService;
        private readonly UserSettings userSettings;
        private readonly TimeSpan expirationTimeSpan;
        private readonly ICacheManager cacheManager;

        private Sys_User cachedUser;

        /// <summary>
        /// Ctor
        /// </summary>
        /// <param name="httpContext">HTTP context</param>
        /// <param name="customerService">Customer service</param>
        /// <param name="customerSettings">Customer settings</param>
        public FormsAuthenticationService(HttpContextBase httpContext,
            UserSettings userSettings,
            IUserService userService,
            ICacheManager cacheManager)
        {
            this.httpContext = httpContext;
            this.userSettings = userSettings;
            this.userService = userService;
            this.cacheManager = cacheManager;

            this.expirationTimeSpan = FormsAuthentication.Timeout;
        }


        public virtual void SignIn(Sys_User user, bool createPersistentCookie)
        {

            var now = DateTime.UtcNow.ToLocalTime();

            //更新登录时间
            //user.LastLoginTime = now;
            //this.userService.Save(user);

            var ticket = new FormsAuthenticationTicket(
                1 /*version*/,
                userSettings.UsernamesEnabled ? user.UserName : user.Email,
                now,
                now.Add(expirationTimeSpan),
                createPersistentCookie,
                userSettings.UsernamesEnabled ? user.UserName : user.Email,
                FormsAuthentication.FormsCookiePath);

            var encryptedTicket = FormsAuthentication.Encrypt(ticket);

            var cookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
            cookie.HttpOnly = true;
            if (ticket.IsPersistent)
            {
                cookie.Expires = ticket.Expiration;
            }
            cookie.Secure = FormsAuthentication.RequireSSL;
            cookie.Path = FormsAuthentication.FormsCookiePath;
            if (FormsAuthentication.CookieDomain != null)
            {
                cookie.Domain = FormsAuthentication.CookieDomain;
            }

            httpContext.Response.Cookies.Add(cookie);
            cachedUser = user;

            this.cacheManager.Set(this.userService.CacheName(user.Email),user,60);

            userService.AddLog(user, OperateType.Login, "用户登录系统");
            
        }

        public virtual void SignOut()
        {
            cachedUser = null;
            FormsAuthentication.SignOut();
        }

        public virtual Sys_User GetAuthenticatedUser()
        {
            if (cachedUser != null)
                return cachedUser;

            if (httpContext == null ||
                httpContext.Request == null ||
                !httpContext.Request.IsAuthenticated ||
                !(httpContext.User.Identity is FormsIdentity))
            {
                return null;
            }

            var formsIdentity = (FormsIdentity)httpContext.User.Identity;
            //var user = GetAuthenticatedUserFromTicket(formsIdentity.Ticket);
            var user= GetUserFromCache(formsIdentity.Ticket);
            if (user != null && user.Active && !user.Deleted)// && user.IsRegistered())
                cachedUser = user;
            return cachedUser;
        }

        public virtual Sys_User GetAuthenticatedUserFromTicket(FormsAuthenticationTicket ticket)
        {
            if (ticket == null)
                throw new ArgumentNullException("ticket");

            var Email = ticket.UserData;
            return InitializeUser(Email);
        }

        public virtual Sys_User InitializeUser(string email) {
            
            var user = userService.GetByEmail(email);

            if (user != null)
            {
                user.Groups = this.userService.GetGroupsByUser(user.Id);

            }
            return user;
        }

        public virtual Sys_User GetUserFromCache(FormsAuthenticationTicket ticket) {
            Func<FormsAuthenticationTicket,Sys_User> f = GetAuthenticatedUserFromTicket;
            var cacheName = this.userService.CacheName(ticket.UserData);
            return this.cacheManager.Get(cacheName,f, ticket);
        }
    }
}