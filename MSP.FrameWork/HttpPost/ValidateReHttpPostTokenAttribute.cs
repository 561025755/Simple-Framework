using SD.Core.Enum.UI;
using System;
using System.Collections.Generic;
using System.Web.Mvc;

namespace SD.FrameWork.ViewEngines.HttpPost
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public sealed class ValidateReHttpPostTokenAttribute : FilterAttribute, IAuthorizationFilter
    {
        public IPageTokenView PageTokenView { get; set; }
        /// <summary>
        /// 重复提交后跳转的结果页面
        /// </summary>
        public string ResultAction { get; set; }
        /// <summary>
        /// Initializes a new instance of the <see cref="ValidateReHttpPostTokenAttribute"/> class.
        /// </summary>
        public ValidateReHttpPostTokenAttribute()
        {
            //It would be better use DI inject it.
            PageTokenView = new SessionPageTokenView();
        }

        /// <summary>
        /// Called when authorization is required.
        /// </summary>
        /// <param name="filterContext">The filter context.</param>
        public void OnAuthorization(AuthorizationContext filterContext)
        {
            if (filterContext == null)
            {
                throw new ArgumentNullException("filterContext");
            }

            if (!PageTokenView.TokensMatch)
            {
                if (string.IsNullOrEmpty(ResultAction))
                {
                    string errorKey = $"ds.notifications.{NotifyType.Error}";
                    if (filterContext.Controller.TempData[errorKey] == null)
                        filterContext.Controller.TempData[errorKey] = new List<string>();
                    ((List<string>)filterContext.Controller.TempData[errorKey]).Add("repeated submit");

                    filterContext.Result = new RedirectResult("/Home/Index");
                }
                else
                    filterContext.Result = new RedirectResult(ResultAction);
                //filterContext.Result = new EmptyResult(); 
            }

        }
    }
}
