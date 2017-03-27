using SD.Core.Domain;
using System;
using System.Collections.Generic;

namespace SD.Interface.Auth
{ 
    /// <summary>
    /// Permission service interface
    /// </summary>
    public partial interface IPermissionService
    {
        int Delete(Sys_Permission permission);

        int DeleteAuth(Sys_Group group, Sys_Permission permission);

        Sys_Permission Get(int id);

        Sys_Permission GetBySystemName(string systemName);

        IList<Sys_Permission> GetAllPermissions(int? type);

        IList<Sys_Auth> GetAllAuths();

        object Add(Sys_Permission permission);

        object AddAuth(Sys_Group group, Sys_Permission permission);

        int Save(Sys_Permission permission);

        void InstallPermissions(IPermissionProvider permissionProvider);

        void UninstallPermissions(IPermissionProvider permissionProvider);

        void InitializePermissions(IPermissionProvider permissionProvider);

        bool Authorize(Sys_Permission permission);

        bool Authorize(Sys_Permission permission, Sys_User user);

        bool Authorize(string permissionSystemName);

        bool Authorize(string permissionSystemName, Sys_User user);
    }
}
