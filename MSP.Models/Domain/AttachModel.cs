using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Models.Domain
{
    public class AttachModel<T,T1>
    {
        public SD.Core.Pagination.IPagination<T> PageModel { get; set; }

        public IList<T> ListModel { get; set; }

        public T1 Model { get; set; }
    }
}
