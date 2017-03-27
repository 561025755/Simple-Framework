using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SD.Core.Enum;

namespace SD.Core.Domain
{
    public partial class Sys_Log
    {
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
    }
}
