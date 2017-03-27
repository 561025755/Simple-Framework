using System;
using SD.Core.Pagination;

namespace SD.Data.Internal
{
    public static class PageExtensions
    {
        /// <summary>
        /// 将 Poco Page 转换成 MvcContrib IPagination 对象
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="page"></param>
        /// <returns></returns>
        public static IPagination<T> AsPagination<T>(this Page<T> page)
        {
            return new CustomPagination<T>(page.Items, (int)page.CurrentPage, (int)page.ItemsPerPage, (int)page.TotalItems);
        }
    }
}
