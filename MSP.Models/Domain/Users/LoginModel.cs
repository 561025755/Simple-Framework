using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using FluentValidation.Attributes;
using SD.Models.Validators;

namespace SD.Models.Domain
{
    [Validator(typeof(LoginValidator))]
    public partial class LoginModel : BaseModel
    {
        [Display(Name = "邮箱地址")]
        public string Email { get; set; }

        [Display(Name = "启用用户名称")]
        public bool UsernamesEnabled { get; set; }

        [Display(Name = "用户名称")]
        public string UserName { get; set; }

        [Display(Name = "密码")]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Display(Name = "记住我")]
        public bool RememberMe { get; set; }

        [Display(Name = "显示验证码")]
        public bool DisplayCaptcha { get; set; }

        [Display(Name = "第三方登录标识")]
        public string OpenId { get; set; }

        [Display(Name = "第三方平台")]
        public string ThirdParty { get; set; }
    }
}