using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using SD.Core.Sorting;

namespace SD.FrameWork.UI.Grid
{
    public static class GridSortExtensions
    {
        /// <summary>
        /// 将 GridSortOptions 转换成 SortOptions 对象
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="page"></param>
        /// <returns></returns>
        public static SortOptions  Setup(this GridSortOptions sort, string defaultColumn = "")
        {
            if (sort == null || (string.IsNullOrWhiteSpace(sort.Column) && string.IsNullOrWhiteSpace(defaultColumn)))
            {
                return null;
            }

            return new SortOptions
            {
                Column = string.IsNullOrWhiteSpace(sort.Column) ? defaultColumn : sort.Column,
                Direction = sort.Direction == SortDirection.Ascending ? "ASC" : "DESC",
            };

        }
    }
}