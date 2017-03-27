using SD.Core.Configuration;
using System;

namespace SD.Core.Domain.Settings
{
    public class CommonSettings : ISettings
    {
        public string DefaultTitle { get; set; }

        public int DefaultGridPageSize { get; set; }

        public int WwwRequired { get; set; }
    }
}
