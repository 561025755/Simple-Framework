//using DigitalSignage.Models.Validators;
//using FluentValidation.Attributes;
using System.ComponentModel.DataAnnotations;

namespace SD.Models.Domain
{
    //[Validator(typeof(UserStateChangeValidator))]
    public class UserStateChangeModel

    {
        private int day = -1;
        public bool Changed { get; set; }
        public string Reason { get; set; }
        public int Days { get { return day; } set { day = value; } }
    }
}
