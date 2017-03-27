using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Models.Domain
{
    public class SecuritySettingsModel : BaseEntityModel
    {
        [Display(Name = "强制所有页面访问启用SSL")]
        public bool ForceSslForAllPages { get; set; }

        [Display(Name = "加密密钥")]
        public string EncryptionKey { get; set; }

        [Display(Name = "管理访问网络地址")]
        public string AdminAreaAllowedIpAddresses { get; set; }

        [Display(Name = "启用验证码")]
        public bool CaptchaEnabled { get; set; }

        [Display(Name = "在登录页面启用验证码")]
        public bool ShowOnLoginPage { get; set; }

        [Display(Name = "在注册页面启用验证码")]
        public bool ShowOnRegistrationPage { get; set; }

        [Display(Name = "在联系我们页面启用验证码")]
        public bool ShowOnContactUsPage { get; set; }

        [Display(Name = "允许重复登陆")]
        public bool AllowRepeatLogin { get; set; }
    }
}
