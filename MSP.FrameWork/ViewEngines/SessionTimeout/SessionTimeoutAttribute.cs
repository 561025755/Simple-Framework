using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace SD.FrameWork.ViewEngines.SessionTimeout
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class SessionTimeoutAttribute : FilterAttribute, IAuthorizationFilter
    {
        public bool IsChecked { get; set; }
        public  void OnAuthorization(AuthorizationContext filterContext)
        {

            var loginUser = filterContext.HttpContext.Session["User"];
            //When user has not login yet
            if (loginUser == null && IsChecked)
            {
                //var redirectUrl = "/Account/Login?ReturnUrl=" + filterContext.HttpContext.Request.Url;
                filterContext.Result = new HttpUnauthorizedResult();
                return;
            }
            else
            {
                filterContext.HttpContext.Session["User"] = loginUser;
            }
        }
    }
}
