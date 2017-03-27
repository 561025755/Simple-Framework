using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Core.Domain
{
    public partial class Sys_Useroperationrecord
    {
        /// <summary>
        /// 用户名
        /// </summary>
        [ResultColumn]
        public string UserName { get; set; }
    }
}
