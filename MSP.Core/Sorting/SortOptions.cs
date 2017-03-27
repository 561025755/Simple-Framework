using System;

namespace SD.Core.Sorting
{
    public class SortOptions
    {
        public string Column { get; set; }
        public string Direction { get; set; }

        public string SQL
        {
            get
            {
                if (this == null || string.IsNullOrWhiteSpace(this.Column) || string.IsNullOrWhiteSpace(this.Direction))
                {
                    return "";
                }

                return string.Format(" \nORDER BY {0} {1} ", this.Column, this.Direction);
            }
        }
    }
}
