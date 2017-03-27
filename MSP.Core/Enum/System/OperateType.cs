using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Core.Enum
{
    public enum OperateType
    {
        [Desc("用户登录")]
        Login,

        [Desc("注销登录")]
        Logout,

        [Desc("启用账号")]
        ActiveAccount,

        [Desc("禁用账号")]
        TabooAccount,

        [Desc("新增数据")]
        AddData,

        [Desc("修改数据")]
        UpdateData,

        [Desc("删除数据")]
        DeleteData,
    }
}
