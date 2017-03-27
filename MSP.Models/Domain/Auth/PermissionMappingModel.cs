using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SD.Models.Domain
{
    public partial class PermissionMappingModel : BaseModel
    {
        public PermissionMappingModel()
        {
            AvailablePermissions = new List<PermissionModel>();
            AvailableGroups = new List<GroupModel>();
            Allowed = new Dictionary<string, IDictionary<int, bool>>();
        }
        public IList<PermissionModel> AvailablePermissions { get; set; }
        public IList<GroupModel> AvailableGroups { get; set; }

        //[permission system name] / [customer role id] / [allowed]
        public IDictionary<string, IDictionary<int, bool>> Allowed { get; set; }
    }
}