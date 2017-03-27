using System;
using System.Linq;
using System.Reflection;

namespace SD.Core.Attributes
{
    /// <summary>
    /// 枚举类型描述属性
    /// </summary>
    [AttributeUsage(AttributeTargets.All, AllowMultiple = true)]
    public class DescAttribute : Attribute
    {
        /// <summary>
        /// 描述属性构造方法
        /// </summary>
        /// <param name="description"></param>
        public DescAttribute(string description)
        {
            this.Description = description;
        }

        /// <summary>
        /// 描述
        /// </summary>
        public string Description { get; private set; }
    }

    /// <summary>
    /// 枚举类型扩展类
    /// </summary>
    public static class EnumExtensions
    {
        /// <summary>
        /// 获得枚举类型描述属性值
        /// </summary>
        /// <param name="provider"></param>
        /// <returns></returns>
        public static string GetDescription(this ICustomAttributeProvider provider)
        {
            if (provider != null)
            {
                var attributes = (DescAttribute[])provider.GetCustomAttributes(
                    typeof(DescAttribute), false);

                if (null != attributes.First())
                {
                    return attributes.First().Description;
                }
            }

            return "未知";//string.Empty;
        }


        /// <summary>
        /// 获得枚举类型的注释
        /// </summary>
        /// <param name="enumObject"></param>
        /// <returns></returns>
        public static string GetText(this System.Enum enumObject)
        {
            return enumObject.GetType().GetField(enumObject.ToString()).GetDescription();
        }

        /// <summary>
        /// 获得枚举类型名称
        /// </summary>
        /// <param name="enumObject"></param>
        /// <returns></returns>
        public static string GetName(this System.Enum enumObject)
        {
            return System.Enum.GetName(enumObject.GetType(), enumObject);
        }

        /// <summary>
        /// 获取相应字符串值枚举的描述
        /// </summary>
        /// <typeparam name="TEnum"></typeparam>
        /// <param name="enumName"></param>
        /// <returns></returns>
        public static string GetEnumText<TEnum>(this string enumName)
        {
            if (System.Enum.IsDefined(typeof(TEnum), enumName))
            {
                return typeof(TEnum).GetField(enumName).GetDescription();
            }

            return enumName;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="TEnum"></typeparam>
        /// <param name="enumName"></param>
        /// <returns></returns>
        public static string GetText<TEnum>(this string enumName)
        {
            if (System.Enum.IsDefined(typeof(TEnum), enumName))
            {
                return enumName;
            }

            return enumName;
        }

    }

}
