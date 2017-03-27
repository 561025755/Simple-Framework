using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SD.Core.Domain.Security;

namespace SD.Core.Domain
{
    public static class UserExtensions
    {
        #region User group

        /// <summary>
        /// Gets a value indicating whether user is in a certain user group
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="userGroupSystemName">User group system name</param>
        /// <param name="onlyActiveUserGroups">A value indicating whether we should look only in active user groups</param>
        /// <returns>Result</returns>
        public static bool IsInUserGroup(this Sys_User user,
            string userGroupSystemName, bool onlyActiveUserGroups = true)
        {
            if (user == null)
                throw new ArgumentNullException("user");

            if (String.IsNullOrEmpty(userGroupSystemName))
                throw new ArgumentNullException("userGroupSystemName");

            var result = user.Groups
                .FirstOrDefault(cr => (!onlyActiveUserGroups || cr.Active) && (cr.SystemName == userGroupSystemName)) != null;
            return result;
        }

        /// <summary>
        /// Gets a value indicating whether user is administrator
        /// </summary>
        /// <param name="user">User</param>
        /// <param name="onlyActiveUserGroups">A value indicating whether we should look only in active user groups</param>
        /// <returns>Result</returns>
        public static bool IsAdmin(this Sys_User user, bool onlyActiveUserGroups = true)
        {
            return IsInUserGroup(user, SystemUserGroupNames.Administrators, onlyActiveUserGroups);
        }


        #endregion
    }
}
