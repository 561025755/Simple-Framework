using System;
using System.Collections.Generic;
using System.Linq;

using SD.FrameWork.Caching;
using SD.Interface;
using SD.Core.Domain;
using SD.FrameWork.Data;
using SD.Interface.Auth;
using SD.FrameWork.Context;

namespace SD.Services
{
    /// <summary>
    /// Permission service
    /// </summary>
    public partial class PermissionService : IPermissionService
    {
        #region Constants
        /// <summary>
        /// Key for caching
        /// </summary>
        /// <remarks>
        /// {0} : customer role ID
        /// {1} : permission system name
        /// </remarks>
        private const string PERMISSIONS_ALLOWED_KEY = "ds.permission.allowed-{0}-{1}";
        /// <summary>
        /// Key pattern to clear cache
        /// </summary>
        private const string PERMISSIONS_PATTERN_KEY = "ds.permission.";
        #endregion

        #region Fields

        private readonly IRepository<Sys_Permission> permissionRepository;
        private readonly IRepository<Sys_Auth> authRepository;
        private readonly IUserService userService;
        private readonly IWorkContext workContext;
        private readonly ICacheManager cacheManager;

        #endregion

        #region Ctor

        /// <summary>
        /// Ctor
        /// </summary>
        /// <param name="permissionPecordRepository">Permission repository</param>
        /// <param name="customerService">Customer service</param>
        /// <param name="workContext">Work context</param>
        /// <param name="localizationService">Localization service</param>
        /// <param name="languageService">Language service</param>
        /// <param name="cacheManager">Cache manager</param>
        public PermissionService(IRepository<Sys_Permission> permissionRepository,
            IRepository<Sys_Auth> authRepository,
            IUserService userService,
            IWorkContext workContext,
            ICacheManager cacheManager)
        {
            this.permissionRepository = permissionRepository;
            this.authRepository = authRepository;
            this.userService = userService;
            this.workContext = workContext;
            this.cacheManager = cacheManager;
        }

        #endregion

        #region Utilities

        /// <summary>
        /// Authorize permission
        /// </summary>
        /// <param name="permissionRecordSystemName">Permission record system name</param>
        /// <param name="customerRole">Customer role</param>
        /// <returns>true - authorized; otherwise, false</returns>
        protected virtual bool Authorize(string permissionSystemName, Sys_Group group)
        {
            if (String.IsNullOrEmpty(permissionSystemName)
                || group == null
                || group.Permissions == null)
                return false;

            string key = string.Format(PERMISSIONS_ALLOWED_KEY, group.Id, permissionSystemName);

            var groupPermissions = group.Permissions;//this.GetByGroup(group.Id);

            return this.cacheManager.Get(key, () =>
            {
                foreach (var permission1 in groupPermissions)
                    if (permission1.SystemName.Equals(permissionSystemName, StringComparison.InvariantCultureIgnoreCase))
                        return true;

                return false;
            });
        }

        #endregion

        #region Methods

        /// <summary>
        /// Delete a permission
        /// </summary>
        /// <param name="permission">Permission</param>
        public virtual int Delete(Sys_Permission permission)
        {
            int result = 0;

            using (var scope = this.permissionRepository.GetTransaction())
            {
                if (permission == null)
                    throw new ArgumentNullException("permission");

                this.authRepository.Delete("WHERE PermissionId = @0", permission.Id);

                result = this.permissionRepository.Delete(permission);

                scope.Complete();
            }

            if (result > 0)
            {
                this.cacheManager.RemoveByPattern(PERMISSIONS_PATTERN_KEY);
            }

            return result;
        }

        public virtual int DeleteAuth(Sys_Group group, Sys_Permission permission)
        {
            if (group == null || permission == null)
                throw new ArgumentNullException("group or permission");

            int result = this.authRepository.Delete("WHERE GroupId=@0 AND PermissionId=@1", group.Id, permission.Id);

            if (result > 0)
            {
                this.cacheManager.RemoveByPattern(PERMISSIONS_PATTERN_KEY);
            }

            //event notification
            //_eventPublisher.EntityInserted(customerRole);

            return result;
        }

        /// <summary>
        /// Gets a permission
        /// </summary>
        /// <param name="permissionId">Permission identifier</param>
        /// <returns>Permission</returns>
        public virtual Sys_Permission Get(int id)
        {
            if (id == 0)
                return null;

            return this.permissionRepository.SingleOrDefault(id);
        }

        /// <summary>
        /// Gets a Sys_Permission
        /// </summary>
        /// <param name="systemName">Permission system name</param>
        /// <returns>Permission</returns>
        public virtual Sys_Permission GetBySystemName(string systemName)
        {
            if (String.IsNullOrWhiteSpace(systemName))
                return null;

            return this.permissionRepository.SingleOrDefault("SELECT * FROM sys_permission WHERE SystemName=@0", systemName);
        }

        public virtual IList<Sys_Permission> GetByGroup(int id)
        {
            return this.permissionRepository.Fetch("SELECT Sys_Permission.* FROM Sys_Permission JOIN sys_auth ON Sys_Permission.Id = sys_auth.PermissionId  WHERE GroupId = @0", id);
        }

        /// <summary>
        /// AllPermissions
        /// </summary>
        /// <returns></returns>
        public virtual IList<Sys_Permission> AllPermissions()
        {
            return this.permissionRepository.Fetch("select * from Sys_Permission");
        }



        /// <summary>
        /// Gets all permissions
        /// </summary>
        /// <returns>Permissions</returns>
        public virtual IList<Sys_Permission> GetAllPermissions(int? type)
        {
            return this.permissionRepository.Fetch(" WHERE Type=@0", type.GetValueOrDefault(0));
        }

        public virtual IList<Sys_Auth> GetAllAuths()
        {
            return this.authRepository.Fetch("");
        }

        /// <summary>
        /// Inserts a permission
        /// </summary>
        /// <param name="permission">Permission</param>
        public virtual object Add(Sys_Permission permission)
        {
            if (permission == null)
                throw new ArgumentNullException("permission");

            object result = this.permissionRepository.Insert(permission);

            this.cacheManager.RemoveByPattern(PERMISSIONS_PATTERN_KEY);

            return result;
        }

        public virtual object AddAuth(Sys_Group group, Sys_Permission permission)
        {
            if (group == null || permission == null)
                throw new ArgumentNullException("group or permission");

            object result = this.authRepository.Insert(new Sys_Auth { GroupId = group.Id, PermissionId = permission.Id });

            this.cacheManager.RemoveByPattern(PERMISSIONS_PATTERN_KEY);

            //event notification
            //_eventPublisher.EntityInserted(customerRole);

            return result;
        }

        /// <summary>
        /// Updates the permission
        /// </summary>
        /// <param name="permission">Permission</param>
        public virtual int Save(Sys_Permission permission)
        {
            if (permission == null)
                throw new ArgumentNullException("permission");

            int result = this.permissionRepository.Update(permission);

            if (result > 0)
            {
                this.cacheManager.RemoveByPattern(PERMISSIONS_PATTERN_KEY);
            }

            return result;
        }

        /// <summary>
        /// Install permissions
        /// </summary>
        /// <param name="permissionProvider">Permission provider</param>
        public virtual void InstallPermissions(IPermissionProvider permissionProvider)
        {
            //install new permissions
        }

        /// <summary>
        /// Uninstall permissions
        /// </summary>
        /// <param name="permissionProvider">Permission provider</param>
        public virtual void UninstallPermissions(IPermissionProvider permissionProvider)
        {
            var permissions = permissionProvider.GetPermissions();
            foreach (var permission in permissions)
            {
                var permission1 = GetBySystemName(permission.SystemName);

                if (permission1 != null)
                {
                    Delete(permission1);
                }
            }

        }

        /// <summary>
        /// Initialize permissions
        /// </summary>
        /// <param name="permissionProvider"></param>
        public virtual void InitializePermissions(IPermissionProvider permissionProvider) {
            var permissions=permissionProvider.GetPermissions();
            var defaultPermissions = permissionProvider.GetDefaultPermissions();
            

            using (var scop = this.permissionRepository.GetTransaction())
            {

                scop.Complete();
            }

            this.workContext.AddLog(Core.Enum.OperateType.UpdateData, "Initialize permissions");
        }



        /// <summary>
        /// Authorize permission
        /// </summary>
        /// <param name="permission">Permission record</param>
        /// <returns>true - authorized; otherwise, false</returns>
        public virtual bool Authorize(Sys_Permission permission)
        {
            return Authorize(permission, this.workContext.CurrentUser);
            //return Authorize(permission, new Sys_User());
        }

        /// <summary>
        /// Authorize permission
        /// </summary>
        /// <param name="permission">Permission record</param>
        /// <param name="customer">Customer</param>
        /// <returns>true - authorized; otherwise, false</returns>
        public virtual bool Authorize(Sys_Permission permission, Sys_User user)
        {
            if (permission == null)
                return false;

            if (user == null)
                return false;

            //old implementation of Authorize method
            //var customerRoles = customer.CustomerRoles.Where(cr => cr.Active);
            //foreach (var role in customerRoles)
            //    foreach (var permission1 in role.PermissionRecords)
            //        if (permission1.SystemName.Equals(permission.SystemName, StringComparison.InvariantCultureIgnoreCase))
            //            return true;

            //return false;

            if (permission.SystemName.Equals("AccessAdminPanel"))
                return true;


            return Authorize(permission.SystemName, user);
        }

        /// <summary>
        /// Authorize permission
        /// </summary>
        /// <param name="permissionRecordSystemName">Permission record system name</param>
        /// <returns>true - authorized; otherwise, false</returns>
        public virtual bool Authorize(string permissionRecordSystemName)
        {
            return Authorize(permissionRecordSystemName, this.workContext.CurrentUser);
        }

        /// <summary>
        /// Authorize permission
        /// </summary>
        /// <param name="permissionRecordSystemName">Permission record system name</param>
        /// <param name="customer">Customer</param>
        /// <returns>true - authorized; otherwise, false</returns>
        public virtual bool Authorize(string permissionSystemName, Sys_User user)
        {
            if (String.IsNullOrEmpty(permissionSystemName) || user == null)
                return false;

            var customerRoles = user.Groups.Where(cr => cr.Active);
            foreach (var role in customerRoles)
                if (Authorize(permissionSystemName, role))
                    //yes, we have such permission
                    return true;

            //no permission found
            return false;
        }

        #endregion
    }
}
