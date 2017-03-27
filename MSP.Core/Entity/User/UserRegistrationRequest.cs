using SD.Core.Enum;

namespace SD.Core.Domain
{
    public class UserRegistrationRequest
    {
        public Sys_User User { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public PasswordFormat PasswordFormat { get; set; }
        public bool IsApproved { get; set; }

        public UserRegistrationRequest(Sys_User user, string email, string username,
            string password,
            PasswordFormat passwordFormat,
            bool isApproved = true)
        {
            this.User = user;
            this.Email = email;
            this.Username = username;
            this.Password = password;
            this.PasswordFormat = passwordFormat;
            this.IsApproved = isApproved;
        }

        //public bool IsValid  
        //{
        //    get 
        //    {
        //        return (!CommonHelper.AreNullOrEmpty(
        //                    this.Email,
        //                    this.Password
        //                    ));
        //    }
        //}
    }
}
