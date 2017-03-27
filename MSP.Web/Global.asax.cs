using System;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using SD.FrameWork.Engine;
using SD.Interface;
using SD.FrameWork.Context;
using FluentValidation.Mvc;
using SD.Services.Tasks;


namespace SD.Web
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            EngineContext.Initialize(false);

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            //fluent validation
            DataAnnotationsModelValidatorProvider.AddImplicitRequiredAttributeForValueTypes = false;
            ModelValidatorProviders.Providers.Add(new FluentValidationModelValidatorProvider());

            TaskManager.Instance.Initialize();
            TaskManager.Instance.Start();
        }

        protected void LogException(Exception exc)  
        {
            if (exc == null)
                return;

            try
            {
                //log
                var logger = EngineContext.Current.Resolve<ILogService>();
                var workContext = EngineContext.Current.Resolve<IWorkContext>();
                logger.Error(exc.Message, exc, workContext.CurrentUser);
            }
            catch (Exception)
            {
                //don't throw new exception if occurs
            }
        }

        protected void Application_Error(Object sender, EventArgs e)
        {
            int statusCode = 500;
            string errorPath = "~/Error";

            var exception = Server.GetLastError();

            //log error
            LogException(exception);

            HttpException httpException = exception as HttpException;

            if (httpException != null)
            {
                statusCode = httpException.GetHttpCode();
            }

            switch (statusCode)
            {
                case 404: errorPath = "~/Error/404"; break;
                case 403: errorPath = "~/Error/403"; break;
            }

            Server.ClearError();

            Response.Redirect(errorPath, true);
        }

    }
}
