using System;
using System.Collections.Generic;
using SD.Core.Pagination;

namespace SD.FrameWork.Data
{
    public interface IRepository<T>
    {
        ITransaction GetTransaction();

        int Execute(string sql, params object[] args);

        T1 ExecuteScalar<T1>(string sql, params object[] args);

        object Insert(T pocoObj);

        int Update(string sql, params object[] args);
        int Update(T pocoObj);

        int Delete(string sql, params object[] args);
        int Delete(object primaryKey);

        bool Exists(object primaryKey);
        bool Exists(string sql, params object[] args);

        T SingleOrDefault(object primaryKey);
        T SingleOrDefault(string sql, params object[] args);

        T FirstOrDefault(string sql, params object[] args);

        T Single(object primaryKey);
        T Single(string sql, params object[] args);

        T First(string sql, params object[] args);

        List<T> Fetch(string sql, params object[] args);
        List<T> Fetch(long page, long itemsPerPage, string sql, params object[] args);

        List<T> SkipTake(long skip, long take, string sql, params object[] args);

        IPagination<T> Page(long page, long itemsPerPage, string sql, params object[] args);
        IPagination<T1> Page<T1, T2>(long page, long itemsPerPage, string sql, params object[] args);
        IPagination<T1> Page<T1, T2, T3>(long page, long itemsPerPage, string sql, params object[] args);

        IEnumerable<T> Query(string sql, params object[] args);
        IEnumerable<T1> Query<T1>(string sql, params object[] args);
        IEnumerable<T1> Query<T1, T2>(string sql, params object[] args);
        IEnumerable<T1> Query<T1, T2, T3>(string sql, params object[] args);
        IEnumerable<T1> Query<T1, T2, T3, T4>(string sql, params object[] args);
    }
}
