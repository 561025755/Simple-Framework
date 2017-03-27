using SD.Data.Context;
using SD.Data.Internal;
using System;
using System.Linq;


namespace SD.Data
{
    public partial class MySqlDbContext : DbContext
    {
        public MySqlDbContext()
            : base("mysqlConn")
        {
            CommonConstruct();
        }

        public MySqlDbContext(string connectionStringName)
            : base(connectionStringName)
        {
            CommonConstruct();
        }

        partial void CommonConstruct();

        public interface IFactory
        {
            MySqlDbContext GetInstance();
        }

        public static IFactory Factory { get; set; }
        public static MySqlDbContext GetInstance()
        {
            if (_instance != null)
                return _instance;

            if (Factory != null)
                return Factory.GetInstance();
            else
                return new MySqlDbContext();
        }

        [ThreadStatic]
        static MySqlDbContext _instance;

        public override void OnBeginTransaction()
        {
            if (_instance == null)
                _instance = this;
        }

        public override void OnEndTransaction()
        {
            if (_instance == this)
                _instance = null;
        }

        #region Extension Page

        public Page<T1> Page<T1, T2>(long page, long itemsPerPage, string sql, params object[] args)
        {
            string sqlCount, sqlPage;
            BuildPageQueries<T1>((page - 1) * itemsPerPage, itemsPerPage, sql, ref args, out sqlCount, out sqlPage);
            return Page<T1, T2>(page, itemsPerPage, sqlCount, args, sqlPage, args);
        }

        public Page<T1> Page<T1, T2>(long page, long itemsPerPage, string sqlCount, object[] countArgs, string sqlPage, object[] pageArgs)
        {
            // Save the one-time command time out and use it for both queries
            var saveTimeout = OneTimeCommandTimeout;

            // Setup the paged result
            var result = new Page<T1>
            {
                CurrentPage = page,
                ItemsPerPage = itemsPerPage,
                TotalItems = ExecuteScalar<long>(sqlCount, countArgs)
            };
            result.TotalPages = result.TotalItems / itemsPerPage;

            if ((result.TotalItems % itemsPerPage) != 0)
                result.TotalPages++;

            OneTimeCommandTimeout = saveTimeout;

            // Get the records
            result.Items = Query<T1>(new Type[] { typeof(T1), typeof(T2) }, null, sqlPage, pageArgs).ToList();

            // Done
            return result;
        }

        public Page<T1> Page<T1, T2, T3>(long page, long itemsPerPage, string sql, params object[] args)
        {
            string sqlCount, sqlPage;
            BuildPageQueries<T1>((page - 1) * itemsPerPage, itemsPerPage, sql, ref args, out sqlCount, out sqlPage);
            return Page<T1, T2, T3>(page, itemsPerPage, sqlCount, args, sqlPage, args);
        }

        public Page<T1> Page<T1, T2, T3>(long page, long itemsPerPage, string sqlCount, object[] countArgs, string sqlPage, object[] pageArgs)
        {
            // Save the one-time command time out and use it for both queries
            var saveTimeout = OneTimeCommandTimeout;

            // Setup the paged result
            var result = new Page<T1>
            {
                CurrentPage = page,
                ItemsPerPage = itemsPerPage,
                TotalItems = ExecuteScalar<long>(sqlCount, countArgs)
            };
            result.TotalPages = result.TotalItems / itemsPerPage;

            if ((result.TotalItems % itemsPerPage) != 0)
                result.TotalPages++;

            OneTimeCommandTimeout = saveTimeout;

            // Get the records
            result.Items = Query<T1>(new Type[] { typeof(T1), typeof(T2), typeof(T3) }, null, sqlPage, pageArgs).ToList();

            // Done
            return result;
        }

        #endregion
    }
}
