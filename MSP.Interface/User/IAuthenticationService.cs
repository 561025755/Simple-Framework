using SD.Core.Domain;
using System;

namespace SD.Interface
{
    /// <summary>
    /// Authentication service interface
    /// </summary>
    public partial interface IAuthenticationService
    {
        void SignIn(Sys_User user, bool createPersistentCookie);
        void SignOut();
        Sys_User GetAuthenticatedUser();

        Sys_User InitializeUser(string email);
    }
}
