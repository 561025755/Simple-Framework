using SD.Core.Enum;
using SD.Models.Validators;
//using FluentValidation.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;
using FluentValidation.Attributes;

namespace SD.Models.Domain
{
    [Validator(typeof(GroupValidator))]
    public partial class GroupModel : BaseEntityModel
    {
        [Display(Name = "名称")]
        public string Name { get; set; }

        [Display(Name = "活动与否")]
        public bool Active { get; set; }

        [Display(Name = "系统组别")]
        public bool IsSystemGroup { get; set; }

        [Display(Name = "系统名称")]
        public string SystemName { get; set; }

        [Display(Name = "组别类型")]
        public int? Type { get; set; }

    }
}