using System.Web;
using System.Web.Optimization;

namespace SD.Web
{
    public class BundleConfig
    {
        // 有关绑定的详细信息，请访问 http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            #region JavaScript

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Content/themes/sean/jquery-1.9.1.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Content/themes/sean/jquery.validate*"));

            // 使用要用于开发和学习的 Modernizr 的开发版本。然后，当你做好
            // 生产准备时，请使用 http://modernizr.com 上的生成工具来仅选择所需的测试。
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/respond.js"));

            bundles.Add(new ScriptBundle("~/bundles/wysihtml5").Include(
                "~/Content/themes/sean/bootstrap-wysihtml5.js"));

            bundles.Add(new ScriptBundle("~/bundles/themes/sean/crossbrowserjs").Include(
                "~/Content/themes/sean/crossbrowserjs/html5shiv.js",
                "~/Content/themes/sean/crossbrowserjs/respond.min.js",
                "~/Content/themes/sean/crossbrowserjs/excanvas.min.js"));


            bundles.Add(new ScriptBundle("~/bundles/themes/sean/base").Include(
                "~/Content/themes/sean/jquery-1.9.1.min.js",
                "~/Content/themes/sean/jquery-migrate-1.1.0.min.js",
                "~/Content/themes/sean/jquery-ui.min.js",
                "~/Content/themes/sean/bootstrap.min.js",
                "~/Content/themes/sean/jquery.slimscroll.min.js",
                "~/Content/themes/sean/jquery.cookie.js",
                "~/Content/themes/sean/gritter/js/jquery.gritter.js",
                "~/Content/themes/sean/pageevent.js"));

            bundles.Add(new ScriptBundle("~/bundles/themes/sean/gritter").Include(
               "~/Content/themes/sean/gritter/js/jquery.gritter.js"));

            bundles.Add(new ScriptBundle("~/bundles/themes/sean/apps").Include(
                "~/Content/themes/sean/apps.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/themes/sean/login").Include(
             "~/Content/themes/sean/jquery-1.9.1.min.js",
             "~/Content/themes/sean/jquery-migrate-1.1.0.min.js",
             "~/Content/themes/sean/jquery-ui.min.js",
             "~/Content/themes/sean/bootstrap.min.js",
             "~/Content/themes/sean/jquery.slimscroll.min.js",
             "~/Content/themes/sean/jquery.cookie.js",
             "~/Content/themes/sean/apps.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/themes/sean/source").Include(
             "~/Content/themes/sean/jquery-1.9.1.min.js",
             "~/Content/themes/sean/jquery-migrate-1.1.0.min.js",
             "~/Content/themes/sean/bootstrap.min.js",
             "~/Content/themes/sean/jquery.cookie.js",
             "~/Content/themes/sean/scrollMonitor.js",
             "~/Content/themes/sean/source.apps.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/flot").Include(
                "~/Content/flot/jquery.flot.min.js",
                "~/Content/flot/jquery.flot.time.min.js",
                "~/Content/flot/jquery.flot.resize.min.js",
                "~/Content/flot/jquery.flot.pie.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/themes/sean/pace").Include(
                "~/Content/themes/sean/pace.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/themes/sean/chart").Include(
                "~/Content/highcharts/highcharts.js"));


            bundles.Add(new ScriptBundle("~/bundles/fileupload/js").Include(
                        "~/Content/file-upload/js/vendor/jquery.ui.widget.js",
                        "~/Content/file-upload/js/vendor/tmpl.js",
                        "~/Content/file-upload/js/vendor/load-image.js",
                        "~/Content/file-upload/js/vendor/canvas-to-blob.js",
                        "~/Content/file-upload/js/vendor/jquery.blueimp-gallery.js",

                        "~/Content/file-upload/js/jquery.iframe-transport.js",
                        "~/Content/file-upload/js/jquery.fileupload.js",
                        "~/Content/file-upload/js/jquery.fileupload-process.js",
                        "~/Content/file-upload/js/jquery.fileupload-image.js",
                        "~/Content/file-upload/js/jquery.fileupload-audio.js",
                        "~/Content/file-upload/js/jquery.fileupload-video.js",
                        "~/Content/file-upload/js/jquery.fileupload-validate.js",
                        "~/Content/file-upload/js/jquery.fileupload-ui.js"));

            bundles.Add(new ScriptBundle("~/bundles/diagram/js").Include(
                "~/Content/themes/metroboard/jquery-1.8.2.js",
                "~/Content/themes/metroboard/unitl.js",
                 "~/Content/themes/metroboard/Schema.js",
                 "~/Content/themes/metroboard/themes.js",
                 "~/Content/themes/metroboard/basic.js",
                 "~/Content/themes/metroboard/collaboration.js",
                 "~/Content/themes/metroboard/designer.core.js",
                 "~/Content/themes/metroboard/designer.methods.js",
                 "~/Content/themes/metroboard/designer.events.js",
                 "~/Content/themes/metroboard/designer.ui.js",
                 "~/Content/themes/metroboard/export.js",
                 "~/Content/themes/metroboard/exportsvg.js",
                 "~/Content/themes/metroboard/svg.js",
                 "~/Content/themes/metroboard/svg.export.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/tagsinput/js").Include(
                "~/Content/tagsinput-0.5.0/bootstrap-tagsinput.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/datatables/js").Include(
               "~/Content/datatables/js/jquery.dataTables.js"));

            #endregion

            #region CSS

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/site.css"));

            bundles.Add(new StyleBundle("~/Content/themes/sean/css/base").Include(
                "~/Content/themes/sean/css/icon.css",
                "~/Content/themes/sean/css/jquery-ui.min.css",
                "~/Content/themes/sean/css/bootstrap.min.css",
                "~/Content/themes/sean/css/animate.min.css",
                "~/Content/themes/sean/css/style.min.css",
                "~/Content/themes/sean/css/style-responsive.min.css",
                "~/Content/themes/sean/css/orange.css",
                "~/Content/useraddstyle.css"));

            bundles.Add(new StyleBundle("~/Content/themes/sean/font-awesome/css/base").Include(
                "~/Content/themes/sean/font-awesome/css/font-awesome.min.css"));


            bundles.Add(new StyleBundle("~/Content/themes/sean/source").Include(
                "~/Content/themes/sean/css/bootstrap.min.css",
                "~/Content/themes/sean/font-awesome/css/font-awesome.min.css",
                "~/Content/themes/sean/css/animate.min.css",
                "~/Content/themes/sean/css/source.style.min.css",
                "~/Content/themes/sean/css/style-responsive.min.css",
                "~/Content/themes/sean/css/default.css"));

            bundles.Add(new StyleBundle("~/Content/flag/flag-icon").Include(
                "~/Content/flag/flag-icon.css"));

            bundles.Add(new StyleBundle("~/Content/file-upload/css/css").Include(
                        "~/Content/file-upload/css/jquery.fileupload.css",
                        "~/Content/file-upload/css/jquery.fileupload-ui.css"));

            bundles.Add(new StyleBundle("~/Content/themes/metroboard").Include(
                "~/Content/themes/metroboard/global.css",
               "~/Content/themes/metroboard/designer.css",
               "~/Content/themes/metroboard/ui.css"));

            bundles.Add(new StyleBundle("~/Content/themes/sean/gritter/css").Include(
                        "~/Content/themes/sean/gritter/css/jquery.gritter.css"));

            bundles.Add(new StyleBundle("~/Content/datatables/css").Include(
                        "~/Content/datatables/css/jquery.dataTables.css"));

            #endregion






        }
    }
}
