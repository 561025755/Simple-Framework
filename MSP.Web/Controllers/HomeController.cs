using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using SD.Interface;
using SD.FrameWork.Caching;
using SD.Core.Enum;
using SD.Core.Domain;

namespace SD.Web.Controllers
{
    public class HomeController : BaseAdminController
    {
        #region 构造
        private readonly IUserService userService;
        private readonly ICacheManager cacheManager;
        public HomeController(
            IUserService userService,
            ICacheManager cacheManager
            )
        {
            this.userService = userService;
            this.cacheManager = cacheManager;
        }

        #endregion

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
}