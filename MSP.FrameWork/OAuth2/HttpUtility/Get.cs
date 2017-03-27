using System;
using System.Text;
using System.Web.Script.Serialization;
using System.Net;

namespace SD.FrameWork.OAuth2.HttpUtility
{
    public static class Get
    {
        public static string HttpGet(string url, Encoding encoding = null)
        {
            WebClient wc = new WebClient();
            wc.Encoding = encoding ?? Encoding.UTF8;
            if (encoding != null)
            {
                wc.Encoding = encoding;
            }
            return wc.DownloadString(url);
        }

        public static T GetJson<T>(string url, Encoding encoding = null)
        {
            string returnText = HttpGet(url, encoding);

            JavaScriptSerializer js = new JavaScriptSerializer();

            T result = js.Deserialize<T>(returnText);

            return result;
        }
    }
}
