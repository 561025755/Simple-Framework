
using SD.Core.Domain;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace SD.Models.Domain
{
    public partial class UserModel : BaseEntityModel
    {
        public UserModel()
        {
            this.AvailableGroups = new List<GroupModel>();
            this.SelectdLocalities = new List<int>();
        }

        [Display(Name = "用户名称")]
        public string UserName { get; set; }

        [Display(Name = "邮箱地址")]
        public string Email { get; set; }

        [Display(Name = "移动电话")]
        public string Mobile { get; set; }

        [Display(Name = "密码")]
        public string Password { get; set; }

        [Display(Name = "密码格式")]
        public int PasswordFormat { get; set; }

        public string PasswordSalt { get; set; }

        [Display(Name = "活动与否")]
        public bool Active { get; set; }

        [Display(Name = "删除与否")]
        public bool Deleted { get; set; }

        [Display(Name = "最近访问网络地址")]
        public string LastIpAddress { get; set; }

        [Display(Name = "创建时间")]
        public DateTime? CreateTime { get; set; }

        [Display(Name = "最近登录时间")]
        public DateTime? LastLoginTime { get; set; }

        [Display(Name = "最近活动时间")]
        public DateTime? LastActivityTime { get; set; }

        [Display(Name = "可用组别")]
        public List<GroupModel> AvailableGroups { get; set; }

        [Display(Name = "可用城市列表")]
        public List<Sys_Locality> Localities { get; set; }

        [Display(Name = "所属城市列表")]
        public List<int> SelectdLocalities { get; set; }


        [Display(Name = "所属组别")]
        public int[] SelectedGroupIds { get; set; }


        [Display(Name = "代理商事务管理员")]
        public bool IsDirector { get; set; }

        public UserStateChangeModel UserStateChange { get; set; }
    }
}