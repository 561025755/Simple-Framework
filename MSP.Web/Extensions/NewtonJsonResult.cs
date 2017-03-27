using System;
using System.Collections.Generic;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json;

namespace SD.Web
{
    public class NewtonJsonResult : JsonResult
    {
        private static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
        {
            ContractResolver = new LowercaseContractResolver(),
            Converters = new List<Newtonsoft.Json.JsonConverter> {
                new IsoDateTimeConverter{ DateTimeFormat="yyyy-MM-dd HH:mm:ss"}
            }
        };

        public override void ExecuteResult(ControllerContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException("context");
            }
            if ((this.JsonRequestBehavior == System.Web.Mvc.JsonRequestBehavior.DenyGet) 
                && string.Equals(context.HttpContext.Request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException();
            }
            HttpResponseBase response = context.HttpContext.Response;
            if (!string.IsNullOrEmpty(this.ContentType))
            {
                response.ContentType = this.ContentType;
            }
            else
            {
                response.ContentType = "application/json";
            }
            if (this.ContentEncoding != null)
            {
                response.ContentEncoding = this.ContentEncoding;
            }
            if (this.Data != null)
            {
                //IsoDateTimeConverter converter = new IsoDateTimeConverter();
                //converter.DateTimeFormat = "yyyy-MM-dd HH:mm:ss";
                response.Write(JsonConvert.SerializeObject(this.Data, Newtonsoft.Json.Formatting.Indented, Settings));
            }
        }
    }
}