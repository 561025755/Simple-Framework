using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace SD.Web
{
    public static class JsonExtentions
    {
        private static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
        {
            ContractResolver = new LowercaseContractResolver(),
            Converters = new List<Newtonsoft.Json.JsonConverter> {
                new IsoDateTimeConverter{ DateTimeFormat="yyyy-MM-dd HH:mm:ss"}
            }
        };


        public static string ToJson(this object obj)
        {
            if (obj != null)
            {
                return JsonConvert.SerializeObject(obj, Newtonsoft.Json.Formatting.Indented, Settings);
            }

            return "{}";
        }
    }

    public class LowercaseContractResolver : DefaultContractResolver
    {
        protected override string ResolvePropertyName(string propertyName)
        {
            //页面datatable控件需要的分页字段

            List<string> datatableProperties = new List<string>
            {
                "recordsTotal",
                "recordsFiltered",
                "DT_RowId",
                "DT_RowClass"
            };

            if (datatableProperties.Contains(propertyName))
                return propertyName;
            else
                return propertyName.ToLower();
        }
    }
}