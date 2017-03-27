using SD.Core.Domain;
using SD.FrameWork.Context;
using SD.FrameWork.Controllers;
using SD.FrameWork.Engine;
using SD.FrameWork.Security;
using SD.FrameWork.ViewEngines.SessionTimeout;
using SD.Interface;
using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace SD.Web.Controllers
{
    //[AdminValidateIpAddress]
    //[AdminAuthorize]
    //[SessionTimeout(IsChecked = true)]
    //[HttpsRequired(SSL.Yes)]
    public abstract partial class BaseAdminController : BaseController
    {
        

        /// <summary>
        /// Initialize controller
        /// </summary>
        /// <param name="requestContext">Request context</param>
        protected override void Initialize(System.Web.Routing.RequestContext requestContext)
        {
            //set work context to admin mode
            //EngineContext.Current.Resolve<IWorkContext>().IsAdmin = true;

            base.Initialize(requestContext);
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            //base.OnActionExecuting(filterContext);
        }

        /// <summary>
        /// On exception
        /// </summary>
        /// <param name="filterContext">Filter context</param>
        //protected override void OnException(ExceptionContext filterContext)
        //{
        //    if (filterContext.Exception != null)
        //        LogException(filterContext.Exception);
        //    base.OnException(filterContext);
        //}

        /// <summary>
        /// Access denied view
        /// </summary>
        /// <returns>Access denied view</returns>
        //protected ActionResult AccessDeniedView()
        //{
        //    //return new HttpUnauthorizedResult();
        //    return RedirectToAction("AccessDenied", "Security", new { pageUrl = this.Request.RawUrl });
        //}
    }
}
