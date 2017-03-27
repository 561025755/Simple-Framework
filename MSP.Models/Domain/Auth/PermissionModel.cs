
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace SD.Models.Domain
{
    public partial class PermissionModel : BaseModel
    {
        [Display(Name = "名称")]
        public string Name { get; set; }

        [Display(Name = "系统名称")]
        public string SystemName { get; set; }
    }
}