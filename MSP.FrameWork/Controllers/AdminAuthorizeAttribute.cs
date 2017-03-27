using SD.Core.Domain;
using SD.Core.Domain.Settings;
using SD.FrameWork.Context;
using SD.FrameWork.Engine;
using SD.FrameWork.Security;
using SD.Interface;
using SD.Interface.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace SD.FrameWork.Controllers
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = true)]
    public class AdminAuthorizeAttribute : FilterAttribute, IAuthorizationFilter
    {
        private readonly bool _dontValidate = false;


        public AdminAuthorizeAttribute()
            : this(false)
        {
        }

        public AdminAuthorizeAttribute(bool dontValidate)
        {
            this._dontValidate = dontValidate;
        }

        private void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            filterContext.Result = new HttpUnauthorizedResult();
        }

        private IEnumerable<AdminAuthorizeAttribute> GetAdminAuthorizeAttributes(ActionDescriptor descriptor)
        {
            return descriptor.GetCustomAttributes(typeof(AdminAuthorizeAttribute), true)
                .Concat(descriptor.ControllerDescriptor.GetCustomAttributes(typeof(AdminAuthorizeAttribute), true))
                .OfType<AdminAuthorizeAttribute>();
        }

        private bool IsAdminPageRequested(AuthorizationContext filterContext)
        {
            var adminAttributes = GetAdminAuthorizeAttributes(filterContext.ActionDescriptor);
            if (adminAttributes != null && adminAttributes.Any())
                return true;
            return false;
        }

        public void OnAuthorization(AuthorizationContext filterContext)
        {
            if (_dontValidate)
                return;
            
            var securitySettings = EngineContext.Current.Resolve<SecuritySettings>();
            var user = EngineContext.Current.Resolve<IWorkContext>().CurrentUser;

            if (user != null && !securitySettings.AllowRepeatLogin)
            {
                var ip = EngineContext.Current.Resolve<IWebContext>().GetCurrentIpAddress();

                var userLastLoginIp = EngineContext.Current.Resolve<IUserService>().GetLastRecordByUserId(user.Id).OperAddress;
                if (ip != userLastLoginIp)
                {
                    filterContext.Result = new HttpUnauthorizedResult("Your current account has been logged in elsewhere。");
                    return;
                }
            }

            if (filterContext == null)
                throw new ArgumentNullException("filterContext");

            if (OutputCacheAttribute.IsChildActionCacheActive(filterContext))
                throw new InvalidOperationException("You cannot use [AdminAuthorize] attribute when a child action cache is active");

            if (IsAdminPageRequested(filterContext))
            {
                if (!this.HasAdminAccess(filterContext))
                    this.HandleUnauthorizedRequest(filterContext);
            }
        }

        public virtual bool HasAdminAccess(AuthorizationContext filterContext)
        {
            var permissionService = EngineContext.Current.Resolve<IPermissionService>();
            bool result = permissionService.Authorize(StandardPermissionProvider.AccessAdminPanel);
            return result;
        }
    }
}
