using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Core.Domain
{
    /// <summary>
    /// Represents a customer role
    /// </summary>
    public partial class Sys_Group
    {
        public IEnumerable<Sys_Permission> Permissions { get; set; }
    }
}
