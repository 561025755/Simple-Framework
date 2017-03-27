using SD.Core.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Core.Domain
{
    public class OAuth2Settings:ISettings
    {
        /// <summary>
        /// 微信登录启用
        /// </summary>
        public bool WeiXinLoginEnabled { get; set; }

        /// <summary>
        /// 微信开放应用编号
        /// </summary>
        public string WeiXinAppId { get; set; }

        /// <summary>
        /// 微信开放应用密钥
        /// </summary>
        public string WeiXinAppSecret { get; set; }

        /// <summary>
        /// 微信开放应用标识
        /// </summary>
        public string WeiXinStateToken { get; set; }

        /// <summary>
        /// 微信开放应用回调地址
        /// </summary>
        public string WeiXinCallback { get; set; }
    }
}
