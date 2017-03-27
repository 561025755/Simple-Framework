using System;
using System.Collections.Generic;
using System.Web.Mvc;


namespace SD.Models.Domain
{
    /// <summary>
    /// Base model
    /// </summary>
    public partial class BaseModel
    {
        public BaseModel()
        {
            this.CustomProperties = new Dictionary<string, object>();
        }
        public virtual void BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
        }

        /// <summary>
        /// Use this property to store any custom value for your models. 
        /// </summary>
        public Dictionary<string, object> CustomProperties { get; set; }
    }

    /// <summary>
    /// Base entity model
    /// </summary>
    public partial class BaseEntityModel : BaseModel
    {
        public virtual int Id { get; set; }
    }
}
