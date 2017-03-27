using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Models.Domain
{
    public class OAuth2SettingsModel : BaseEntityModel
    {
        [Display(Name = "微信登录启用")]
        public bool WeiXinLoginEnabled { get; set; }

        [Display(Name = "微信开放应用编号")]
        public string WeiXinAppId { get; set; }

        [Display(Name = "微信开放应用密钥")]
        public string WeiXinAppSecret { get; set; }

        [Display(Name = "微信开放应用标识")]
        public string WeiXinStateToken { get; set; }

        [Display(Name = "微信开放应用回调地址")]
        public string WeiXinCallback { get; set; }
    }
}
