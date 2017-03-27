using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using SD.Interface;
using SD.FrameWork.Data;
using SD.FrameWork.Context;
using SD.Core.Domain;
using SD.Core.Pagination;
using SD.Core.Sorting;
using SD.Core.Enum;
using SD.FrameWork.Extensions;

namespace SD.Services
{
    /// <summary>
    /// Default logger
    /// </summary>
    public partial class LogService : ILogService
    {
        #region Fields

        private readonly IRepository<Sys_Log> repository;
        private readonly IWebContext webContext;

        #endregion

        #region Ctor

        /// <summary>
        /// Ctor
        /// </summary>
        /// <param name="logRepository">Log repository</param>
        /// <param name="webHelper">Web helper</param>
        /// <param name="dbContext">DB context</param>
        /// <param name="dataProvider">WeData provider</param>
        /// <param name="commonSettings">Common settings</param>
        public LogService(IRepository<Sys_Log> repository, IWebContext webContext)
        {
            this.repository = repository;
            this.webContext = webContext;
        }

        #endregion

        #region Methods

        /// <summary>
        /// Determines whether a log level is enabled
        /// </summary>
        /// <param name="level">Log level</param>
        /// <returns>Result</returns>
        public virtual bool IsEnabled(LogLevel level)
        {
            switch (level)
            {
                case LogLevel.Debug:
                    return false;
                default:
                    return true;
            }
        }

        /// <summary>
        /// Deletes a log item
        /// </summary>
        /// <param name="log">Log item</param>
        public virtual void Delete(Sys_Log log)
        {
            if (log == null)
                throw new ArgumentNullException("log");

            this.repository.Delete(log.Id);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="log">Log item</param>
        public virtual void Delete(int Id)
        {
            this.repository.Delete(Id);
        }

        /// <summary>
        /// Clears a log
        /// </summary>
        public virtual void Clear()
        {
            this.repository.Execute("TRUNCATE TABLE [Sys_Log]");
        }

        public virtual IPagination<Sys_Log> Page(long page, long itemsPerPage, SortOptions sort = null, bool IncludeUnknown = true)
        {
            Sql sql = Sql.Builder.Append(@"select Id,ShortMessage,CreateTime,`User`,Level  from Sys_Log");
            if(!IncludeUnknown)
            {
                sql.Append(" WHERE `User` != '未知'");
            }
            sql.Append(sort.Q("CreateTime", "Desc"));
            return this.repository.Page(page, itemsPerPage,sql.SQL,sql.Arguments );
        }

        /// <summary>
        /// Gets a log item
        /// </summary>
        /// <param name="logId">Log item identifier</param>
        /// <returns>Log item</returns>
        public virtual Sys_Log Get(int id)
        {
            return this.repository.SingleOrDefault(id);
        }

        /// <summary>
        /// Get log items by identifiers
        /// </summary>
        /// <param name="logIds">Log item identifiers</param>
        /// <returns>Log items</returns>
        public virtual IList<Sys_Log> GetByIds(int[] ids)
        {
            return null;
        }

        /// <summary>
        /// Inserts a log item
        /// </summary>
        /// <param name="logLevel">Log level</param>
        /// <param name="shortMessage">The short message</param>
        /// <param name="fullMessage">The full message</param>
        /// <param name="customer">The customer to associate log record with</param>
        /// <returns>A log item</returns>
        public virtual Sys_Log Add(LogLevel logLevel, string shortMessage, string fullMessage = "", Sys_User user = null)
        {

            var log = new Sys_Log()
            {
                LogLevel = logLevel,
                ShortMessage = shortMessage,
                FullMessage = fullMessage,
                IpAddress = webContext.GetCurrentIpAddress(),
                User = (user == null) ? "未知" : user.Email,
                PageUrl = webContext.GetThisPageUrl(true),
                ReferrerUrl = webContext.GetUrlReferrer(),
                CreateTime = DateTime.Now
            };

            this.repository.Insert(log);

            return log;
        }

        #region Logger

        public void Debug(string message, Exception exception = null, Sys_User user = null)
        {
            FilteredLog(LogLevel.Debug, message, exception, user);
        }
        public void Information(string message, Exception exception = null, Sys_User user = null)
        {
            FilteredLog(LogLevel.Information, message, exception, user);
        }
        public void Warning( string message, Exception exception = null, Sys_User user = null)
        {
            FilteredLog(LogLevel.Warning, message, exception, user);
        }
        public void Error(string message, Exception exception = null, Sys_User user = null)
        {
            FilteredLog(LogLevel.Error, message, exception, user);
        }
        public void Fatal(string message, Exception exception = null, Sys_User user = null)
        {
            FilteredLog(LogLevel.Fatal, message, exception, user);
        }

        private void FilteredLog(LogLevel level, string message, Exception exception = null, Sys_User user = null)
        {
            //don't log thread abort exception
            if ((exception != null) && (exception is System.Threading.ThreadAbortException))
                return;

            if (this.IsEnabled(level))
            {
                string fullMessage = exception == null ? string.Empty : exception.ToString();
                this.Add(level, message, fullMessage, user);
            }
        }

        #endregion

        #endregion
    }
}
