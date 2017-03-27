using SD.Core.Domain;
namespace SD.FrameWork.Context
{
    public partial interface IWorkContext
    {
        /// <summary>
        /// Gets or sets the current customer
        /// </summary>
        Sys_User CurrentUser { get; set; }

        /// <summary>
        /// Get or set value indicating whether we're in admin area
        /// </summary>
        bool IsAdmin { get; set; }

        /// <summary>
        /// operate log
        /// </summary>
        /// <param name="type"></param>
        /// <param name="caption"></param>
        void AddLog(SD.Core.Enum.OperateType type, string caption);
    }
}
