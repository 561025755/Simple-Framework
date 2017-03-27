using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace SD.FrameWork.Controllers
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, Inherited = true, AllowMultiple = true)]
    public class LoginRequiredAttribute : FilterAttribute, IAuthorizationFilter
    {
        private readonly bool _dontValidate = false;


        public LoginRequiredAttribute()
            : this(false)
        {
        }

        public LoginRequiredAttribute(bool dontValidate)
        {
            this._dontValidate = dontValidate;
        }

        private void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            filterContext.Result = new HttpUnauthorizedResult();
        }

        private IEnumerable<LoginRequiredAttribute> GetLoginRequiredAttributes(ActionDescriptor descriptor)
        {
            return descriptor.GetCustomAttributes(typeof(LoginRequiredAttribute), true)
                .Concat(descriptor.ControllerDescriptor.GetCustomAttributes(typeof(LoginRequiredAttribute), true))
                .OfType<LoginRequiredAttribute>();
        }

        private bool IsLoginRequiredPageRequested(AuthorizationContext filterContext)
        {
            var requiredAttributes = GetLoginRequiredAttributes(filterContext.ActionDescriptor);
            if (requiredAttributes != null && requiredAttributes.Any())
                return true;
            return false;
        }

        public void OnAuthorization(AuthorizationContext filterContext)
        {
            if (_dontValidate)
                return;

            if (filterContext == null)
                throw new ArgumentNullException("filterContext");

            if (OutputCacheAttribute.IsChildActionCacheActive(filterContext))
                throw new InvalidOperationException("You cannot use [LoginRequired] attribute when a child action cache is active");

            if (IsLoginRequiredPageRequested(filterContext))
            {
                if (!this.HasLoginRequiredAccess(filterContext))
                    this.HandleUnauthorizedRequest(filterContext);
            }
        }

        public virtual bool HasLoginRequiredAccess(AuthorizationContext filterContext)
        {
            return filterContext.HttpContext.User.Identity.IsAuthenticated;
        }
    }
}
