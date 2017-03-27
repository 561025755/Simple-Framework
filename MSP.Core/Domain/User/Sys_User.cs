using SD.Core.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Core.Domain
{
    public partial class Sys_User
    {
        public Sys_User()
        {
            this.Uid = Guid.NewGuid().ToString();
            this.PasswordFormatToken = Enum.PasswordFormat.Hashed;
        }

        public PasswordFormat PasswordFormatToken
        {
            get { return (PasswordFormat)PasswordFormat; }
            set { this.PasswordFormat = (int)value; }
        }

        public IList<Sys_Group> Groups { get; set; }

        [ResultColumn]
        public string CompanyName { get; set; }

        [ResultColumn]
        public string ReferralerUserName { get; set; }

        [ResultColumn]
        public bool VerifierActive { get; set; }

        [ResultColumn]
        public int OpenIdSecId { get; set; }

        public IList<Sys_User> CustomCustomer { get; set; }

        public int[] UserRange { get; set; }

        public Sys_Locality DefaultCity { get; set; }

        public IList<Sys_Locality> AllowCitys { get; set; }
    }
}
