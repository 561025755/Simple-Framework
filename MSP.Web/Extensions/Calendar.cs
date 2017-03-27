using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using System.Web;

namespace SD.Web
{
    /// <summary>
    /// Extended the HtmlHelper for Calendar
    /// </summary>
    public static class CalendarExtensions
    {
        private static string defaultFormat = "yyyy-MM-dd";

        /// <summary>
        /// 使用特定的名称生成控件
        /// </summary>
        /// <param name="helper">HtmlHelper对象</param>
        /// <param name="name">控件名称</param>
        /// <returns>Html文本</returns>
        public static MvcHtmlString Calendar(this HtmlHelper helper, string name)
        {
            return Calendar(helper, name, defaultFormat);
        }

        /// <summary>
        /// 使用特定的名称生成控件
        /// </summary>
        /// <param name="helper">HtmlHelper对象</param>
        /// <param name="name">控件名称</param>
        /// <param name="format">显示格式</param>
        /// <returns>Html文本</returns>
        public static MvcHtmlString Calendar(this HtmlHelper helper, string name, string format)
        {
            return GenerateHtml(name, null, format);
        }

        /// <summary>
        /// 使用特定的名称和初始值生成控件
        /// </summary>
        /// <param name="helper">HtmlHelper对象</param>
        /// <param name="name">控件名称</param>
        /// <param name="date">要显示的日期时间</param>
        /// <returns>Html文本</returns>
        public static MvcHtmlString Calendar(this HtmlHelper helper, string name, DateTime date)
        {
            return Calendar(helper, name, date, defaultFormat);
        }

        /// <summary>
        /// 使用特定的名称和初始值生成控件
        /// </summary>
        /// <param name="helper">HtmlHelper对象</param>
        /// <param name="name">控件名称</param>
        /// <param name="date">要显示的日期时间</param>
        /// <param name="format">显示格式</param>
        /// <returns>Html文本</returns>
        public static MvcHtmlString Calendar(this HtmlHelper helper, string name, DateTime date, string format)
        {
            return GenerateHtml(name, date, format);
        }

        /// <summary>
        /// 通过lambda表达式生成控件
        /// </summary>
        /// <param name="helper">HtmlHelper对象</param>
        /// <param name="expression">lambda表达式，指定要显示的属性及其所属对象</param>
        /// <returns>Html文本</returns>
        public static MvcHtmlString CalendarFor<TModel, TProperty>(this HtmlHelper<TModel> helper, Expression<Func<TModel, TProperty>> expression)
        {
            return CalendarFor(helper, expression, defaultFormat);
        }


        /// <summary>
        /// 通过lambda表达式生成控件
        /// </summary>
        /// <param name="helper">HtmlHelper对象</param>
        /// <param name="expression">lambda表达式，指定要显示的属性及其所属对象</param>
        /// <param name="format">显示格式</param>
        /// <returns>Html文本</returns>
        public static MvcHtmlString CalendarFor<TModel, TProperty>(this HtmlHelper<TModel> helper, Expression<Func<TModel, TProperty>> expression, string format)
        {
            string name = ExpressionHelper.GetExpressionText(expression);
            DateTime value;

            object data = ModelMetadata.FromLambdaExpression<TModel, TProperty>(expression, helper.ViewData).Model;
            if (data != null && DateTime.TryParse(data.ToString(), out value))
            {
                return helper.TextBox(name, value.ToString(format), new { @class = "form-control" });
                //return GenerateHtml(name, value, format);
            }
            else
            {
                return helper.TextBox(name,null, new { @class = "form-control" });
                //return GenerateHtml(name, null, format);
            }
        }



        /// <summary>
        /// 通过lambda表达式生成控件
        /// </summary>
        /// <typeparam name="TModel"></typeparam>
        /// <typeparam name="TProperty"></typeparam>
        /// <param name="helper"></param>
        /// <param name="expression"></param>
        /// <param name="htmlAttributes">html属性</param>
        /// <returns></returns>
        public static MvcHtmlString CalendarFor<TModel, TProperty>(this HtmlHelper<TModel> helper, Expression<Func<TModel, TProperty>> expression, Object htmlAttributes) {
            return CalendarFor(helper,expression, defaultFormat, htmlAttributes);
        }



        /// <summary>
        /// 通过lambda表达式生成控件
        /// </summary>
        /// <typeparam name="TModel"></typeparam>
        /// <typeparam name="TProperty"></typeparam>
        /// <param name="helper"></param>
        /// <param name="expression"></param>
        /// <param name="format">格式化字符串</param>
        /// <param name="htmlAttributes">html属性</param>
        /// <returns></returns>
        public static MvcHtmlString CalendarFor<TModel, TProperty>(this HtmlHelper<TModel> helper, Expression<Func<TModel, TProperty>> expression, string format, Object htmlAttributes)
        {
            string name = ExpressionHelper.GetExpressionText(expression);
            DateTime value;

            object data = ModelMetadata.FromLambdaExpression<TModel, TProperty>(expression, helper.ViewData).Model;
            if (data != null && DateTime.TryParse(data.ToString(), out value))
            {
                return helper.TextBox(name, value.ToString(format), htmlAttributes);
            }
            else
            {
                return helper.TextBox(name, null, htmlAttributes);
            }
        }


        /// <summary>
        /// 通过lambda表达式获取要显示的日期时间
        /// </summary>
        /// <param name="helper">HtmlHelper对象</param>
        /// <param name="expression">lambda表达式，指定要显示的属性及其所属对象</param>
        /// <param name="format">显示格式</param>
        /// <returns>Html文本</returns>
        public static MvcHtmlString CalendarDisplayFor<TModel, TProperty>(this HtmlHelper<TModel> helper, Expression<Func<TModel, TProperty>> expression, string format)
        {
            string name = ExpressionHelper.GetExpressionText(expression);
            DateTime value;

            object data = ModelMetadata.FromLambdaExpression<TModel, TProperty>(expression, helper.ViewData).Model;
            if (data != null && DateTime.TryParse(data.ToString(), out value))
            {
                return new MvcHtmlString(value.ToString(format));
            }
            else
            {
                return new MvcHtmlString(string.Empty);
            }
        }

        /// <summary>
        /// 通过lambda表达式获取要显示的日期时间
        /// </summary>
        /// <param name="helper">HtmlHelper对象</param>
        /// <param name="expression">lambda表达式，指定要显示的属性及其所属对象</param>
        /// <returns>Html文本</returns>
        public static MvcHtmlString CalendarDisplayFor<TModel, TProperty>(this HtmlHelper<TModel> helper, Expression<Func<TModel, TProperty>> expression)
        {
            return CalendarDisplayFor(helper, expression, defaultFormat);
        }

        /// <summary>
        /// 生成输入框的Html
        /// </summary>
        /// <param name="name">calendar的名称</param>
        /// <param name="date">calendar的值</param>
        /// <returns>html文本</returns>
        private static MvcHtmlString GenerateHtml(string name, DateTime? date, string format)
        {
            if (date != null)
            {
                return new MvcHtmlString(string.Format("<input type=\"text\" id=\"{0}\" name=\"{0}\"  class=\"form-control\" value=\"{1}\" />", name, date.Value.ToString(format)));
            }
            else
            {
                return new MvcHtmlString(string.Format("<input type=\"text\" id=\"{0}\" name=\"{0}\" class=\"form-control\" value=\"\" />",name));
            }
        }
    }
}