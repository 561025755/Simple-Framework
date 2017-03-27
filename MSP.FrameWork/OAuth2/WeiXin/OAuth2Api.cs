using SD.FrameWork.OAuth2.HttpUtility;
using System;

namespace SD.FrameWork.OAuth2.WeiXin
{
    public static class OAuth2Api
    {
        public static string UrlEncode(this string url)
        {
            return System.Web.HttpUtility.UrlEncode(url);
        }

        public static string GetAuthorizeUrl(string appId, string redirectUrl, string state, string scope = "snsapi_login", string responseType = "code")
        {
            var url = string.Format("https://open.weixin.qq.com/connect/qrconnect?appid={0}&redirect_uri={1}&response_type={2}&scope={3}&state={4}#wechat_redirect",
                                appId, redirectUrl.UrlEncode(), responseType, scope, state);
            return url;
        }

        public static WxAccessTokenResult GetToken(string appId, string appSecret, string code, string grantType = "authorization_code")
        {
            //ICacheManager cacheManager = EngineContext.Current.Resolve<ICacheManager>();

            //return cacheManager.Get("OPEN_WEIXIN_TOKEN", 3600, () =>
            //{
                var url = string.Format("https://api.weixin.qq.com/sns/oauth2/access_token?appid={0}&secret={1}&code={2}&grant_type={3}",
                                appId, appSecret, code, grantType);

                var result = Get.GetJson<WxAccessTokenResult>(url);

                return result;
            //});
        }
    }
}
