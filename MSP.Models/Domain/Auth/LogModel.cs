using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SD.Core.Domain;
using SD.Core.Enum;

namespace SD.Models.Domain
{
    public partial class LogModel:BaseEntityModel
    {
        [Display(Name = "日志级别")]
        public int? Level { get; set; }

        [Display(Name = "日志级别")]
        public LogLevel LogLevel
        {
            get
            {
                return (LogLevel)this.Level;
            }
            set
            {
                this.Level = (int)value;
            }
        }

        [Display(Name = "描述内容")]
        public string ShortMessage { get; set; }

        [Display(Name = "详细内容")]
        public string FullMessage { get; set; }

        [Display(Name = "网络地址")]
        public string IpAddress { get; set; }

        [Display(Name = "用户")]
        public string User { get; set; }

        [Display(Name = "访问路径")]
        public string PageUrl { get; set; }

        [Display(Name = "前访问路径")]
        public string ReferrerUrl { get; set; }

        [Display(Name = "创建时间")]
        public DateTime? CreateTime { get; set; }

    }
}
