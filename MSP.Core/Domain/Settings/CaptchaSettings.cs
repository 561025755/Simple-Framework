using SD.Core.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Core.Domain
{
    public class CaptchaSettings : ISettings
    {
        public bool Enabled { get; set; }
        public bool ShowOnLoginPage { get; set; }
        public bool ShowOnRegistrationPage { get; set; }
        public bool ShowOnContactUsPage { get; set; }
    }
}
