using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using AutoMapper;

using SD.Core.Domain;
using SD.Models.Domain;
using SD.FrameWork.Engine;

namespace SD.Web
{
    public class AutoMapperStartupTask : IStartupTask
    {
        public void Execute()
        {
            #region System

            Mapper.CreateMap<Sys_Group, GroupModel>();
            Mapper.CreateMap<GroupModel, Sys_Group>();
            Mapper.CreateMap<Sys_User, UserModel>();
            Mapper.CreateMap<UserModel, Sys_User>();
            #endregion
        }

        public int Order
        {
            get { return 0; }
        }
    }
}