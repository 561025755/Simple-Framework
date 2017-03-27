using SD.Core.Domain;
using SD.Core.Enum;
using SD.Core.Pagination;
using SD.Core.Sorting;
using System;
using System.Collections.Generic;

namespace SD.Interface
{
    public partial interface IUserService
    {
        Sys_User Get(int id);

        /// <summary>
        /// Get User CacheName
        /// </summary>
        /// <param name="email"></param>
        /// <returns></returns>
        string CacheName(string email);


        Sys_User GetByEmail(string email);


        object Add(Sys_User entity);

        int Save(Sys_User entity);

        int Delete(int id);

        #region User Group

        IList<Sys_Group> GetGroupsByUser(int id);


        Sys_Group GetGroupBySystemName(string systemName);


        object AddGroup(Sys_Group group);


        #endregion



        #region UserOperationRecord


        /// <summary>
        /// 添加用户操作记录
        /// </summary>
        /// <param name="entity">操作记录实体</param>
        /// <returns></returns>
        object AddOperationRecord(Sys_Useroperationrecord entity);

        object AddLog(Sys_User user, OperateType type, string caption);

        /// <summary>
        /// 获取指定用户最后一条操作记录
        /// </summary>
        /// <param name="userId">用户编号</param>
        /// <returns></returns>
        Sys_Useroperationrecord GetLastRecordByUserId(int userId);


        #endregion





    }
}
