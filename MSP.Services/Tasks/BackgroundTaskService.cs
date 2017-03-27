using SD.Core.Domain;
using SD.Core.Pagination;
using SD.Core.Sorting;
using SD.Data.Context;
using SD.FrameWork.Data;
using SD.Interface.Tasks;
using System;
using System.Collections.Generic;

namespace SD.Services.Tasks
{
    /// <summary>
    /// Task service
    /// </summary>
    public partial class BackgroundTaskService : IBackgroundTaskService
    {
        #region Fields

        private readonly IRepository<Sys_Backgroundtask> taskRepository;

        #endregion

        #region Ctor

        public BackgroundTaskService(IRepository<Sys_Backgroundtask> taskRepository)
        {
            this.taskRepository = taskRepository;
        }

        #endregion

        #region Methods

        /// <summary>
        /// Deletes a task
        /// </summary>
        /// <param name="task">Task</param>
        public virtual void DeleteTask(Sys_Backgroundtask task)
        {
            if (task == null)
                throw new ArgumentNullException("task");

            this.taskRepository.Delete(task.Id);
        }

        /// <summary>
        /// Gets a task
        /// </summary>
        /// <param name="taskId">Task identifier</param>
        /// <returns>Task</returns>
        public virtual Sys_Backgroundtask GetTaskById(int taskId)
        {
            if (taskId == 0)
                return null;

            return this.taskRepository.SingleOrDefault(taskId);
        }

        /// <summary>
        /// Gets a task by its type
        /// </summary>
        /// <param name="type">Task type</param>
        /// <returns>Task</returns>
        public virtual Sys_Backgroundtask GetTaskByType(string type)
        {
            if (String.IsNullOrWhiteSpace(type))
                return null;

            return this.taskRepository.FirstOrDefault("",type);
        }

        public virtual IPagination<Sys_Backgroundtask> Page(long page, long itemsPerPage, SortOptions sort = null)
        {
            return this.taskRepository.Page(page, itemsPerPage, sort.Q("CreateTime", "Desc"));
        }

        /// <summary>
        /// Gets all tasks
        /// </summary>
        /// <param name="showHidden">A value indicating whether to show hidden records</param>
        /// <returns>Tasks</returns>
        public virtual IList<Sys_Backgroundtask> GetAllTasks(bool showHidden = false)
        {
            Sql sql = Sql.Builder.Append(@"");

            if (!showHidden)
            {
                sql.Append("");
            }

            return this.taskRepository.Fetch(sql.SQL, sql.Arguments);
        }

        /// <summary>
        /// Inserts a task
        /// </summary>
        /// <param name="task">Task</param>
        public virtual void InsertTask(Sys_Backgroundtask task)
        {
            if (task == null)
                throw new ArgumentNullException("task");

            this.taskRepository.Insert(task);
        }

        /// <summary>
        /// Updates the task
        /// </summary>
        /// <param name="task">Task</param>
        public virtual void UpdateTask(Sys_Backgroundtask task)
        {
            if (task == null)
                throw new ArgumentNullException("task");

            this.taskRepository.Update(task);
        }

        #endregion
    }
}
