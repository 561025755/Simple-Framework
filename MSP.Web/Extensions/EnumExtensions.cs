using SD.Core.Enum;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;

namespace SD.Web
{
    public static class EnumExtensions
    {
        public static List<SelectListItem> ToSelectList<TEnum>(bool withText = false)
        {

            var type = typeof(TEnum);

            var items = new List<SelectListItem>();

            if (type.IsEnum)
            {
                var fileds = type.GetFields(BindingFlags.Static | BindingFlags.Public | BindingFlags.GetField);

                foreach (var fieldInfo in fileds)
                {

                    var attribute = fieldInfo.GetCustomAttributes(typeof(DescAttribute), false).FirstOrDefault() as DescAttribute;

                    var value = fieldInfo.GetRawConstantValue() == null ? fieldInfo.Name : fieldInfo.GetRawConstantValue().ToString();

                    if (attribute != null)
                    {
                        items.Add(withText
                            ? new SelectListItem { Text = attribute.Description, Value = fieldInfo.Name }
                            : new SelectListItem { Text = attribute.Description, Value = value });
                    }
                    else
                    {
                        items.Add(new SelectListItem { Text = fieldInfo.Name, Value = value });
                    }

                }


            }
            return items;
        }

        /// <summary>
        /// 获取描述信息
        /// </summary>
        /// <param name="en">枚举</param>
        /// <returns></returns>
        public static string GetEnumDes(this Enum en)
        {
            Type type = en.GetType();
            MemberInfo[] memInfo = type.GetMember(en.ToString());
            if (memInfo != null && memInfo.Length > 0)
            {
                object[] attrs = memInfo[0].GetCustomAttributes(typeof(System.ComponentModel.DescriptionAttribute), false);
                if (attrs != null && attrs.Length > 0)
                    return ((DescriptionAttribute)attrs[0]).Description;
            }
            return en.ToString();
        }

    }
}