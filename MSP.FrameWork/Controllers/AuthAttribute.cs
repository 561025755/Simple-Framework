using SD.FrameWork.Engine;
using SD.Interface.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace SD.FrameWork.Controllers
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = true)]
    public class AuthAttribute : FilterAttribute, IAuthorizationFilter
    {
        public string Permission { get; set; }


        public AuthAttribute()
        {
        }

        public AuthAttribute(string permission)
        {
            this.Permission = permission;
        }

        private void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            filterContext.Result = new RedirectResult("/");
            //filterContext.Result = new HttpUnauthorizedResult();
        }

        private IEnumerable<AuthAttribute> GetAuthorizeAttributes(ActionDescriptor descriptor)
        {
            return descriptor.GetCustomAttributes(typeof(AuthAttribute), true)
                .Concat(descriptor.ControllerDescriptor.GetCustomAttributes(typeof(AuthAttribute), true))
                .OfType<AuthAttribute>();
        }

        private bool IsAuthorizePageRequested(AuthorizationContext filterContext)
        {
            var authAttributes = GetAuthorizeAttributes(filterContext.ActionDescriptor);
            if (authAttributes != null && authAttributes.Any())
                return true;
            return false;
        }

        public void OnAuthorization(AuthorizationContext filterContext)
        {
            if (filterContext == null)
                throw new ArgumentNullException("filterContext");

            if (OutputCacheAttribute.IsChildActionCacheActive(filterContext))
                throw new InvalidOperationException("You cannot use [AdminAuthorize] attribute when a child action cache is active");

            if (IsAuthorizePageRequested(filterContext))
            {
                if (!this.CanAccess(filterContext))
                {
                    string errorKey = $"ds.notifications.{SD.Core.Enum.UI.NotifyType.Error}";
                    if (filterContext.Controller.TempData[errorKey] == null)
                        filterContext.Controller.TempData[errorKey] = new List<string>();
                    ((List<string>)filterContext.Controller.TempData[errorKey]).Add("操作失败: 没有进入该页面的权限");

                    this.HandleUnauthorizedRequest(filterContext);
                }
            }
        }

        public virtual bool CanAccess(AuthorizationContext filterContext)
        {
            var permissionService = EngineContext.Current.Resolve<IPermissionService>();

            var Perssions = this.Permission.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var item in Perssions)
            {
                if (permissionService.Authorize(item))
                {
                    return true;
                }
            }
            return false;
        }
    }
}
