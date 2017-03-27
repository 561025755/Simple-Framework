using FluentValidation.Attributes;
using SD.Models.Validators;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Models.Domain
{
    [Validator(typeof(ChangePasswordValidator))]
    public class ChangePasswordModel
    {
        [DataType(DataType.Password)]
        [Display(Name = "旧密码")]
        public string OldPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "新密码")]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "确认密码")]
        public string ConfirmNewPassword { get; set; }
    }
}
