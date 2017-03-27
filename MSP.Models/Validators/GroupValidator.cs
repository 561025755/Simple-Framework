using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using FluentValidation;
using SD.Models;
using SD.Models.Domain;

namespace SD.Models.Validators
{
    public class GroupValidator : AbstractValidator<GroupModel>
    {
        public GroupValidator()
        {
            RuleFor(x => x.Name).NotEmpty().WithMessage("请填写用户组别名称。");

            RuleFor(x => x.SystemName).NotEmpty().WithMessage("请填写用户组别系统标识。");

            RuleFor(x => x.Type).NotNull().WithMessage("请选择用户组别类型");
        }
    }
}