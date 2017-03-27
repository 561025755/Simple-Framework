using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using System.Web;
using System.Linq.Expressions;

using SD.Core.Enum;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Text;
using SD.FrameWork.OAuth2.HttpUtility;
using SD.FrameWork.ViewEngines.HttpPost;

namespace SD.Web
{
    public static class HtmlExtensions
    {
        public static string ImageUrl(this HtmlHelper helper, int imageId, int size = 256)
        {
            return helper.Action("MediaFileUrl", "Media", new { id = imageId, size = size }).ToString();
        }

        public static MvcHtmlString DateDiffNow(this HtmlHelper helper, DateTime? datetime)
        {
            if (datetime.HasValue)
            {
                TimeSpan timeSpan = DateTime.Now - datetime.Value;
                if (timeSpan.Days < 1)
                {
                    return new MvcHtmlString(string.Format("{0} 小时", timeSpan.Hours));
                }

                return new MvcHtmlString(string.Format("{0} 天", timeSpan.Days));
            }

            return new MvcHtmlString("未知");
        }

        public static MvcHtmlString DateDescDiffNow(this HtmlHelper helper, DateTime scheduleStartDate)
        {
            if (scheduleStartDate < DateTime.Now)
                return new MvcHtmlString("无效预订");

            TimeSpan timeSpan = scheduleStartDate - DateTime.Now;
            if (timeSpan.Days < 1)
            {
                return new MvcHtmlString(string.Format("{0} 小时", timeSpan.Hours));
            }

            return new MvcHtmlString(string.Format("{0} 天", timeSpan.Days));
        }

        public static MvcHtmlString DateDiffNowCountdown(this HtmlHelper helper, DateTime? dealWithTime, int day)
        {
            if (dealWithTime.HasValue)
            {
                //过期时间
                DateTime deadlineTime = dealWithTime.Value.AddDays(day);

                TimeSpan ts = deadlineTime.Subtract(DateTime.Now);
                if (ts.Days > 0)
                {
                    return new MvcHtmlString(string.Format("{0} 天", ts.Days));
                }
                else
                {
                    if (ts.Hours > 0)
                    {
                        return new MvcHtmlString(string.Format("{0} 小时", ts.Hours));
                    }
                    else
                    {
                        if (ts.Minutes > 0)
                        {
                            return new MvcHtmlString(string.Format("{0} 分钟", ts.Minutes));
                        }
                        else
                        {
                            return new MvcHtmlString(string.Format("{0} 分钟", 0));
                        }
                    }

                }
            }
            return new MvcHtmlString("未知");
        }


        public static MvcHtmlString RowActionLink(this HtmlHelper helper, string controllerName, int id, string detailsAction = "Details", string editAction = "Edit", string deleteAction = "Delete")
        {
            StringBuilder linkString = new StringBuilder();

            if (!string.IsNullOrWhiteSpace(detailsAction))
            {
                TagBuilder details = new TagBuilder("a");

                details.MergeAttribute("class", "email-btn");
                details.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action(detailsAction, controllerName, new { id = id }));
                details.InnerHtml = "<i class=\"fa fa-folder-open\" data-toggle=\"tooltip\"  data-original-title=\"详情\"></i>";

                linkString.Append(details);
            }

            if (!string.IsNullOrWhiteSpace(editAction))
            {
                TagBuilder edit = new TagBuilder("a");

                edit.MergeAttribute("class", "email-btn");
                edit.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action(editAction, controllerName, new { id = id }));
                edit.InnerHtml = "<i class=\"fa fa-floppy-o\" data-toggle=\"tooltip\"  data-original-title=\"编辑\"></i>";

                linkString.Append(edit);
            }
            if (!string.IsNullOrWhiteSpace(deleteAction))
            {
                TagBuilder delete = new TagBuilder("a");

                delete.MergeAttribute("class", "email-btn");
                delete.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action(deleteAction, controllerName, new { id = id }));
                delete.InnerHtml = "<i class=\"fa fa-trash-o\" data-toggle=\"tooltip\"  data-original-title=\"删除\"></i>";

                linkString.Append(delete);
            }

            return new MvcHtmlString(linkString.ToString());
        }


        public static MvcHtmlString RowActionLink(this HtmlHelper helper, int id, string detailsAction = "Details", string editAction = "Edit", string deleteAction = "Delete")
        {
            StringBuilder linkString = new StringBuilder();

            if (!string.IsNullOrWhiteSpace(detailsAction))
            {
                TagBuilder details = new TagBuilder("a");

                details.MergeAttribute("class", "email-btn");
                details.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action(detailsAction, new { id = id }));
                details.InnerHtml = "<i class=\"fa fa-folder-open\" data-toggle=\"tooltip\"  data-original-title=\"详情\"></i>";

                linkString.Append(details);
            }

            if (!string.IsNullOrWhiteSpace(editAction))
            {
                TagBuilder edit = new TagBuilder("a");

                edit.MergeAttribute("class", "email-btn");
                edit.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action(editAction, new { id = id }));
                edit.InnerHtml = "<i class=\"fa fa-floppy-o\" data-toggle=\"tooltip\"  data-original-title=\"编辑\"></i>";

                linkString.Append(edit);
            }
            if (!string.IsNullOrWhiteSpace(deleteAction))
            {
                TagBuilder delete = new TagBuilder("a");

                delete.MergeAttribute("class", "email-btn");
                delete.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action(deleteAction, new { id = id }));
                delete.InnerHtml = "<i class=\"fa fa-trash-o\" data-toggle=\"tooltip\"  data-original-title=\"删除\"></i>";

                linkString.Append(delete);
            }

            return new MvcHtmlString(linkString.ToString());
        }

        public static MvcHtmlString RowActionLink(this HtmlHelper helper, int id)
        {
            TagBuilder details = new TagBuilder("a");

            details.MergeAttribute("class", "email-btn");
            details.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action("Details", new { id = id }));
            details.InnerHtml = "<i class=\"fa fa-folder-open\" data-toggle=\"tooltip\"  data-original-title=\"详情\"></i>";

            TagBuilder edit = new TagBuilder("a");

            edit.MergeAttribute("class", "email-btn");
            edit.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action("Edit", new { id = id }));
            edit.InnerHtml = "<i class=\"fa fa-floppy-o\" data-toggle=\"tooltip\"  data-original-title=\"编辑\"></i>";

            TagBuilder delete = new TagBuilder("a");

            delete.MergeAttribute("class", "email-btn");
            delete.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action("Delete", new { id = id }));
            delete.InnerHtml = "<i class=\"fa fa-trash-o\" data-toggle=\"tooltip\"  data-original-title=\"删除\"></i>";

            return new MvcHtmlString(string.Format("{0} {1} {2}", details, edit, delete));
        }

        public static MvcHtmlString RowVerifyActionLink(this HtmlHelper helper, int id)
        {
            TagBuilder edit = new TagBuilder("a");

            edit.MergeAttribute("class", "email-btn");
            edit.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action("Verify", new { id = id }));
            edit.InnerHtml = "<i class=\"fa fa-floppy-o\" data-toggle=\"tooltip\"  data-original-title=\"审核\"></i>";

            return new MvcHtmlString(string.Format("{0}", edit));
        }

        public static MvcHtmlString RowNoEditActionLink(this HtmlHelper helper, int id)
        {
            TagBuilder details = new TagBuilder("a");

            details.MergeAttribute("class", "email-btn");
            details.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action("Details", new { id = id }));
            details.InnerHtml = "<i class=\"fa fa-folder-open\" data-toggle=\"tooltip\"  data-original-title=\"详情\"></i>";

            TagBuilder delete = new TagBuilder("a");

            delete.MergeAttribute("class", "email-btn");
            delete.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action("Delete", new { id = id }));
            delete.InnerHtml = "<i class=\"fa fa-trash-o\" data-toggle=\"tooltip\"  data-original-title=\"删除\"></i>";

            return new MvcHtmlString(string.Format("{0} {1}", details, delete));
        }

        public static MvcHtmlString RowDescriptionActionLink(this HtmlHelper helper, int id)
        {
            TagBuilder details = new TagBuilder("a");

            details.MergeAttribute("class", "email-btn");
            details.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action("Details", new { id = id }));
            details.InnerHtml = "<i class=\"fa fa-folder-open\" data-toggle=\"tooltip\"  data-original-title=\"详情\"></i>";

            return new MvcHtmlString(details.ToString());
        }

        public static MvcHtmlString IconLink(this HtmlHelper helper, string iconName, string actionName, object routeValues)
        {
            TagBuilder a = new TagBuilder("a");

            a.MergeAttribute("class", "email-btn");
            a.MergeAttribute("href", new UrlHelper(helper.ViewContext.RequestContext).Action(actionName, routeValues));
            a.InnerHtml = string.Format("<i class=\"fa {0}\"></i>", iconName);

            return new MvcHtmlString(a.ToString());
        }

        public static string ParseGeoPointToJsonObj(this HtmlHelper helper, string geoPointText)
        {
            System.Text.RegularExpressions.Regex re = new System.Text.RegularExpressions.Regex(@"POINT\((\d*[.]?\d*)\s+(\d*[.]?\d*)\)");

            if (!string.IsNullOrWhiteSpace(geoPointText))
            {
                var m = re.Match(geoPointText);

                if (m.Success && m.Groups.Count > 2)
                {
                    return string.Format("{{lng:{0},lat:{1}}}", m.Groups[1].Value, m.Groups[2].Value);
                }
            }

            return "{lng:0,lat:0}";
        }

        public static MvcHtmlString Select2For<TModel>(this HtmlHelper<TModel> helper,
            Expression<Func<TModel, int?>> idExpression,
            Expression<Func<TModel, string>> nameExpression,
            object htmlAttributes = null)
        {
            IList<SelectListItem> items = new List<SelectListItem>();

            string fieldName = ExpressionHelper.GetExpressionText(idExpression);

            var model = helper.ViewData.Model;

            if (null != model)
            {
                var func = idExpression.Compile();

                int? id = func(model);

                var nameFunc = nameExpression.Compile();

                string name = nameFunc(model);

                items.Add(new SelectListItem { Value = id == null ? "" : id.ToString(), Text = string.IsNullOrWhiteSpace(name) ? "请选择一个选项" : name, Selected = true });
            }

            return helper.DropDownList(fieldName, items, htmlAttributes);
        }

        public static MvcHtmlString Select2For<TModel>(this HtmlHelper<TModel> helper,
            Expression<Func<TModel, int>> idExpression,
            Expression<Func<TModel, string>> nameExpression,
            object htmlAttributes = null)
        {
            IList<SelectListItem> items = new List<SelectListItem>();

            string fieldName = ExpressionHelper.GetExpressionText(idExpression);

            var model = helper.ViewData.Model;

            if (null != model)
            {
                var func = idExpression.Compile();

                int? id = func(model);

                var nameFunc = nameExpression.Compile();

                string name = nameFunc(model);

                items.Add(new SelectListItem { Value = id == null ? "" : id.ToString(), Text = string.IsNullOrWhiteSpace(name) ? "请选择一个选项" : name, Selected = true });
            }

            return helper.DropDownList(fieldName, items, htmlAttributes);
        }

        public static MvcHtmlString Select2For<TModel>(this HtmlHelper<TModel> helper,
            Expression<Func<TModel, string>> idExpression,
            Expression<Func<TModel, string>> nameExpression,
            object htmlAttributes = null)
        {
            IList<SelectListItem> items = new List<SelectListItem>();

            string fieldName = ExpressionHelper.GetExpressionText(idExpression);

            var model = helper.ViewData.Model;

            if (null != model)
            {
                var func = idExpression.Compile();

                string id = func(model);

                var nameFunc = nameExpression.Compile();

                string name = nameFunc(model);

                items.Add(new SelectListItem { Value = id == null ? "" : id, Text = string.IsNullOrWhiteSpace(name) ? "请选择一个选项" : name, Selected = true });
            }

            return helper.DropDownList(fieldName, items, htmlAttributes);
        }

        public static SelectList ToSelectList<TEnum>(this TEnum enumObj, bool textValue = false, SelectListItem extraItem = null, int[] valuesToExclude = null) where TEnum : struct
        {
            if (!typeof(TEnum).IsEnum) throw new ArgumentException("An Enumeration type is required.", "enumObj");

            List<SelectListItem> values = new List<SelectListItem>();

            if (textValue)
            {
                values = (from TEnum enumValue in Enum.GetValues(typeof(TEnum))
                          where valuesToExclude == null || !valuesToExclude.Contains(Convert.ToInt32(enumValue))
                          select new SelectListItem
                          {
                              Value = enumValue.ToString(),
                              Text = enumValue.ToString()
                          }).ToList();
            }
            else
            {
                values = (from TEnum enumValue in Enum.GetValues(typeof(TEnum))
                          where valuesToExclude == null || !valuesToExclude.Contains(Convert.ToInt32(enumValue))
                          select new SelectListItem
                          {
                              Value = Convert.ToInt32(enumValue).ToString(),
                              Text = enumValue.ToString()
                          }).ToList();
            }

            if (extraItem != null)
            {
                values.Insert(0, extraItem);
            }

            return new SelectList(values, "Value", "Text");
        }

        public static MvcHtmlString Truncate(this HtmlHelper htmlHelper, string text, int length)
        {
            //Regex re = new Regex("<[^>]+>", RegexOptions.Multiline);

            //text = re.Replace(text, "");

            if (string.IsNullOrWhiteSpace(text) || text.Length <= length)
            {
                return new MvcHtmlString(text);
            }
            else
            {
                return new MvcHtmlString(string.Format("{0} ...", text.Substring(0, length)));
            }
        }

        public static MvcHtmlString ConvertChineseUpper(this HtmlHelper htmlHelper, decimal? text)
        {
            if (text == null)
                return new MvcHtmlString("零");

            string s = text.Value.ToString("#L#E#D#C#K#E#D#C#J#E#D#C#I#E#D#C#H#E#D#C#G#E#D#C#F#E#D#C#.0B0A");

            string d = Regex.Replace(s, @"((?<=-|^)[^1-9]*)|((?'z'0)[0A-E]*((?=[1-9])|(?'-z'(?=[F-L\.]|$))))|((?'b'[F-L])(?'z'0)[0A-L]*((?=[1-9])|(?'-z'(?=[\.]|$))))", "${b}${z}");
            var upper = Regex.Replace(d, ".", m => "负元空零壹贰叁肆伍陆柒捌玖空空空空空空空分角拾佰仟万億兆京垓秭穰"[m.Value[0] - '-'].ToString());
            return new MvcHtmlString(upper);
        }

        public static string percentConvert(object d)
        {
            string back = "0";
            if (d == null)
                return back;
            else
            {
                back = (Convert.ToDecimal(d) * 100).ToString().Split('.')[0] + "%";
            }
            return back;
        }

        public static MvcHtmlString ShowField(this HtmlHelper htmlHelper, string text, string defaultText)
        {
            var htmlString = string.IsNullOrWhiteSpace(text) ? defaultText : text;

            return new MvcHtmlString(htmlString);
        }


        public static HtmlString GenerateVerficationToken(this HtmlHelper htmlhelper)
        {
            string formValue = Utility.Encrypt(HttpContext.Current.Session.SessionID + DateTime.Now.Ticks.ToString());
            HttpContext.Current.Session[PageTokenViewBase.SessionMyToken] = formValue;

            string fieldName = PageTokenViewBase.HiddenTokenName;
            TagBuilder builder = new TagBuilder("input");
            builder.Attributes["type"] = "hidden";
            builder.Attributes["name"] = fieldName;
            builder.Attributes["value"] = formValue;
            return new HtmlString(builder.ToString(TagRenderMode.SelfClosing));
        }

    }
}