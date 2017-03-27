using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

using SD.FrameWork.UI.Grid;
using SD.Interface;
using SD.Core.Domain;
using SD.Core;
using SD.Models.Domain;
using SD.FrameWork.ViewEngines.HttpPost;
using SD.FrameWork.Controllers;

namespace SD.Web.Controllers
{
    [Auth("ManageLogs")]
    public class LogController : BaseAdminController
    {
        private readonly ILogService logService;

        public LogController(ILogService logService)
        {
            this.logService = logService;
        }

        //
        // GET: /Log/

        public ActionResult Index(GridSortOptions sort, int? page,bool IncludeUnknown =false)
        {
            ViewData["sort"] = sort;
            ViewData["IncludeUnknown"] = IncludeUnknown;
            var pageModel = this.logService.Page(page.GetValueOrDefault(1), DEFAULT_PAGE_SIZE, sort.Setup(), IncludeUnknown);

            return View(pageModel);
        }
        

        public ActionResult Details(int id)
        {
            return View(this.logService.Get(id).MapTo<LogModel>());
        }

        //
        // GET: /Log/Delete/5

        public ActionResult Delete(int id)
        {
            return View(this.logService.Get(id).MapTo<LogModel>());
        }

        //
        // POST: /Log/Delete/5

        [HttpPost]
         [ValidateReHttpPostToken]
        public ActionResult Delete(LogModel model)
        {
            try
            {
                this.logService.Delete(model.Id);

                SuccessNotification(string.Format("您就在刚才成功删除了一条编号为\"{0}\"的系统日志。", model.Id));
            }
            catch (Exception ex)
            {
                ErrorNotification(string.Format("删除系统日志过程中发生错误：\"{0}\"。", ex.Message));
            }

            return RedirectToAction("Index");
        }
    }
}
