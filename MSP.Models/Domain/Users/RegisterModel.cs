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
    [Validator(typeof(RegisterValidator))]
    public class RegisterModel: BaseModel
    {
        [Display(Name = "邮箱地址")]
        public string Email { get; set; }

        [Display(Name = "启用用户名称")]
        public bool UsernamesEnabled { get; set; }

        [Display(Name = "姓名")]
        public string Username { get; set; }

        [Display(Name = "检测用户名称可用")]
        public bool CheckUsernameAvailabilityEnabled { get; set; }

        [Display(Name = "密码")]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Display(Name = "确认密码")]
        [DataType(DataType.Password)]
        public string ConfirmPassword { get; set; }

        [Display(Name = "显示验证码")]
        public bool DisplayCaptcha { get; set; }

        [Display(Name = "公司名称")]
        public string CompanyName { get; set; }

        [Display(Name = "推荐码")]
        public string ReferralCode { get; set; }

        [Display(Name = "联系电话")]
        public string Telphone { get; set; }

        [Display(Name = "加密后的openid")]
        public string Uid { get; set; }

        public string Thirdparty { get; set; }
    }
}
