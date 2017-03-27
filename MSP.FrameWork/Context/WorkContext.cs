using SD.Core.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using SD.Interface;

namespace SD.FrameWork.Context
{
    /// <summary>
    /// Work context for web application
    /// </summary>
    public partial class WorkContext : IWorkContext
    {
        #region Const

        private const string UserCookieName = "digitalsignage.user";

        #endregion

        #region Fields

        private readonly HttpContextBase httpContext;
        private readonly IUserService userService;
        private readonly IAuthenticationService authenticationService;

        private Sys_User cachedUser;

        #endregion

        #region Ctor

        public WorkContext(HttpContextBase httpContext,
            IUserService userService,
            IAuthenticationService authenticationService)
        {
            this.httpContext = httpContext;
            this.userService = userService;
            this.authenticationService = authenticationService;
        }

        #endregion

        #region Utilities

        protected virtual HttpCookie GetUserCookie()
        {
            if (httpContext == null || httpContext.Request == null)
                return null;

            return httpContext.Request.Cookies[UserCookieName];
        }

        protected virtual void SetUserCookie(Guid customerGuid)
        {
            if (httpContext != null && httpContext.Response != null)
            {
                var cookie = new HttpCookie(UserCookieName);
                cookie.HttpOnly = true;
                cookie.Value = customerGuid.ToString();
                if (customerGuid == Guid.Empty)
                {
                    cookie.Expires = DateTime.Now.AddMonths(-1);
                }
                else
                {
                    int cookieExpires = 24 * 365; //TODO make configurable
                    cookie.Expires = DateTime.Now.AddHours(cookieExpires);
                }

                httpContext.Response.Cookies.Remove(UserCookieName);
                httpContext.Response.Cookies.Add(cookie);
            }
        }

        #endregion

        #region Properties

        /// <summary>
        /// Gets or sets the current customer
        /// </summary>
        public virtual Sys_User CurrentUser
        {
            get
            {
                if (cachedUser != null)
                    return cachedUser;

                Sys_User user = null;
                //if (httpContext == null || httpContext is FakeHttpContext)
                //{
                //    //check whether request is made by a background task
                //    //in this case return built-in customer record for background task
                //    user = userService.GetCustomerBySystemName(SystemCustomerNames.BackgroundTask);
                //}

                //registered user
                if (user == null || user.Deleted || !user.Active)
                {
                    user = authenticationService.GetAuthenticatedUser();
                    //user = this.userService.Get(13);
                }

                //impersonate user if required (currently used for 'phone order' support)
                //if (user != null && !user.Deleted && user.Active)
                //{
                //    int? impersonatedCustomerId = user.GetAttribute<int?>(SystemCustomerAttributeNames.ImpersonatedCustomerId);
                //    if (impersonatedCustomerId.HasValue && impersonatedCustomerId.Value > 0)
                //    {
                //        var impersonatedCustomer = _customerService.GetCustomerById(impersonatedCustomerId.Value);
                //        if (impersonatedCustomer != null && !impersonatedCustomer.Deleted && impersonatedCustomer.Active)
                //        {
                //            //set impersonated customer
                //            _originalCustomerIfImpersonated = customer;
                //            customer = impersonatedCustomer;
                //        }
                //    }
                //}

                //load guest customer
                //if (user == null || user.Deleted || !user.Active)
                //{
                //    var userCookie = GetUserCookie();
                //    if (userCookie != null && !String.IsNullOrEmpty(userCookie.Value))
                //    {
                //        Guid userGuid;
                //        if (Guid.TryParse(userCookie.Value, out userGuid))
                //        {
                //            var userByCookie = userService.GetByGuid(userGuid);
                //            if (userByCookie != null &&
                //                //this customer (from cookie) should not be registered
                //                !userByCookie.IsRegistered())
                //                user = userByCookie;
                //        }
                //    }
                //}

                //create guest if not exists
                //if (user == null || user.Deleted || !user.Active)
                //{
                //    user = userService.InsertGuestCustomer();
                //}

                if (user == null)
                {
                    return null;
                }

                //validation
                if (!user.Deleted && user.Active)
                {
                    SetUserCookie(new Guid(user.Uid));
                    cachedUser = user;
                }

                return cachedUser;
            }
            set
            {
                SetUserCookie(new Guid(value.Uid));
                cachedUser = value;
            }
        }

        /// <summary>
        /// operate log
        /// </summary>
        /// <param name="type"></param>
        /// <param name="caption"></param>
        public virtual void AddLog(SD.Core.Enum.OperateType type,string caption) {
            this.userService.AddLog(CurrentUser, type,caption);
        }

        /// <summary>
        /// Get or set value indicating whether we're in admin area
        /// </summary>
        public virtual bool IsAdmin { get; set; }

        #endregion
    }
}
