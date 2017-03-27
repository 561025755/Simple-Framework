using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SD.Web.Controllers
{
    public class ErrorController : Controller
    {
        // GET: Error
        public ActionResult Index()
        {
            ViewBag.Code = 500;
            ViewBag.Message = "您请求访问页面过程中系统发生了未知错误";
            ViewBag.Description = "很抱歉，系统发生了未知错误，可能是由于业务服务程序发生内部错误。";

            return View("Error");
        }

        [ActionName("404")]
        public ActionResult Http_404()
        {
            ViewBag.Code = 404;
            ViewBag.Message = "您请求访问页面未找到";
            ViewBag.Description = "很抱歉，您请求访问的页面不存在，可能已被移除或者当前不可用，请稍后再重试。";

            return View("Error");
        }

        [ActionName("403")]
        public ActionResult Http_403()
        {
            ViewBag.Code = 403;
            ViewBag.Message = "您使用所提供的凭据无权查看此目录或页面";
            ViewBag.Description = "很抱歉，您的访问请求被拒绝，此错误意味着您可以连接到该网站，但是没有查看该网页的权限。";

            return View("Error");
        }

    }
}