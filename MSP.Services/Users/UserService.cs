using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using SD.FrameWork.Data;
using SD.Interface;
using SD.FrameWork.Caching;
using SD.FrameWork;
using SD.Core.Sorting;
using SD.Core.Pagination;
using SD.Core.Domain;
using SD.Core.Enum;
using SD.FrameWork.Context;
using System.Net;
using Newtonsoft.Json;
using SD.Data;
using SD.Data.Context;
using SD.FrameWork.Engine;

namespace SD.Services
{

    public partial class UserService : IUserService
    {
        #region Constants

        /// <summary>
        /// Key for caching
        /// </summary>
        /// <remarks>
        /// {0} : show hidden records?
        /// </remarks>
        private const string GROUPS_ALL_KEY = "ds.group.all-{0}";
        /// <summary>
        /// Key for caching
        /// </summary>
        /// <remarks>
        /// {0} : system name
        /// </remarks>
        private const string GROUPS_BY_SYSTEMNAME_KEY = "ds.group.systemname-{0}";
        /// <summary>
        /// Key pattern to clear cache
        /// </summary>
        private const string GROUPS_PATTERN_KEY = "ds.group.";

        #endregion

        #region Fields

        private readonly IRepository<Sys_User> repository;

        private readonly IRepository<Sys_Group> groupRepository;

        private readonly IRepository<Sys_Usergroup> userGroupRepository;

        private readonly IRepository<Sys_Permission> permissionRepository;


        private readonly ICacheManager cacheManager;

        private readonly IRepository<Sys_Useroperationrecord> userOperationRecord;

        private readonly IRepository<Sys_Usermedium> _userMediumRepository;

        // private readonly IWorkContext workContext;
        #endregion

        public UserService(IRepository<Sys_User> repository,
            IRepository<Sys_Group> groupRepository,
            IRepository<Sys_Usergroup> userGroupRepository,
            IRepository<Sys_Permission> permissionRepository,

            ICacheManager cacheManager,
            IRepository<Sys_Useroperationrecord> userOperationRecord,
            IRepository<Sys_Usermedium> userMediumRepository
            // IWorkContext workContext
            )
        {
            this.repository = repository;
            this.groupRepository = groupRepository;
            this.userGroupRepository = userGroupRepository;
            this.permissionRepository = permissionRepository;
            this.cacheManager = cacheManager;

            this.userOperationRecord = userOperationRecord;
            _userMediumRepository = userMediumRepository;
        }

        public virtual Sys_User Get(int id)
        {
            var user = this.repository.SingleOrDefault(id);
            return user;
        }


        /// <summary>
        /// Get User CacheName
        /// </summary>
        /// <param name="email"></param>
        /// <returns></returns>
        public virtual string CacheName(string email)
        {
            var name = string.Format("{0}.{1}", SD.Core.Enum.CacheCode.LoginUser.ToString(), email);
            return name;
        }


        public virtual Sys_User GetByEmail(string email)
        {
            return this.repository.Query("", email).FirstOrDefault();
        }



        public virtual object Add(Sys_User entity)
        {
            return this.repository.Insert(entity);
        }

        public virtual int Save(Sys_User entity)
        {
            return this.repository.Update(entity);
        }

        public virtual int Delete(int id)
        {
            var user = this.repository.SingleOrDefault(id);

            if (user == null)
                throw new ArgumentNullException("id");

            user.Deleted = true;

            if (!String.IsNullOrEmpty(user.Email))
                user.Email += "-----DELETED";
            if (!String.IsNullOrEmpty(user.UserName))
                user.UserName += "-----DELETED";


            //return this.repository.Delete(id);
            return this.repository.Update(user);
        }


        #region User Group


        public virtual IList<Sys_Group> GetGroupsByUser(int id)
        {
            return null;
        }




        /// <summary>
        /// Gets a customer role
        /// </summary>
        /// <param name="systemName">Customer role system name</param>
        /// <returns>Customer role</returns>
        public virtual Sys_Group GetGroupBySystemName(string systemName)
        {
            if (String.IsNullOrWhiteSpace(systemName))
                return null;

            string key = string.Format(GROUPS_BY_SYSTEMNAME_KEY, systemName);
            return this.cacheManager.Get(key, () =>
            {
                return this.groupRepository.SingleOrDefault("", systemName);
            });
        }


        /// <summary>
        /// Inserts a customer role
        /// </summary>
        /// <param name="customerRole">Customer role</param>
        public virtual object AddGroup(Sys_Group group)
        {
            if (group == null)
                throw new ArgumentNullException("customerRole");

            object result = this.groupRepository.Insert(group);

            this.cacheManager.RemoveByPattern(GROUPS_PATTERN_KEY);

            //event notification
            //_eventPublisher.EntityInserted(customerRole);

            return result;
        }

        #endregion



        #region UserOperationRecord


        /// <summary>
        /// 添加用户操作记录
        /// </summary>
        /// <param name="entity">操作记录实体</param>
        /// <returns></returns>
        public virtual object AddOperationRecord(Sys_Useroperationrecord entity)
        {
            entity.OperTime = DateTime.Now;
            entity.OperAddress = EngineContext.Current.Resolve<IWebContext>().GetCurrentIpAddress();

            return this.userOperationRecord.Insert(entity);
        }

        public virtual object AddLog(Sys_User user, OperateType type, string caption)
        {

            var entity = new Sys_Useroperationrecord
            {
                UserId = user.Id,
                Operation = type.GetText(),
                Caption = caption,
                OperCity = user.DefaultCity == null ? "" : user.DefaultCity.LocalityName,
            };
            return AddOperationRecord(entity);
        }



        /// <summary>
        /// 获取指定用户最后一条操作记录
        /// </summary>
        /// <param name="userId">用户编号</param>
        /// <returns></returns>
        public virtual Sys_Useroperationrecord GetLastRecordByUserId(int userId)
        {
            return userOperationRecord.FirstOrDefault(@"WHERE UserId=@0", userId);
        }

        #endregion
    }
}
