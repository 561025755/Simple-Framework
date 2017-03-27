﻿using FluentValidation;
using SD.Models.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Models.Validators
{
    public class RegisterValidator : AbstractValidator<RegisterModel>
    {
        public RegisterValidator()
        {
            RuleFor(x => x.Email).NotEmpty().WithMessage("请填写邮箱地址。");
            RuleFor(x => x.Email).EmailAddress().WithMessage("邮箱地址格式不正确。");

            RuleFor(x => x.Password).NotEmpty().WithMessage("请填写密码。");
            RuleFor(x => x.Password).Length(6, 999).WithMessage("输入的密码字符长度不能少于6个。");
            RuleFor(x => x.ConfirmPassword).NotEmpty().WithMessage("请填写确认密码。");
            RuleFor(x => x.ConfirmPassword).Equal(x => x.Password).WithMessage("输入的密码不一致。");

        }
    }
}
