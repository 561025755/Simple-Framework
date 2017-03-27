using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Core.Domain
{
    /// <summary>
    /// Represents a default permission record
    /// </summary>
    public class DefaultPermission
    {
        public DefaultPermission()
        {
            this.Permissions = new List<Sys_Permission>();
        }

        /// <summary>
        /// Gets or sets the customer role system name
        /// </summary>
        public string GroupSystemName { get; set; }

        public string GroupName { get; set; }

        /// <summary>
        /// Gets or sets the Type
        /// </summary>
        public int? Type { get; set; }

        /// <summary>
        /// Gets or sets the permissions
        /// </summary>
        public IEnumerable<Sys_Permission> Permissions { get; set; }
    }
}
