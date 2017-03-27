using FluentValidation;
using SD.Models.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Models.Validators
{
    public class ChangePasswordValidator : AbstractValidator<ChangePasswordModel>
    {
        public ChangePasswordValidator()
        {
            RuleFor(x => x.OldPassword).NotEmpty().WithMessage("请输入旧密码。");
            RuleFor(x => x.NewPassword).NotEmpty().WithMessage("请出入新密码");
            RuleFor(x => x.NewPassword).Length(6, 999).WithMessage("输入的密码字符长度不能少于6个。");
            RuleFor(x => x.ConfirmNewPassword).NotEmpty().WithMessage("请输入确认密码。");
            RuleFor(x => x.ConfirmNewPassword).Equal(x => x.NewPassword).WithMessage("前后输入的确认密码不匹配。");
        }
    }
}
