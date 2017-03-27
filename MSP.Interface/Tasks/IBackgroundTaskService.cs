
using SD.Core.Domain;
using SD.Core.Pagination;
using SD.Core.Sorting;
using System;
using System.Collections.Generic;

namespace SD.Interface.Tasks
{
    /// <summary>
    /// Task service interface
    /// </summary>
    public partial interface IBackgroundTaskService
    {
        /// <summary>
        /// Deletes a task
        /// </summary>
        /// <param name="task">Task</param>
        void DeleteTask(Sys_Backgroundtask task);

        /// <summary>
        /// Gets a task
        /// </summary>
        /// <param name="taskId">Task identifier</param>
        /// <returns>Task</returns>
        Sys_Backgroundtask GetTaskById(int taskId);

        /// <summary>
        /// Gets a task by its type
        /// </summary>
        /// <param name="type">Task type</param>
        /// <returns>Task</returns>
        Sys_Backgroundtask GetTaskByType(string type);

        IPagination<Sys_Backgroundtask> Page(long page, long itemsPerPage, SortOptions sort = null);

        /// <summary>
        /// Gets all tasks
        /// </summary>
        /// <param name="showHidden">A value indicating whether to show hidden records</param>
        /// <returns>Tasks</returns>
        IList<Sys_Backgroundtask> GetAllTasks(bool showHidden = false);

        /// <summary>
        /// Inserts a task
        /// </summary>
        /// <param name="task">Task</param>
        void InsertTask(Sys_Backgroundtask task);

        /// <summary>
        /// Updates the task
        /// </summary>
        /// <param name="task">Task</param>
        void UpdateTask(Sys_Backgroundtask task);
    }
}
