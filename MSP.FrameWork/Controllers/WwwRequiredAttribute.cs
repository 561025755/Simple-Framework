using SD.Core.Domain.Settings;
using SD.FrameWork.Context;
using SD.FrameWork.Engine;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace SD.FrameWork.Controllers
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, Inherited = true, AllowMultiple = false)]
    public class WwwRequiredAttribute : FilterAttribute, IAuthorizationFilter
    {
        public virtual void OnAuthorization(AuthorizationContext filterContext)
        {
            if (filterContext == null)
                throw new ArgumentNullException("filterContext");

            //don't apply filter to child methods
            if (filterContext.IsChildAction)
                return;

            // only redirect for GET requests, 
            // otherwise the browser might not propagate the verb and request body correctly.
            if (!String.Equals(filterContext.HttpContext.Request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
                return;

            //ignore this rule for localhost
            if (filterContext.HttpContext.Request.IsLocal)
                return;

            var commonSettings = EngineContext.Current.Resolve<CommonSettings>();

            switch (commonSettings.WwwRequired)
            {
                case (int)Www.WithWww:
                    {
                        var webHelper = EngineContext.Current.Resolve<IWebContext>();
                        string url = webHelper.GetThisPageUrl(true);
                        var currentConnectionSecured = webHelper.IsCurrentConnectionSecured();
                        if (currentConnectionSecured)
                        {
                            bool startsWith3W = url.StartsWith("https://www.", StringComparison.OrdinalIgnoreCase);
                            if (!startsWith3W)
                            {
                                url = url.Replace("https://", "https://www.");

                                //301 (permanent) redirection
                                filterContext.Result = new RedirectResult(url, true);
                            }
                        }
                        else
                        {
                            bool startsWith3W = url.StartsWith("http://www.", StringComparison.OrdinalIgnoreCase);
                            if (!startsWith3W)
                            {
                                url = url.Replace("http://", "http://www.");

                                //301 (permanent) redirection
                                filterContext.Result = new RedirectResult(url, true);
                            }
                        }
                    }
                    break;
                case (int)Www.WithoutWww:
                    {
                        var webHelper = EngineContext.Current.Resolve<IWebContext>();
                        string url = webHelper.GetThisPageUrl(true);
                        var currentConnectionSecured = webHelper.IsCurrentConnectionSecured();
                        if (currentConnectionSecured)
                        {
                            bool startsWith3W = url.StartsWith("https://www.", StringComparison.OrdinalIgnoreCase);
                            if (startsWith3W)
                            {
                                url = url.Replace("https://www.", "https://");

                                //301 (permanent) redirection
                                filterContext.Result = new RedirectResult(url, true);
                            }
                        }
                        else
                        {
                            bool startsWith3W = url.StartsWith("http://www.", StringComparison.OrdinalIgnoreCase);
                            if (startsWith3W)
                            {
                                url = url.Replace("http://www.", "http://");

                                //301 (permanent) redirection
                                filterContext.Result = new RedirectResult(url, true);
                            }
                        }
                    }
                    break;
                case (int)Www.NoMatter:
                    {
                        //do nothing
                    }
                    break;
                default:
                    throw new Exception("Not supported WwwRequirement parameter");
            }
        }
    }
}
