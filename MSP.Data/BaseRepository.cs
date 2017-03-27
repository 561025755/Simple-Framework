using System;
using System.Collections.Generic;
using System.Linq;
using SD.Core.Pagination;
using SD.FrameWork.Data;
using SD.Data.Internal;

namespace SD.Data
{
    public partial class BaseRepository<T> : IRepository<T> where T : new()
    {
        public static MySqlDbContext repo { get { return MySqlDbContext.GetInstance(); } }

        public virtual ITransaction GetTransaction()
        {
            return repo.GetTransaction();
        }

        #region G

        public virtual int Execute(string sql, params object[] args)
        {
            return repo.Execute(sql, args);
        }

        public virtual T1 ExecuteScalar<T1>(string sql, params object[] args)
        {
            return repo.ExecuteScalar<T1>(sql, args);
        }

        #endregion

        public virtual object Insert(T pocoObj)
        {
            return repo.Insert(pocoObj);
        }

        public virtual int Update(string sql, params object[] args)
        {
            return repo.Update<T>(sql, args);
        }

        public virtual int Update(T pocoObj)
        {
            return repo.Update(pocoObj);
        }

        public virtual int Delete(string sql, params object[] args)
        {
            return repo.Delete<T>(sql, args);
        }

        public virtual int Delete(object primaryKey)
        {
            return repo.Delete<T>(primaryKey);
        }

        public virtual bool Exists(object primaryKey)
        {
            return repo.Exists<T>(primaryKey);
        }

        public virtual bool Exists(string sql, params object[] args)
        {
            return repo.Exists<T>(sql, args);
        }

        public virtual T SingleOrDefault(object primaryKey)
        {
            return repo.SingleOrDefault<T>(primaryKey);
        }

        public virtual T SingleOrDefault(string sql, params object[] args)
        {
            return repo.SingleOrDefault<T>(sql, args);
        }

        public virtual T FirstOrDefault(string sql, params object[] args)
        {
            return repo.FirstOrDefault<T>(sql, args);
        }

        public virtual T Single(object primaryKey)
        {
            return repo.Single<T>(primaryKey);
        }

        public virtual T Single(string sql, params object[] args)
        {
            return repo.Single<T>(sql, args);
        }

        public virtual T First(string sql, params object[] args)
        {
            return repo.First<T>(sql, args);
        }

        public virtual List<T> Fetch(string sql, params object[] args)
        {
            return repo.Fetch<T>(sql, args);
        }

        public virtual List<T> Fetch(long page, long itemsPerPage, string sql, params object[] args)
        {
            return repo.Fetch<T>(page, itemsPerPage, sql, args);
        }

        public virtual List<T> SkipTake(long skip, long take, string sql, params object[] args)
        {
            return repo.SkipTake<T>(skip, take, sql, args);
        }

        public virtual IPagination<T> Page(long page, long itemsPerPage, string sql, params object[] args)
        {
            return repo.Page<T>(page, itemsPerPage, sql, args).AsPagination();
        }

        public virtual IPagination<T1> Page<T1, T2>(long page, long itemsPerPage, string sql, params object[] args)
        {
            return repo.Page<T1, T2>(page, itemsPerPage, sql, args).AsPagination();
        }

        public virtual IPagination<T1> Page<T1, T2, T3>(long page, long itemsPerPage, string sql, params object[] args)
        {
            return repo.Page<T1, T2, T3>(page, itemsPerPage, sql, args).AsPagination();
        }

        public virtual IEnumerable<T> Query(string sql, params object[] args)
        {
            return repo.Query<T>(sql, args);
        }

        public virtual IEnumerable<T1> Query<T1>(string sql, params object[] args)
        {
            return repo.Query<T1>(sql, args);
        }

        public virtual IEnumerable<T1> Query<T1, T2>(string sql, params object[] args)
        {
            return repo.Query<T1, T2>(sql, args);
        }

        public virtual IEnumerable<T1> Query<T1, T2, T3>(string sql, params object[] args)
        {
            return repo.Query<T1, T2, T3>(sql, args);
        }

        public virtual IEnumerable<T1> Query<T1, T2, T3, T4>(string sql, params object[] args)
        {
            return repo.Query<T1, T2, T3, T4>(sql, args);
        }

    }
}
