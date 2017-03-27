using SD.Core.Domain;
using SD.Core.Enum;
using SD.Core.Pagination;
using SD.Core.Sorting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SD.Interface
{
    /// <summary>
    /// Logger interface
    /// </summary>
    public partial interface ILogService
    {
        /// <summary>
        /// Determines whether a log level is enabled
        /// </summary>
        /// <param name="level">Log level</param>
        /// <returns>Result</returns>
        bool IsEnabled(LogLevel level);

        /// <summary>
        /// Deletes a log item
        /// </summary>
        /// <param name="log">Log item</param>
        void Delete(Sys_Log log);

        void Delete(int Id);

        /// <summary>
        /// Clears a log
        /// </summary>
        void Clear();

        /// <summary>
        /// Gets all log items
        /// </summary>
        /// <param name="fromUtc">Log item creation from; null to load all records</param>
        /// <param name="toUtc">Log item creation to; null to load all records</param>
        /// <param name="message">Message</param>
        /// <param name="logLevel">Log level; null to load all records</param>
        /// <param name="pageIndex">Page index</param>
        /// <param name="pageSize">Page size</param>
        /// <returns>Log item collection</returns>
        IPagination<Sys_Log> Page(long page, long itemsPerPage, SortOptions sort = null, bool IncludeUnknown = true);

        /// <summary>
        /// Gets a log item
        /// </summary>
        /// <param name="logId">Log item identifier</param>
        /// <returns>Log item</returns>
        Sys_Log Get(int id);

        /// <summary>
        /// Get log items by identifiers
        /// </summary>
        /// <param name="logIds">Log item identifiers</param>
        /// <returns>Log items</returns>
        IList<Sys_Log> GetByIds(int[] ids);

        /// <summary>
        /// Inserts a log item
        /// </summary>
        /// <param name="logLevel">Log level</param>
        /// <param name="shortMessage">The short message</param>
        /// <param name="fullMessage">The full message</param>
        /// <param name="customer">The customer to associate log record with</param>
        /// <returns>A log item</returns>
        Sys_Log Add(LogLevel logLevel, string shortMessage, string fullMessage = "", Sys_User user = null);

        #region Logger

        void Debug(string message, Exception exception = null, Sys_User user = null);

        void Information(string message, Exception exception = null, Sys_User user = null);

        void Warning(string message, Exception exception = null, Sys_User user = null);

        void Error(string message, Exception exception = null, Sys_User user = null);

        void Fatal(string message, Exception exception = null, Sys_User user = null);

        #endregion
    }
}
