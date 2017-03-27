using SD.Core.Domain;
using SD.Core.Domain.Security;
using SD.Interface.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SD.Core.Enum;

namespace SD.FrameWork.Security
{
    /// <summary>
    /// Standard permission provider
    /// </summary>
    public partial class StandardPermissionProvider : IPermissionProvider
    {
        //admin area permissions
        public static readonly Sys_Permission AccessAdminPanel = new Sys_Permission { Name = "系统首页", SystemName = "AccessAdminPanel", Category = "/" };

        #region 系统管理

        public static readonly Sys_Permission ManageUsers = new Sys_Permission { Name = "管理系统用户", SystemName = "ManageUsers", Category = "系统管理" };
        public static readonly Sys_Permission ManageGroups = new Sys_Permission { Name = "管理用户组别", SystemName = "ManageGroups", Category = "系统管理" };
        public static readonly Sys_Permission ManageAuths = new Sys_Permission { Name = "管理功能权限", SystemName = "ManageAuths", Category = "系统管理" };
        public static readonly Sys_Permission ManageSettings = new Sys_Permission { Name = "系统参数设置", SystemName = "ManageSettings", Category = "系统管理" };
        public static readonly Sys_Permission ManageLogs = new Sys_Permission { Name = "系统异常日志", SystemName = "ManageLogs", Category = "系统管理" };

        #endregion 

        public virtual IEnumerable<Sys_Permission> GetPermissions()
        {
            return new[]
            {
                AccessAdminPanel,

                ManageUsers,
                ManageGroups,
                ManageAuths,
                ManageSettings,
                ManageLogs,
 
            };
        }

        public virtual IEnumerable<DefaultPermission> GetDefaultPermissions()
        {
            return new[]
            {
                #region 系统管理员
                new DefaultPermission
                {
                    GroupSystemName = SystemUserGroupNames.Administrators,
                    GroupName = "系统管理",
                    Permissions = new[]
                    {
                        AccessAdminPanel,
                        //系统管理
                        ManageUsers,ManageGroups,ManageAuths,ManageSettings,ManageLogs,
                    }
                },

                #endregion
            };
        }
    }
}
