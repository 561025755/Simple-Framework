using SD.Core.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SD.Core.Domain.Settings;
using SD.Core.Configuration;

namespace SD.Core.Domain
{
    public class UserSettings:ISettings
    {
        /// <summary>
        /// Gets or sets a value indicating whether usernames are used instead of emails
        /// </summary>
        public bool UsernamesEnabled { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether users can check the availability of usernames (when registering or changing in 'My Account')
        /// </summary>
        public bool CheckUsernameAvailabilityEnabled { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether users are allowed to change their usernames
        /// </summary>
        public bool AllowUsersToChangeUsernames { get; set; }

        /// <summary>
        /// Default password format for customers
        /// </summary>
        public PasswordFormat DefaultPasswordFormat { get; set; }

        /// <summary>
        /// Gets or sets a customer password format (SHA1, MD5) when passwords are hashed
        /// </summary>
        public string HashedPasswordFormat { get; set; }

        /// <summary>
        /// Gets or sets a minimum password length
        /// </summary>
        public int PasswordMinLength { get; set; }

        ///// <summary>
        ///// User registration type
        ///// </summary>
        public UserRegistrationType UserRegistrationType { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether customers are allowed to upload avatars.
        /// </summary>
        public bool AllowUsersToUploadAvatars { get; set; }

        /// <summary>
        /// Gets or sets a maximum avatar size (in bytes)
        /// </summary>
        public int AvatarMaximumSizeBytes { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether to display default user avatar.
        /// </summary>
        public bool DefaultAvatarEnabled { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether customers are allowed to view profiles of other customers
        /// </summary>
        public bool AllowViewingProfiles { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether 'New customer' notification message should be sent to a store owner
        /// </summary>
        public bool NotifyNewUserRegistration { get; set; }

        ///// <summary>
        ///// Customer name formatting
        ///// </summary>
        //public UserNameFormat UserNameFormat { get; set; }

        /// <summary>
        /// Gets or sets a value indicating the number of minutes for 'online customers' module
        /// </summary>
        public int OnlineUserMinutes { get; set; }

        /// <summary>
        /// Gets or sets a value indicating whether deleted customer records should be prefixed suffixed with "-DELETED"
        /// </summary>
        public bool SuffixDeletedUsers { get; set; }
    }
}
