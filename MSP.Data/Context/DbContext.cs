using SD.Core.Domain;
using SD.Data.DatabaseTypes;
using SD.Data.Internal;
using SD.FrameWork.Data;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

namespace SD.Data.Context
{ 
    /// <summary>
    /// The main PetaPoco DbContext class.  You can either use this class directly, or derive from it.
    /// </summary>
    public class DbContext : IDisposable
    {
        #region Constructors
        /// <summary>
        /// Construct a database using a supplied IDbConnection
        /// </summary>
        /// <param name="connection">The IDbConnection to use</param>
        /// <remarks>
        /// The supplied IDbConnection will not be closed/disposed by PetaPoco - that remains
        /// the responsibility of the caller.
        /// </remarks>
        public DbContext(IDbConnection connection)
        {
            _sharedConnection = connection;
            _connectionString = connection.ConnectionString;
            _sharedConnectionDepth = 2;     // Prevent closing external connection
            CommonConstruct();
        }

        /// <summary>
        /// Construct a database using a supplied connections string and optionally a provider name
        /// </summary>
        /// <param name="connectionString">The DB connection string</param>
        /// <param name="providerName">The name of the DB provider to use</param>
        /// <remarks>
        /// PetaPoco will automatically close and dispose any connections it creates.
        /// </remarks>
        public DbContext(string connectionString, string providerName)
        {
            _connectionString = connectionString;
            _providerName = providerName;
            CommonConstruct();
        }

        /// <summary>
        /// Construct a DbContext using a supplied connection string and a DbProviderFactory
        /// </summary>
        /// <param name="connectionString">The connection string to use</param>
        /// <param name="provider">The DbProviderFactory to use for instantiating IDbConnection's</param>
        public DbContext(string connectionString, DbProviderFactory provider)
        {
            _connectionString = connectionString;
            _factory = provider;
            CommonConstruct();
        }

        /// <summary>
        /// Construct a DbContext using a supplied connectionString Name.  The actual connection string and provider will be 
        /// read from app/web.config.
        /// </summary>
        /// <param name="connectionStringName">The name of the connection</param>
        public DbContext(string connectionStringName)
        {
            // Use first?
            if (connectionStringName == "")
                connectionStringName = ConfigurationManager.ConnectionStrings[0].Name;

            // Work out connection string and provider name
            var providerName = "System.Data.SqlClient";
            if (ConfigurationManager.ConnectionStrings[connectionStringName] != null)
            {
                if (!string.IsNullOrEmpty(ConfigurationManager.ConnectionStrings[connectionStringName].ProviderName))
                    providerName = ConfigurationManager.ConnectionStrings[connectionStringName].ProviderName;
            }
            else
            {
                throw new InvalidOperationException("Can't find a connection string with the name '" + connectionStringName + "'");
            }

            // Store factory and connection string
            _connectionString = ConfigurationManager.ConnectionStrings[connectionStringName].ConnectionString;
            _providerName = providerName;
            CommonConstruct();
        }

        /// <summary>
        /// Provides common initialization for the various constructors
        /// </summary>
        private void CommonConstruct()
        {
            // Reset
            _transactionDepth = 0;
            EnableAutoSelect = true;
            EnableNamedParams = true;

            // If a provider name was supplied, get the IDbProviderFactory for it
            if (_providerName != null)
                _factory = DbProviderFactories.GetFactory(_providerName);

            // Resolve the DB Type
            string DBTypeName = (_factory == null ? _sharedConnection.GetType() : _factory.GetType()).Name;
            _dbType = DatabaseType.Resolve(DBTypeName, _providerName);

            // What character is used for delimiting parameters in SQL
            _paramPrefix = _dbType.GetParameterPrefix(_connectionString);
        }

        #endregion

        #region IDisposable
        /// <summary>
        /// Automatically close one open shared connection 
        /// </summary>
        public void Dispose()
        {
            // Automatically close one open connection reference
            //  (Works with KeepConnectionAlive and manually opening a shared connection)
            CloseSharedConnection();
        }
        #endregion

        #region Connection Management
        /// <summary>
        /// When set to true the first opened connection is kept alive until this object is disposed
        /// </summary>
        public bool KeepConnectionAlive
        {
            get;
            set;
        }

        /// <summary>
        /// Open a connection that will be used for all subsequent queries.
        /// </summary>
        /// <remarks>
        /// Calls to Open/CloseSharedConnection are reference counted and should be balanced
        /// </remarks>
        public void OpenSharedConnection()
        {
            if (_sharedConnectionDepth == 0)
            {
                _sharedConnection = _factory.CreateConnection();
                _sharedConnection.ConnectionString = _connectionString;

                if (_sharedConnection.State == ConnectionState.Broken)
                    _sharedConnection.Close();

                if (_sharedConnection.State == ConnectionState.Closed)
                    _sharedConnection.Open();

                _sharedConnection = OnConnectionOpened(_sharedConnection);

                if (KeepConnectionAlive)
                    _sharedConnectionDepth++;       // Make sure you call Dispose
            }
            _sharedConnectionDepth++;
        }

        /// <summary>
        /// Releases the shared connection
        /// </summary>
        public void CloseSharedConnection()
        {
            if (_sharedConnectionDepth > 0)
            {
                _sharedConnectionDepth--;
                if (_sharedConnectionDepth == 0)
                {
                    OnConnectionClosing(_sharedConnection);
                    _sharedConnection.Dispose();
                    _sharedConnection = null;
                }
            }
        }

        /// <summary>
        /// Provides access to the currently open shared connection (or null if none)
        /// </summary>
        public IDbConnection Connection
        {
            get { return _sharedConnection; }
        }

        #endregion

        #region Transaction Management
        // Helper to create a transaction scope

        /// <summary>
        /// Starts or continues a transaction.
        /// </summary>
        /// <returns>An ITransaction reference that must be Completed or disposed</returns>
        /// <remarks>
        /// This method makes management of calls to Begin/End/CompleteTransaction easier.  
        /// 
        /// The usage pattern for this should be:
        /// 
        /// using (var tx = db.GetTransaction())
        /// {
        ///		// Do stuff
        ///		db.Update(...);
        ///		
        ///     // Mark the transaction as complete
        ///     tx.Complete();
        /// }
        /// 
        /// Transactions can be nested but they must all be completed otherwise the entire
        /// transaction is aborted.
        /// </remarks>
        public ITransaction GetTransaction()
        {
            return new Transaction(this);
        }

        /// <summary>
        /// Called when a transaction starts.  Overridden by the T4 template generated database
        /// classes to ensure the same DB instance is used throughout the transaction.
        /// </summary>
        public virtual void OnBeginTransaction()
        {
        }

        /// <summary>
        /// Called when a transaction ends.
        /// </summary>
        public virtual void OnEndTransaction()
        {
        }

        /// <summary>
        /// Starts a transaction scope, see GetTransaction() for recommended usage
        /// </summary>
        public void BeginTransaction()
        {
            _transactionDepth++;

            if (_transactionDepth == 1)
            {
                OpenSharedConnection();
                _transaction = _sharedConnection.BeginTransaction();
                _transactionCancelled = false;
                OnBeginTransaction();
            }

        }

        /// <summary>
        /// Internal helper to cleanup transaction
        /// </summary>
        void CleanupTransaction()
        {
            OnEndTransaction();

            if (_transactionCancelled)
                _transaction.Rollback();
            else
                _transaction.Commit();

            _transaction.Dispose();
            _transaction = null;

            CloseSharedConnection();
        }

        /// <summary>
        /// Aborts the entire outer most transaction scope 
        /// </summary>
        /// <remarks>
        /// Called automatically by Transaction.Dispose()
        /// if the transaction wasn't completed.
        /// </remarks>
        public void AbortTransaction()
        {
            _transactionCancelled = true;
            if ((--_transactionDepth) == 0)
                CleanupTransaction();
        }

        /// <summary>
        /// Marks the current transaction scope as complete.
        /// </summary>
        public void CompleteTransaction()
        {
            if ((--_transactionDepth) == 0)
                CleanupTransaction();
        }

        #endregion

        #region Command Management
        /// <summary>
        /// Add a parameter to a DB command
        /// </summary>
        /// <param name="cmd">A reference to the IDbCommand to which the parameter is to be added</param>
        /// <param name="value">The value to assign to the parameter</param>
        /// <param name="pi">Optional, a reference to the property info of the POCO property from which the value is coming.</param>
        void AddParam(IDbCommand cmd, object value, PropertyInfo pi)
        {
            // Convert value to from poco type to db type
            if (pi != null)
            {
                var mapper = Mappers.GetMapper(pi.DeclaringType);
                var fn = mapper.GetToDbConverter(pi);
                if (fn != null)
                    value = fn(value);
            }

            // Support passed in parameters
            var idbParam = value as IDbDataParameter;
            if (idbParam != null)
            {
                idbParam.ParameterName = string.Format("{0}{1}", _paramPrefix, cmd.Parameters.Count);
                cmd.Parameters.Add(idbParam);
                return;
            }

            // Create the parameter
            var p = cmd.CreateParameter();
            p.ParameterName = string.Format("{0}{1}", _paramPrefix, cmd.Parameters.Count);

            // Assign the parmeter value
            if (value == null)
            {
                p.Value = DBNull.Value;
            }
            else
            {
                // Give the database type first crack at converting to DB required type
                value = _dbType.MapParameterValue(value);

                var t = value.GetType();
                if (t.IsEnum)       // PostgreSQL .NET driver wont cast enum to int
                {
                    p.Value = (int)value;
                }
                else if (t == typeof(Guid))
                {
                    p.Value = value.ToString();
                    p.DbType = DbType.String;
                    p.Size = 40;
                }
                else if (t == typeof(string))
                {
                    // out of memory exception occurs if trying to save more than 4000 characters to SQL Server CE NText column. Set before attempting to set Size, or Size will always max out at 4000
                    if ((value as string).Length + 1 > 4000 && p.GetType().Name == "SqlCeParameter")
                        p.GetType().GetProperty("SqlDbType").SetValue(p, SqlDbType.NText, null);

                    p.Size = Math.Max((value as string).Length + 1, 4000);      // Help query plan caching by using common size
                    p.Value = value;
                }
                else if (t == typeof(AnsiString))
                {
                    // Thanks @DataChomp for pointing out the SQL Server indexing performance hit of using wrong string type on varchar
                    p.Size = Math.Max((value as AnsiString).Value.Length + 1, 4000);
                    p.Value = (value as AnsiString).Value;
                    p.DbType = DbType.AnsiString;
                }
                else if (value.GetType().Name == "SqlGeography") //SqlGeography is a CLR Type
                {
                    p.GetType().GetProperty("UdtTypeName").SetValue(p, "geography", null); //geography is the equivalent SQL Server Type
                    p.Value = value;
                }

                else if (value.GetType().Name == "SqlGeometry") //SqlGeometry is a CLR Type
                {
                    p.GetType().GetProperty("UdtTypeName").SetValue(p, "geometry", null); //geography is the equivalent SQL Server Type
                    p.Value = value;
                }
                else
                {
                    p.Value = value;
                }
            }

            // Add to the collection
            cmd.Parameters.Add(p);
        }

        // Create a command
        static Regex rxParamsPrefix = new Regex(@"(?<!@)@\w+", RegexOptions.Compiled);
        public IDbCommand CreateCommand(IDbConnection connection, string sql, params object[] args)
        {
            // Perform named argument replacements
            if (EnableNamedParams)
            {
                var new_args = new List<object>();
                sql = ParametersHelper.ProcessParams(sql, args, new_args);
                args = new_args.ToArray();
            }

            // Perform parameter prefix replacements
            if (_paramPrefix != "@")
                sql = rxParamsPrefix.Replace(sql, m => _paramPrefix + m.Value.Substring(1));
            sql = sql.Replace("@@", "@");          // <- double @@ escapes a single @

            // Create the command and add parameters
            IDbCommand cmd = connection.CreateCommand();
            cmd.Connection = connection;
            cmd.CommandText = sql;
            cmd.Transaction = _transaction;
            foreach (var item in args)
            {
                AddParam(cmd, item, null);
            }

            // Notify the DB type
            _dbType.PreExecute(cmd);

            // Call logging
            if (!String.IsNullOrEmpty(sql))
                DoPreExecute(cmd);

            return cmd;
        }
        #endregion

        #region Exception Reporting and Logging

        /// <summary>
        /// Called if an exception occurs during processing of a DB operation.  Override to provide custom logging/handling.
        /// </summary>
        /// <param name="x">The exception instance</param>
        /// <returns>True to re-throw the exception, false to suppress it</returns>
        public virtual bool OnException(Exception x)
        {
            System.Diagnostics.Debug.WriteLine(x.ToString());
            System.Diagnostics.Debug.WriteLine(LastCommand);
            return true;
        }

        /// <summary>
        /// Called when DB connection opened
        /// </summary>
        /// <param name="conn">The newly opened IDbConnection</param>
        /// <returns>The same or a replacement IDbConnection</returns>
        /// <remarks>
        /// Override this method to provide custom logging of opening connection, or
        /// to provide a proxy IDbConnection.
        /// </remarks>
        public virtual IDbConnection OnConnectionOpened(IDbConnection conn)
        {
            return conn;
        }

        /// <summary>
        /// Called when DB connection closed
        /// </summary>
        /// <param name="conn">The soon to be closed IDBConnection</param>
        public virtual void OnConnectionClosing(IDbConnection conn)
        {
        }

        /// <summary>
        /// Called just before an DB command is executed
        /// </summary>
        /// <param name="cmd">The command to be executed</param>
        /// <remarks>
        /// Override this method to provide custom logging of commands and/or
        /// modification of the IDbCommand before it's executed
        /// </remarks>
        public virtual void OnExecutingCommand(IDbCommand cmd)
        {
        }

        /// <summary>
        /// Called on completion of command execution
        /// </summary>
        /// <param name="cmd">The IDbCommand that finished executing</param>
        public virtual void OnExecutedCommand(IDbCommand cmd)
        {
        }

        #endregion

        #region operation: Execute 
        /// <summary>
        /// Executes a non-query command
        /// </summary>
        /// <param name="sql">The SQL statement to execute</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>The number of rows affected</returns>
        public int Execute(string sql, params object[] args)
        {
            try
            {
                OpenSharedConnection();
                try
                {
                    using (var cmd = CreateCommand(_sharedConnection, sql, args))
                    {
                        var retv = cmd.ExecuteNonQuery();
                        OnExecutedCommand(cmd);
                        return retv;
                    }
                }
                finally
                {
                    CloseSharedConnection();
                }
            }
            catch (Exception x)
            {
                if (OnException(x))
                    throw;
                return -1;
            }
        }

        /// <summary>
        /// Executes a non-query command
        /// </summary>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>The number of rows affected</returns>
        public int Execute(Sql sql)
        {
            return Execute(sql.SQL, sql.Arguments);
        }

        #endregion

        #region operation: ExecuteScalar

        /// <summary>
        /// Executes a query and return the first column of the first row in the result set.
        /// </summary>
        /// <typeparam name="T">The type that the result value should be cast to</typeparam>
        /// <param name="sql">The SQL query to execute</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>The scalar value cast to T</returns>
        public T ExecuteScalar<T>(string sql, params object[] args)
        {
            try
            {
                OpenSharedConnection();
                try
                {
                    using (var cmd = CreateCommand(_sharedConnection, sql, args))
                    {
                        object val = cmd.ExecuteScalar();
                        OnExecutedCommand(cmd);

                        // Handle nullable types
                        Type u = Nullable.GetUnderlyingType(typeof(T));
                        if (u != null && val == null)
                            return default(T);
                        //null与数字之间的转换
                        if (u == null && val == null)
                        {
                            return default(T);
                        }
                        return (T)Convert.ChangeType(val, u == null ? typeof(T) : u);
                    }
                }
                finally
                {
                    CloseSharedConnection();
                }
            }
            catch (Exception x)
            {
                if (OnException(x))
                    throw;
                return default(T);
            }
        }

        /// <summary>
        /// Executes a query and return the first column of the first row in the result set.
        /// </summary>
        /// <typeparam name="T">The type that the result value should be cast to</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>The scalar value cast to T</returns>
        public T ExecuteScalar<T>(Sql sql)
        {
            return ExecuteScalar<T>(sql.SQL, sql.Arguments);
        }

        #endregion

        #region operation: Fetch

        /// <summary>
        /// Runs a query and returns the result set as a typed list
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">The SQL query to execute</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A List holding the results of the query</returns>
        public List<T> Fetch<T>(string sql, params object[] args)
        {
            return Query<T>(sql, args).ToList();
        }

        /// <summary>
        /// Runs a query and returns the result set as a typed list
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A List holding the results of the query</returns>
        public List<T> Fetch<T>(Sql sql)
        {
            return Fetch<T>(sql.SQL, sql.Arguments);
        }

        #endregion

        #region operation: Page

        /// <summary>
        /// Starting with a regular SELECT statement, derives the SQL statements required to query a 
        /// DB for a page of records and the total number of records
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="skip">The number of rows to skip before the start of the page</param>
        /// <param name="take">The number of rows in the page</param>
        /// <param name="sql">The original SQL select statement</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <param name="sqlCount">Outputs the SQL statement to query for the total number of matching rows</param>
        /// <param name="sqlPage">Outputs the SQL statement to retrieve a single page of matching rows</param>
        protected void BuildPageQueries<T>(long skip, long take, string sql, ref object[] args, out string sqlCount, out string sqlPage)
        {
            // Add auto select clause
            if (EnableAutoSelect)
                sql = AutoSelectHelper.AddSelectClause<T>(_dbType, sql);

            // Split the SQL
            PagingHelper.SQLParts parts;
            if (!PagingHelper.SplitSQL(sql, out parts))
                throw new Exception("Unable to parse SQL statement for paged query");

            sqlPage = _dbType.BuildPageQuery(skip, take, parts, ref args);
            sqlCount = parts.sqlCount;
        }

        /// <summary>
        /// Retrieves a page of records	and the total number of available records
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="page">The 1 based page number to retrieve</param>
        /// <param name="itemsPerPage">The number of records per page</param>
        /// <param name="sqlCount">The SQL to retrieve the total number of records</param>
        /// <param name="countArgs">Arguments to any embedded parameters in the sqlCount statement</param>
        /// <param name="sqlPage">The SQL To retrieve a single page of results</param>
        /// <param name="pageArgs">Arguments to any embedded parameters in the sqlPage statement</param>
        /// <returns>A Page of results</returns>
        /// <remarks>
        /// This method allows separate SQL statements to be explicitly provided for the two parts of the page query.
        /// The page and itemsPerPage parameters are not used directly and are used simply to populate the returned Page object.
        /// </remarks>
        public Page<T> Page<T>(long page, long itemsPerPage, string sqlCount, object[] countArgs, string sqlPage, object[] pageArgs)
        {
            // Save the one-time command time out and use it for both queries
            var saveTimeout = OneTimeCommandTimeout;

            // Setup the paged result
            var result = new Page<T>
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
            result.Items = Fetch<T>(sqlPage, pageArgs);

            // Done
            return result;
        }


        /// <summary>
        /// Retrieves a page of records	and the total number of available records
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="page">The 1 based page number to retrieve</param>
        /// <param name="itemsPerPage">The number of records per page</param>
        /// <param name="sql">The base SQL query</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL statement</param>
        /// <returns>A Page of results</returns>
        /// <remarks>
        /// PetaPoco will automatically modify the supplied SELECT statement to only retrieve the
        /// records for the specified page.  It will also execute a second query to retrieve the
        /// total number of records in the result set.
        /// </remarks>
        public Page<T> Page<T>(long page, long itemsPerPage, string sql, params object[] args)
        {
            string sqlCount, sqlPage;
            BuildPageQueries<T>((page - 1) * itemsPerPage, itemsPerPage, sql, ref args, out sqlCount, out sqlPage);
            return Page<T>(page, itemsPerPage, sqlCount, args, sqlPage, args);
        }

        /// <summary>
        /// Retrieves a page of records	and the total number of available records
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="page">The 1 based page number to retrieve</param>
        /// <param name="itemsPerPage">The number of records per page</param>
        /// <param name="sql">An SQL builder object representing the base SQL query and it's arguments</param>
        /// <returns>A Page of results</returns>
        /// <remarks>
        /// PetaPoco will automatically modify the supplied SELECT statement to only retrieve the
        /// records for the specified page.  It will also execute a second query to retrieve the
        /// total number of records in the result set.
        /// </remarks>
        public Page<T> Page<T>(long page, long itemsPerPage, Sql sql)
        {
            return Page<T>(page, itemsPerPage, sql.SQL, sql.Arguments);
        }

        /// <summary>
        /// Retrieves a page of records	and the total number of available records
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="page">The 1 based page number to retrieve</param>
        /// <param name="itemsPerPage">The number of records per page</param>
        /// <param name="sqlCount">An SQL builder object representing the SQL to retrieve the total number of records</param>
        /// <param name="sqlPage">An SQL builder object representing the SQL to retrieve a single page of results</param>
        /// <returns>A Page of results</returns>
        /// <remarks>
        /// This method allows separate SQL statements to be explicitly provided for the two parts of the page query.
        /// The page and itemsPerPage parameters are not used directly and are used simply to populate the returned Page object.
        /// </remarks>
        public Page<T> Page<T>(long page, long itemsPerPage, Sql sqlCount, Sql sqlPage)
        {
            return Page<T>(page, itemsPerPage, sqlCount.SQL, sqlCount.Arguments, sqlPage.SQL, sqlPage.Arguments);
        }

        #endregion

        #region operation: Fetch (page)

        /// <summary>
        /// Retrieves a page of records (without the total count)
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="page">The 1 based page number to retrieve</param>
        /// <param name="itemsPerPage">The number of records per page</param>
        /// <param name="sql">The base SQL query</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL statement</param>
        /// <returns>A List of results</returns>
        /// <remarks>
        /// PetaPoco will automatically modify the supplied SELECT statement to only retrieve the
        /// records for the specified page.
        /// </remarks>
        public List<T> Fetch<T>(long page, long itemsPerPage, string sql, params object[] args)
        {
            return SkipTake<T>((page - 1) * itemsPerPage, itemsPerPage, sql, args);
        }

        /// <summary>
        /// Retrieves a page of records (without the total count)
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="page">The 1 based page number to retrieve</param>
        /// <param name="itemsPerPage">The number of records per page</param>
        /// <param name="sql">An SQL builder object representing the base SQL query and it's arguments</param>
        /// <returns>A List of results</returns>
        /// <remarks>
        /// PetaPoco will automatically modify the supplied SELECT statement to only retrieve the
        /// records for the specified page.
        /// </remarks>
        public List<T> Fetch<T>(long page, long itemsPerPage, Sql sql)
        {
            return SkipTake<T>((page - 1) * itemsPerPage, itemsPerPage, sql.SQL, sql.Arguments);
        }

        #endregion

        #region operation: SkipTake

        /// <summary>
        /// Retrieves a range of records from result set
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="skip">The number of rows at the start of the result set to skip over</param>
        /// <param name="take">The number of rows to retrieve</param>
        /// <param name="sql">The base SQL query</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL statement</param>
        /// <returns>A List of results</returns>
        /// <remarks>
        /// PetaPoco will automatically modify the supplied SELECT statement to only retrieve the
        /// records for the specified range.
        /// </remarks>
        public List<T> SkipTake<T>(long skip, long take, string sql, params object[] args)
        {
            string sqlCount, sqlPage;
            BuildPageQueries<T>(skip, take, sql, ref args, out sqlCount, out sqlPage);
            return Fetch<T>(sqlPage, args);
        }

        /// <summary>
        /// Retrieves a range of records from result set
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="skip">The number of rows at the start of the result set to skip over</param>
        /// <param name="take">The number of rows to retrieve</param>
        /// <param name="sql">An SQL builder object representing the base SQL query and it's arguments</param>
        /// <returns>A List of results</returns>
        /// <remarks>
        /// PetaPoco will automatically modify the supplied SELECT statement to only retrieve the
        /// records for the specified range.
        /// </remarks>
        public List<T> SkipTake<T>(long skip, long take, Sql sql)
        {
            return SkipTake<T>(skip, take, sql.SQL, sql.Arguments);
        }
        #endregion

        #region operation: Query

        /// <summary>
        /// Runs an SQL query, returning the results as an IEnumerable collection
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">The SQL query</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL statement</param>
        /// <returns>An enumerable collection of result records</returns>
        /// <remarks>
        /// For some DB providers, care should be taken to not start a new Query before finishing with
        /// and disposing the previous one. In cases where this is an issue, consider using Fetch which
        /// returns the results as a List rather than an IEnumerable.
        /// </remarks>
        public IEnumerable<T> Query<T>(string sql, params object[] args)
        {
            if (EnableAutoSelect)
                sql = AutoSelectHelper.AddSelectClause<T>(_dbType, sql);

            OpenSharedConnection();
            try
            {
                using (var cmd = CreateCommand(_sharedConnection, sql, args))
                {
                    IDataReader r;
                    var pd = PocoData.ForType(typeof(T));
                    try
                    {
                        r = cmd.ExecuteReader();
                        OnExecutedCommand(cmd);
                    }
                    catch (Exception x)
                    {
                        if (OnException(x))
                            throw;
                        yield break;
                    }
                    var factory = pd.GetFactory(cmd.CommandText, _sharedConnection.ConnectionString, 0, r.FieldCount, r) as Func<IDataReader, T>;
                    using (r)
                    {
                        while (true)
                        {
                            T poco;
                            try
                            {
                                if (!r.Read())
                                    yield break;
                                poco = factory(r);
                            }
                            catch (Exception x)
                            {
                                if (OnException(x))
                                    throw;
                                yield break;
                            }

                            yield return poco;
                        }
                    }
                }
            }
            finally
            {
                CloseSharedConnection();
            }
        }

        /// <summary>
        /// Runs an SQL query, returning the results as an IEnumerable collection
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">An SQL builder object representing the base SQL query and it's arguments</param>
        /// <returns>An enumerable collection of result records</returns>
        /// <remarks>
        /// For some DB providers, care should be taken to not start a new Query before finishing with
        /// and disposing the previous one. In cases where this is an issue, consider using Fetch which
        /// returns the results as a List rather than an IEnumerable.
        /// </remarks>
        public IEnumerable<T> Query<T>(Sql sql)
        {
            return Query<T>(sql.SQL, sql.Arguments);
        }

        #endregion

        #region operation: Exists

        /// <summary>
        /// Checks for the existance of a row matching the specified condition
        /// </summary>
        /// <typeparam name="T">The Type representing the table being queried</typeparam>
        /// <param name="sqlCondition">The SQL expression to be tested for (ie: the WHERE expression)</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL statement</param>
        /// <returns>True if a record matching the condition is found.</returns>
        public bool Exists<T>(string sqlCondition, params object[] args)
        {
            var poco = PocoData.ForType(typeof(T)).TableInfo;

            return ExecuteScalar<int>(string.Format(_dbType.GetExistsSql(), poco.TableName, sqlCondition), args) != 0;
        }

        /// <summary>
        /// Checks for the existance of a row with the specified primary key value.
        /// </summary>
        /// <typeparam name="T">The Type representing the table being queried</typeparam>
        /// <param name="primaryKey">The primary key value to look for</param>
        /// <returns>True if a record with the specified primary key value exists.</returns>
        public bool Exists<T>(object primaryKey)
        {
            return Exists<T>(string.Format("{0}=@0", _dbType.EscapeSqlIdentifier(PocoData.ForType(typeof(T)).TableInfo.PrimaryKey)), primaryKey);
        }

        #endregion

        #region operation: linq style (Exists, Single, SingleOrDefault etc...)

        /// <summary>
        /// Returns the record with the specified primary key value
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="primaryKey">The primary key value of the record to fetch</param>
        /// <returns>The single record matching the specified primary key value</returns>
        /// <remarks>
        /// Throws an exception if there are zero or more than one record with the specified primary key value.
        /// </remarks>
        public T Single<T>(object primaryKey)
        {
            return Single<T>(string.Format("WHERE {0}=@0", _dbType.EscapeSqlIdentifier(PocoData.ForType(typeof(T)).TableInfo.PrimaryKey)), primaryKey);
        }

        /// <summary>
        /// Returns the record with the specified primary key value, or the default value if not found
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="primaryKey">The primary key value of the record to fetch</param>
        /// <returns>The single record matching the specified primary key value</returns>
        /// <remarks>
        /// If there are no records with the specified primary key value, default(T) (typically null) is returned.
        /// </remarks>
        public T SingleOrDefault<T>(object primaryKey)
        {
            return SingleOrDefault<T>(string.Format("WHERE {0}=@0", _dbType.EscapeSqlIdentifier(PocoData.ForType(typeof(T)).TableInfo.PrimaryKey)), primaryKey);
        }

        /// <summary>
        /// Runs a query that should always return a single row.
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">The SQL query</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL statement</param>
        /// <returns>The single record matching the specified primary key value</returns>
        /// <remarks>
        /// Throws an exception if there are zero or more than one matching record
        /// </remarks>
        public T Single<T>(string sql, params object[] args)
        {
            return Query<T>(sql, args).Single();
        }

        /// <summary>
        /// Runs a query that should always return either a single row, or no rows
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">The SQL query</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL statement</param>
        /// <returns>The single record matching the specified primary key value, or default(T) if no matching rows</returns>
        public T SingleOrDefault<T>(string sql, params object[] args)
        {
            return Query<T>(sql, args).SingleOrDefault();
        }

        /// <summary>
        /// Runs a query that should always return at least one return
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">The SQL query</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL statement</param>
        /// <returns>The first record in the result set</returns>
        public T First<T>(string sql, params object[] args)
        {
            return Query<T>(sql, args).First();
        }

        /// <summary>
        /// Runs a query and returns the first record, or the default value if no matching records
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">The SQL query</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL statement</param>
        /// <returns>The first record in the result set, or default(T) if no matching rows</returns>
        public T FirstOrDefault<T>(string sql, params object[] args)
        {
            return Query<T>(sql, args).FirstOrDefault();
        }


        /// <summary>
        /// Runs a query that should always return a single row.
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>The single record matching the specified primary key value</returns>
        /// <remarks>
        /// Throws an exception if there are zero or more than one matching record
        /// </remarks>
        public T Single<T>(Sql sql)
        {
            return Query<T>(sql).Single();
        }

        /// <summary>
        /// Runs a query that should always return either a single row, or no rows
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>The single record matching the specified primary key value, or default(T) if no matching rows</returns>
        public T SingleOrDefault<T>(Sql sql)
        {
            return Query<T>(sql).SingleOrDefault();
        }

        /// <summary>
        /// Runs a query that should always return at least one return
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>The first record in the result set</returns>
        public T First<T>(Sql sql)
        {
            return Query<T>(sql).First();
        }

        /// <summary>
        /// Runs a query and returns the first record, or the default value if no matching records
        /// </summary>
        /// <typeparam name="T">The Type representing a row in the result set</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>The first record in the result set, or default(T) if no matching rows</returns>
        public T FirstOrDefault<T>(Sql sql)
        {
            return Query<T>(sql).FirstOrDefault();
        }
        #endregion

        #region operation: Insert

        /// <summary>
        /// Performs an SQL Insert
        /// </summary>
        /// <param name="tableName">The name of the table to insert into</param>
        /// <param name="primaryKeyName">The name of the primary key column of the table</param>
        /// <param name="poco">The POCO object that specifies the column values to be inserted</param>
        /// <returns>The auto allocated primary key of the new record</returns>
        public object Insert(string tableName, string primaryKeyName, object poco)
        {
            return Insert(tableName, primaryKeyName, true, poco);
        }



        /// <summary>
        /// Performs an SQL Insert
        /// </summary>
        /// <param name="tableName">The name of the table to insert into</param>
        /// <param name="primaryKeyName">The name of the primary key column of the table</param>
        /// <param name="autoIncrement">True if the primary key is automatically allocated by the DB</param>
        /// <param name="poco">The POCO object that specifies the column values to be inserted</param>
        /// <returns>The auto allocated primary key of the new record, or null for non-auto-increment tables</returns>
        /// <remarks>Inserts a poco into a table.  If the poco has a property with the same name 
        /// as the primary key the id of the new record is assigned to it.  Either way,
        /// the new id is returned.</remarks>
        public object Insert(string tableName, string primaryKeyName, bool autoIncrement, object poco)
        {
            try
            {
                OpenSharedConnection();
                try
                {
                    using (var cmd = CreateCommand(_sharedConnection, ""))
                    {
                        var pd = PocoData.ForObject(poco, primaryKeyName);
                        var names = new List<string>();
                        var values = new List<string>();
                        var index = 0;
                        foreach (var i in pd.Columns)
                        {
                            // Don't insert result columns
                            if (i.Value.ResultColumn)
                                continue;

                            // Don't insert the primary key (except under oracle where we need bring in the next sequence value)
                            if (autoIncrement && primaryKeyName != null && string.Compare(i.Key, primaryKeyName, true) == 0)
                            {
                                // Setup auto increment expression
                                string autoIncExpression = _dbType.GetAutoIncrementExpression(pd.TableInfo);
                                if (autoIncExpression != null)
                                {
                                    names.Add(i.Key);
                                    values.Add(autoIncExpression);
                                }
                                continue;
                            }

                            names.Add(_dbType.EscapeSqlIdentifier(i.Key));
                            values.Add(string.Format("{0}{1}", _paramPrefix, index++));
                            AddParam(cmd, i.Value.GetValue(poco), i.Value.PropertyInfo);
                        }

                        string outputClause = String.Empty;
                        if (autoIncrement)
                        {
                            outputClause = _dbType.GetInsertOutputClause(primaryKeyName);
                        }


                        cmd.CommandText = string.Format("INSERT INTO {0} ({1}){2} VALUES ({3})",
                                _dbType.EscapeTableName(tableName),
                                string.Join(",", names.ToArray()),
                                outputClause,
                                string.Join(",", values.ToArray())
                                );

                        if (!autoIncrement)
                        {
                            DoPreExecute(cmd);
                            cmd.ExecuteNonQuery();
                            OnExecutedCommand(cmd);

                            PocoColumn pkColumn;
                            if (primaryKeyName != null && pd.Columns.TryGetValue(primaryKeyName, out pkColumn))
                                return pkColumn.GetValue(poco);
                            else
                                return null;
                        }


                        object id = _dbType.ExecuteInsert(this, cmd, primaryKeyName);


                        // Assign the ID back to the primary key property
                        if (primaryKeyName != null)
                        {
                            PocoColumn pc;
                            if (pd.Columns.TryGetValue(primaryKeyName, out pc))
                            {
                                pc.SetValue(poco, pc.ChangeType(id));
                            }
                        }

                        return id;
                    }
                }
                finally
                {
                    CloseSharedConnection();
                }
            }
            catch (Exception x)
            {
                if (OnException(x))
                    throw;
                return null;
            }
        }

        /// <summary>
        /// Performs an SQL Insert
        /// </summary>
        /// <param name="poco">The POCO object that specifies the column values to be inserted</param>
        /// <returns>The auto allocated primary key of the new record, or null for non-auto-increment tables</returns>
        /// <remarks>The name of the table, it's primary key and whether it's an auto-allocated primary key are retrieved
        /// from the POCO's attributes</remarks>
        public object Insert(object poco)
        {
            var pd = PocoData.ForType(poco.GetType());
            return Insert(pd.TableInfo.TableName, pd.TableInfo.PrimaryKey, pd.TableInfo.AutoIncrement, poco);
        }

        #endregion

        #region operation: Update

        /// <summary>
        /// Performs an SQL update
        /// </summary>
        /// <param name="tableName">The name of the table to update</param>
        /// <param name="primaryKeyName">The name of the primary key column of the table</param>
        /// <param name="poco">The POCO object that specifies the column values to be updated</param>
        /// <param name="primaryKeyValue">The primary key of the record to be updated</param>
        /// <returns>The number of affected records</returns>
        public int Update(string tableName, string primaryKeyName, object poco, object primaryKeyValue)
        {
            return Update(tableName, primaryKeyName, poco, primaryKeyValue, null);
        }

        /// <summary>
        /// Performs an SQL update
        /// </summary>
        /// <param name="tableName">The name of the table to update</param>
        /// <param name="primaryKeyName">The name of the primary key column of the table</param>
        /// <param name="poco">The POCO object that specifies the column values to be updated</param>
        /// <param name="primaryKeyValue">The primary key of the record to be updated</param>
        /// <param name="columns">The column names of the columns to be updated, or null for all</param>
        /// <returns>The number of affected rows</returns>
        public int Update(string tableName, string primaryKeyName, object poco, object primaryKeyValue, IEnumerable<string> columns)
        {
            try
            {
                OpenSharedConnection();
                try
                {
                    using (var cmd = CreateCommand(_sharedConnection, ""))
                    {
                        var sb = new StringBuilder();
                        var index = 0;
                        var pd = PocoData.ForObject(poco, primaryKeyName);
                        if (columns == null)
                        {
                            foreach (var i in pd.Columns)
                            {
                                // Don't update the primary key, but grab the value if we don't have it
                                if (string.Compare(i.Key, primaryKeyName, true) == 0)
                                {
                                    if (primaryKeyValue == null)
                                        primaryKeyValue = i.Value.GetValue(poco);
                                    continue;
                                }

                                // Dont update result only columns
                                if (i.Value.ResultColumn)
                                    continue;

                                // Build the sql
                                if (index > 0)
                                    sb.Append(", ");
                                sb.AppendFormat("{0} = {1}{2}", _dbType.EscapeSqlIdentifier(i.Key), _paramPrefix, index++);

                                // Store the parameter in the command
                                AddParam(cmd, i.Value.GetValue(poco), i.Value.PropertyInfo);
                            }
                        }
                        else
                        {
                            foreach (var colname in columns)
                            {
                                var pc = pd.Columns[colname];

                                // Build the sql
                                if (index > 0)
                                    sb.Append(", ");
                                sb.AppendFormat("{0} = {1}{2}", _dbType.EscapeSqlIdentifier(colname), _paramPrefix, index++);

                                // Store the parameter in the command
                                AddParam(cmd, pc.GetValue(poco), pc.PropertyInfo);
                            }

                            // Grab primary key value
                            if (primaryKeyValue == null)
                            {
                                var pc = pd.Columns[primaryKeyName];
                                primaryKeyValue = pc.GetValue(poco);
                            }

                        }

                        // Find the property info for the primary key
                        PropertyInfo pkpi = null;
                        if (primaryKeyName != null)
                        {
                            pkpi = pd.Columns[primaryKeyName].PropertyInfo;
                        }

                        cmd.CommandText = string.Format("UPDATE {0} SET {1} WHERE {2} = {3}{4}",
                                            _dbType.EscapeTableName(tableName), sb.ToString(), _dbType.EscapeSqlIdentifier(primaryKeyName), _paramPrefix, index++);
                        AddParam(cmd, primaryKeyValue, pkpi);

                        DoPreExecute(cmd);

                        // Do it
                        var retv = cmd.ExecuteNonQuery();
                        OnExecutedCommand(cmd);
                        return retv;
                    }
                }
                finally
                {
                    CloseSharedConnection();
                }
            }
            catch (Exception x)
            {
                if (OnException(x))
                    throw;
                return -1;
            }
        }

        /// <summary>
        /// Performs an SQL update
        /// </summary>
        /// <param name="tableName">The name of the table to update</param>
        /// <param name="primaryKeyName">The name of the primary key column of the table</param>
        /// <param name="poco">The POCO object that specifies the column values to be updated</param>
        /// <returns>The number of affected rows</returns>
        public int Update(string tableName, string primaryKeyName, object poco)
        {
            return Update(tableName, primaryKeyName, poco, null);
        }

        /// <summary>
        /// Performs an SQL update
        /// </summary>
        /// <param name="tableName">The name of the table to update</param>
        /// <param name="primaryKeyName">The name of the primary key column of the table</param>
        /// <param name="poco">The POCO object that specifies the column values to be updated</param>
        /// <param name="columns">The column names of the columns to be updated, or null for all</param>
        /// <returns>The number of affected rows</returns>
        public int Update(string tableName, string primaryKeyName, object poco, IEnumerable<string> columns)
        {
            return Update(tableName, primaryKeyName, poco, null, columns);
        }

        /// <summary>
        /// Performs an SQL update
        /// </summary>
        /// <param name="poco">The POCO object that specifies the column values to be updated</param>
        /// <param name="columns">The column names of the columns to be updated, or null for all</param>
        /// <returns>The number of affected rows</returns>
        public int Update(object poco, IEnumerable<string> columns)
        {
            return Update(poco, null, columns);
        }

        /// <summary>
        /// Performs an SQL update
        /// </summary>
        /// <param name="poco">The POCO object that specifies the column values to be updated</param>
        /// <returns>The number of affected rows</returns>
        public int Update(object poco)
        {
            return Update(poco, null, null);
        }

        /// <summary>
        /// Performs an SQL update
        /// </summary>
        /// <param name="poco">The POCO object that specifies the column values to be updated</param>
        /// <param name="primaryKeyValue">The primary key of the record to be updated</param>
        /// <returns>The number of affected rows</returns>
        public int Update(object poco, object primaryKeyValue)
        {
            return Update(poco, primaryKeyValue, null);
        }

        /// <summary>
        /// Performs an SQL update
        /// </summary>
        /// <param name="poco">The POCO object that specifies the column values to be updated</param>
        /// <param name="primaryKeyValue">The primary key of the record to be updated</param>
        /// <param name="columns">The column names of the columns to be updated, or null for all</param>
        /// <returns>The number of affected rows</returns>
        public int Update(object poco, object primaryKeyValue, IEnumerable<string> columns)
        {
            var pd = PocoData.ForType(poco.GetType());
            return Update(pd.TableInfo.TableName, pd.TableInfo.PrimaryKey, poco, primaryKeyValue, columns);
        }

        /// <summary>
        /// Performs an SQL update
        /// </summary>
        /// <typeparam name="T">The POCO class who's attributes specify the name of the table to update</typeparam>
        /// <param name="sql">The SQL update and condition clause (ie: everything after "UPDATE tablename"</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>The number of affected rows</returns>
        public int Update<T>(string sql, params object[] args)
        {
            var pd = PocoData.ForType(typeof(T));
            return Execute(string.Format("UPDATE {0} {1}", _dbType.EscapeTableName(pd.TableInfo.TableName), sql), args);
        }

        /// <summary>
        /// Performs an SQL update
        /// </summary>
        /// <typeparam name="T">The POCO class who's attributes specify the name of the table to update</typeparam>
        /// <param name="sql">An SQL builder object representing the SQL update and condition clause (ie: everything after "UPDATE tablename"</param>
        /// <returns>The number of affected rows</returns>
        public int Update<T>(Sql sql)
        {
            var pd = PocoData.ForType(typeof(T));
            return Execute(new Sql(string.Format("UPDATE {0}", _dbType.EscapeTableName(pd.TableInfo.TableName))).Append(sql));
        }
        #endregion

        #region operation: Delete

        /// <summary>
        /// Performs and SQL Delete
        /// </summary>
        /// <param name="tableName">The name of the table to delete from</param>
        /// <param name="primaryKeyName">The name of the primary key column</param>
        /// <param name="poco">The POCO object whose primary key value will be used to delete the row</param>
        /// <returns>The number of rows affected</returns>
        public int Delete(string tableName, string primaryKeyName, object poco)
        {
            return Delete(tableName, primaryKeyName, poco, null);
        }

        /// <summary>
        /// Performs and SQL Delete
        /// </summary>
        /// <param name="tableName">The name of the table to delete from</param>
        /// <param name="primaryKeyName">The name of the primary key column</param>
        /// <param name="poco">The POCO object whose primary key value will be used to delete the row (or null to use the supplied primary key value)</param>
        /// <param name="primaryKeyValue">The value of the primary key identifing the record to be deleted (or null, or get this value from the POCO instance)</param>
        /// <returns>The number of rows affected</returns>
        public int Delete(string tableName, string primaryKeyName, object poco, object primaryKeyValue)
        {
            // If primary key value not specified, pick it up from the object
            if (primaryKeyValue == null)
            {
                var pd = PocoData.ForObject(poco, primaryKeyName);
                PocoColumn pc;
                if (pd.Columns.TryGetValue(primaryKeyName, out pc))
                {
                    primaryKeyValue = pc.GetValue(poco);
                }
            }

            // Do it
            var sql = string.Format("DELETE FROM {0} WHERE {1}=@0", _dbType.EscapeTableName(tableName), _dbType.EscapeSqlIdentifier(primaryKeyName));
            return Execute(sql, primaryKeyValue);
        }

        /// <summary>
        /// Performs an SQL Delete
        /// </summary>
        /// <param name="poco">The POCO object specifying the table name and primary key value of the row to be deleted</param>
        /// <returns>The number of rows affected</returns>
        public int Delete(object poco)
        {
            var pd = PocoData.ForType(poco.GetType());
            return Delete(pd.TableInfo.TableName, pd.TableInfo.PrimaryKey, poco);
        }

        /// <summary>
        /// Performs an SQL Delete
        /// </summary>
        /// <typeparam name="T">The POCO class whose attributes identify the table and primary key to be used in the delete</typeparam>
        /// <param name="pocoOrPrimaryKey">The value of the primary key of the row to delete</param>
        /// <returns></returns>
        public int Delete<T>(object pocoOrPrimaryKey)
        {
            if (pocoOrPrimaryKey.GetType() == typeof(T))
                return Delete(pocoOrPrimaryKey);
            var pd = PocoData.ForType(typeof(T));
            return Delete(pd.TableInfo.TableName, pd.TableInfo.PrimaryKey, null, pocoOrPrimaryKey);
        }

        /// <summary>
        /// Performs an SQL Delete
        /// </summary>
        /// <typeparam name="T">The POCO class who's attributes specify the name of the table to delete from</typeparam>
        /// <param name="sql">The SQL condition clause identifying the row to delete (ie: everything after "DELETE FROM tablename"</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>The number of affected rows</returns>
        public int Delete<T>(string sql, params object[] args)
        {
            var pd = PocoData.ForType(typeof(T));
            return Execute(string.Format("DELETE FROM {0} {1}", _dbType.EscapeTableName(pd.TableInfo.TableName), sql), args);
        }

        /// <summary>
        /// Performs an SQL Delete
        /// </summary>
        /// <typeparam name="T">The POCO class who's attributes specify the name of the table to delete from</typeparam>
        /// <param name="sql">An SQL builder object representing the SQL condition clause identifying the row to delete (ie: everything after "UPDATE tablename"</param>
        /// <returns>The number of affected rows</returns>
        public int Delete<T>(Sql sql)
        {
            var pd = PocoData.ForType(typeof(T));
            return Execute(new Sql(string.Format("DELETE FROM {0}", _dbType.EscapeTableName(pd.TableInfo.TableName))).Append(sql));
        }
        #endregion

        #region operation: IsNew

        /// <summary>
        /// Check if a poco represents a new row
        /// </summary>
        /// <param name="primaryKeyName">The name of the primary key column</param>
        /// <param name="poco">The object instance whose "newness" is to be tested</param>
        /// <returns>True if the POCO represents a record already in the database</returns>
        /// <remarks>This method simply tests if the POCO's primary key column property has been set to something non-zero.</remarks>
        public bool IsNew(string primaryKeyName, object poco)
        {
            var pd = PocoData.ForObject(poco, primaryKeyName);
            object pk;
            PocoColumn pc;
            if (pd.Columns.TryGetValue(primaryKeyName, out pc))
            {
                pk = pc.GetValue(poco);
            }
#if !PETAPOCO_NO_DYNAMIC
            else if (poco.GetType() == typeof(System.Dynamic.ExpandoObject))
            {
                return true;
            }
#endif
            else
            {
                var pi = poco.GetType().GetProperty(primaryKeyName);
                if (pi == null)
                    throw new ArgumentException(string.Format("The object doesn't have a property matching the primary key column name '{0}'", primaryKeyName));
                pk = pi.GetValue(poco, null);
            }

            if (pk == null)
                return true;

            var type = pk.GetType();

            if (type.IsValueType)
            {
                // Common primary key types
                if (type == typeof(long))
                    return (long)pk == default(long);
                else if (type == typeof(ulong))
                    return (ulong)pk == default(ulong);
                else if (type == typeof(int))
                    return (int)pk == default(int);
                else if (type == typeof(uint))
                    return (uint)pk == default(uint);
                else if (type == typeof(Guid))
                    return (Guid)pk == default(Guid);

                // Create a default instance and compare
                return pk == Activator.CreateInstance(pk.GetType());
            }
            else
            {
                return pk == null;
            }
        }

        /// <summary>
        /// Check if a poco represents a new row
        /// </summary>
        /// <param name="poco">The object instance whose "newness" is to be tested</param>
        /// <returns>True if the POCO represents a record already in the database</returns>
        /// <remarks>This method simply tests if the POCO's primary key column property has been set to something non-zero.</remarks>
        public bool IsNew(object poco)
        {
            var pd = PocoData.ForType(poco.GetType());
            if (!pd.TableInfo.AutoIncrement)
                throw new InvalidOperationException("IsNew() and Save() are only supported on tables with auto-increment/identity primary key columns");
            return IsNew(pd.TableInfo.PrimaryKey, poco);
        }
        #endregion

        #region operation: Save
        /// <summary>
        /// Saves a POCO by either performing either an SQL Insert or SQL Update
        /// </summary>
        /// <param name="tableName">The name of the table to be updated</param>
        /// <param name="primaryKeyName">The name of the primary key column</param>
        /// <param name="poco">The POCO object to be saved</param>
        public void Save(string tableName, string primaryKeyName, object poco)
        {
            if (IsNew(primaryKeyName, poco))
            {
                Insert(tableName, primaryKeyName, true, poco);
            }
            else
            {
                Update(tableName, primaryKeyName, poco);
            }
        }

        /// <summary>
        /// Saves a POCO by either performing either an SQL Insert or SQL Update
        /// </summary>
        /// <param name="poco">The POCO object to be saved</param>
        public void Save(object poco)
        {
            var pd = PocoData.ForType(poco.GetType());
            Save(pd.TableInfo.TableName, pd.TableInfo.PrimaryKey, poco);
        }
        #endregion

        #region operation: Multi-Poco Query/Fetch
        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="TRet">The returned list POCO type</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<TRet> Fetch<T1, T2, TRet>(Func<T1, T2, TRet> cb, string sql, params object[] args) { return Query<T1, T2, TRet>(cb, sql, args).ToList(); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="TRet">The returned list POCO type</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<TRet> Fetch<T1, T2, T3, TRet>(Func<T1, T2, T3, TRet> cb, string sql, params object[] args) { return Query<T1, T2, T3, TRet>(cb, sql, args).ToList(); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="T4">The fourth POCO type</typeparam>
        /// <typeparam name="TRet">The returned list POCO type</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<TRet> Fetch<T1, T2, T3, T4, TRet>(Func<T1, T2, T3, T4, TRet> cb, string sql, params object[] args) { return Query<T1, T2, T3, T4, TRet>(cb, sql, args).ToList(); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="TRet">The type of objects in the returned IEnumerable</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<TRet> Query<T1, T2, TRet>(Func<T1, T2, TRet> cb, string sql, params object[] args) { return Query<TRet>(new Type[] { typeof(T1), typeof(T2) }, cb, sql, args); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="TRet">The type of objects in the returned IEnumerable</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<TRet> Query<T1, T2, T3, TRet>(Func<T1, T2, T3, TRet> cb, string sql, params object[] args) { return Query<TRet>(new Type[] { typeof(T1), typeof(T2), typeof(T3) }, cb, sql, args); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="T4">The fourth POCO type</typeparam>
        /// <typeparam name="TRet">The type of objects in the returned IEnumerable</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<TRet> Query<T1, T2, T3, T4, TRet>(Func<T1, T2, T3, T4, TRet> cb, string sql, params object[] args) { return Query<TRet>(new Type[] { typeof(T1), typeof(T2), typeof(T3), typeof(T4) }, cb, sql, args); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="TRet">The returned list POCO type</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<TRet> Fetch<T1, T2, TRet>(Func<T1, T2, TRet> cb, Sql sql) { return Query<T1, T2, TRet>(cb, sql.SQL, sql.Arguments).ToList(); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="TRet">The returned list POCO type</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<TRet> Fetch<T1, T2, T3, TRet>(Func<T1, T2, T3, TRet> cb, Sql sql) { return Query<T1, T2, T3, TRet>(cb, sql.SQL, sql.Arguments).ToList(); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="T4">The fourth POCO type</typeparam>
        /// <typeparam name="TRet">The returned list POCO type</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<TRet> Fetch<T1, T2, T3, T4, TRet>(Func<T1, T2, T3, T4, TRet> cb, Sql sql) { return Query<T1, T2, T3, T4, TRet>(cb, sql.SQL, sql.Arguments).ToList(); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="TRet">The type of objects in the returned IEnumerable</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<TRet> Query<T1, T2, TRet>(Func<T1, T2, TRet> cb, Sql sql) { return Query<TRet>(new Type[] { typeof(T1), typeof(T2) }, cb, sql.SQL, sql.Arguments); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="TRet">The type of objects in the returned IEnumerable</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<TRet> Query<T1, T2, T3, TRet>(Func<T1, T2, T3, TRet> cb, Sql sql) { return Query<TRet>(new Type[] { typeof(T1), typeof(T2), typeof(T3) }, cb, sql.SQL, sql.Arguments); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="T4">The fourth POCO type</typeparam>
        /// <typeparam name="TRet">The type of objects in the returned IEnumerable</typeparam>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<TRet> Query<T1, T2, T3, T4, TRet>(Func<T1, T2, T3, T4, TRet> cb, Sql sql) { return Query<TRet>(new Type[] { typeof(T1), typeof(T2), typeof(T3), typeof(T4) }, cb, sql.SQL, sql.Arguments); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<T1> Fetch<T1, T2>(string sql, params object[] args) { return Query<T1, T2>(sql, args).ToList(); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<T1> Fetch<T1, T2, T3>(string sql, params object[] args) { return Query<T1, T2, T3>(sql, args).ToList(); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="T4">The fourth POCO type</typeparam>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<T1> Fetch<T1, T2, T3, T4>(string sql, params object[] args) { return Query<T1, T2, T3, T4>(sql, args).ToList(); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<T1> Query<T1, T2>(string sql, params object[] args) { return Query<T1>(new Type[] { typeof(T1), typeof(T2) }, null, sql, args); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<T1> Query<T1, T2, T3>(string sql, params object[] args) { return Query<T1>(new Type[] { typeof(T1), typeof(T2), typeof(T3) }, null, sql, args); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="T4">The fourth POCO type</typeparam>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<T1> Query<T1, T2, T3, T4>(string sql, params object[] args) { return Query<T1>(new Type[] { typeof(T1), typeof(T2), typeof(T3), typeof(T4) }, null, sql, args); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<T1> Fetch<T1, T2>(Sql sql) { return Query<T1, T2>(sql.SQL, sql.Arguments).ToList(); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<T1> Fetch<T1, T2, T3>(Sql sql) { return Query<T1, T2, T3>(sql.SQL, sql.Arguments).ToList(); }

        /// <summary>
        /// Perform a multi-poco fetch
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="T4">The fourth POCO type</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as a List</returns>
        public List<T1> Fetch<T1, T2, T3, T4>(Sql sql) { return Query<T1, T2, T3, T4>(sql.SQL, sql.Arguments).ToList(); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<T1> Query<T1, T2>(Sql sql) { return Query<T1>(new Type[] { typeof(T1), typeof(T2) }, null, sql.SQL, sql.Arguments); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<T1> Query<T1, T2, T3>(Sql sql) { return Query<T1>(new Type[] { typeof(T1), typeof(T2), typeof(T3) }, null, sql.SQL, sql.Arguments); }

        /// <summary>
        /// Perform a multi-poco query
        /// </summary>
        /// <typeparam name="T1">The first POCO type</typeparam>
        /// <typeparam name="T2">The second POCO type</typeparam>
        /// <typeparam name="T3">The third POCO type</typeparam>
        /// <typeparam name="T4">The fourth POCO type</typeparam>
        /// <param name="sql">An SQL builder object representing the query and it's arguments</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<T1> Query<T1, T2, T3, T4>(Sql sql) { return Query<T1>(new Type[] { typeof(T1), typeof(T2), typeof(T3), typeof(T4) }, null, sql.SQL, sql.Arguments); }

        /// <summary>
        /// Performs a multi-poco query
        /// </summary>
        /// <typeparam name="TRet">The type of objects in the returned IEnumerable</typeparam>
        /// <param name="types">An array of Types representing the POCO types of the returned result set.</param>
        /// <param name="cb">A callback function to connect the POCO instances, or null to automatically guess the relationships</param>
        /// <param name="sql">The SQL query to be executed</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL</param>
        /// <returns>A collection of POCO's as an IEnumerable</returns>
        public IEnumerable<TRet> Query<TRet>(Type[] types, object cb, string sql, params object[] args)
        {
            OpenSharedConnection();
            try
            {
                using (var cmd = CreateCommand(_sharedConnection, sql, args))
                {
                    IDataReader r;
                    try
                    {
                        r = cmd.ExecuteReader();
                        OnExecutedCommand(cmd);
                    }
                    catch (Exception x)
                    {
                        if (OnException(x))
                            throw;
                        yield break;
                    }
                    var factory = MultiPocoFactory.GetFactory<TRet>(types, _sharedConnection.ConnectionString, sql, r);
                    if (cb == null)
                        cb = MultiPocoFactory.GetAutoMapper(types.ToArray());
                    bool bNeedTerminator = false;
                    using (r)
                    {
                        while (true)
                        {
                            TRet poco;
                            try
                            {
                                if (!r.Read())
                                    break;
                                poco = factory(r, cb);
                            }
                            catch (Exception x)
                            {
                                if (OnException(x))
                                    throw;
                                yield break;
                            }

                            if (poco != null)
                                yield return poco;
                            else
                                bNeedTerminator = true;
                        }
                        if (bNeedTerminator)
                        {
                            var poco = (TRet)(cb as Delegate).DynamicInvoke(new object[types.Length]);
                            if (poco != null)
                                yield return poco;
                            else
                                yield break;
                        }
                    }
                }
            }
            finally
            {
                CloseSharedConnection();
            }
        }

        #endregion

        #region Last Command

        /// <summary>
        /// Retrieves the SQL of the last executed statement
        /// </summary>
        public string LastSQL { get { return _lastSql; } }

        /// <summary>
        /// Retrieves the arguments to the last execute statement
        /// </summary>
        public object[] LastArgs { get { return _lastArgs; } }


        /// <summary>
        /// Returns a formatted string describing the last executed SQL statement and it's argument values
        /// </summary>
        public string LastCommand
        {
            get { return FormatCommand(_lastSql, _lastArgs); }
        }
        #endregion

        #region FormatCommand

        /// <summary>
        /// Formats the contents of a DB command for display
        /// </summary>
        /// <param name="cmd"></param>
        /// <returns></returns>
        public string FormatCommand(IDbCommand cmd)
        {
            return FormatCommand(cmd.CommandText, (from IDataParameter parameter in cmd.Parameters select parameter.Value).ToArray());
        }

        /// <summary>
        /// Formats an SQL query and it's arguments for display
        /// </summary>
        /// <param name="sql"></param>
        /// <param name="args"></param>
        /// <returns></returns>
        public string FormatCommand(string sql, object[] args)
        {
            var sb = new StringBuilder();
            if (sql == null)
                return "";
            sb.Append(sql);
            if (args != null && args.Length > 0)
            {
                sb.Append("\n");
                for (int i = 0; i < args.Length; i++)
                {
                    sb.AppendFormat("\t -> {0}{1} [{2}] = \"{3}\"\n", _paramPrefix, i, args[i].GetType().Name, args[i]);
                }
                sb.Remove(sb.Length - 1, 1);
            }
            return sb.ToString();
        }
        #endregion

        #region Public Properties

        /*
		public static IMapper Mapper
		{
			get;
			set;
		} */

        /// <summary>
        /// When set to true, PetaPoco will automatically create the "SELECT columns" part of any query that looks like it needs it
        /// </summary>
        public bool EnableAutoSelect
        {
            get;
            set;
        }

        /// <summary>
        /// When set to true, parameters can be named ?myparam and populated from properties of the passed in argument values.
        /// </summary>
        public bool EnableNamedParams
        {
            get;
            set;
        }

        /// <summary>
        /// Sets the timeout value for all SQL statements.
        /// </summary>
        public int CommandTimeout
        {
            get;
            set;
        }

        /// <summary>
        /// Sets the timeout value for the next (and only next) SQL statement
        /// </summary>
        public int OneTimeCommandTimeout
        {
            get;
            set;
        }
        #endregion

        #region Member Fields
        // Member variables
        internal DatabaseType _dbType;
        string _connectionString;
        string _providerName;
        DbProviderFactory _factory;
        IDbConnection _sharedConnection;
        IDbTransaction _transaction;
        int _sharedConnectionDepth;
        int _transactionDepth;
        bool _transactionCancelled;
        string _lastSql;
        object[] _lastArgs;
        string _paramPrefix;
        #endregion

        #region Internal operations
        internal void ExecuteNonQueryHelper(IDbCommand cmd)
        {
            DoPreExecute(cmd);
            cmd.ExecuteNonQuery();
            OnExecutedCommand(cmd);
        }

        internal object ExecuteScalarHelper(IDbCommand cmd)
        {
            DoPreExecute(cmd);
            object r = cmd.ExecuteScalar();
            OnExecutedCommand(cmd);
            return r;
        }

        internal void DoPreExecute(IDbCommand cmd)
        {
            // Setup command timeout
            if (OneTimeCommandTimeout != 0)
            {
                cmd.CommandTimeout = OneTimeCommandTimeout;
                OneTimeCommandTimeout = 0;
            }
            else if (CommandTimeout != 0)
            {
                cmd.CommandTimeout = CommandTimeout;
            }

            // Call hook
            OnExecutingCommand(cmd);

            // Save it
            _lastSql = cmd.CommandText;
            _lastArgs = (from IDataParameter parameter in cmd.Parameters select parameter.Value).ToArray();
        }

        #endregion
    }


    /* 
	Thanks to Adam Schroder (@schotime) for this.

	This extra file provides an implementation of DbProviderFactory for early versions of the Oracle
	drivers that don't include include it.  For later versions of Oracle, the standard OracleProviderFactory
	class should work fine

	Uses reflection to load Oracle.DataAccess assembly and in-turn create connections and commands

	Currently untested.

	Usage:   

			new PetaPoco.DbContext("<connstring>", new PetaPoco.OracleProvider())

	Or in your app/web config (be sure to change ASSEMBLYNAME to the name of your 
	assembly containing OracleProvider.cs)

		<connectionStrings>
			<add
				name="oracle"
				connectionString="WHATEVER"
				providerName="Oracle"
				/>
		</connectionStrings>

		<system.data>
			<DbProviderFactories>
				<add name="PetaPoco Oracle Provider" invariant="Oracle" description="PetaPoco Oracle Provider" 
								type="PetaPoco.OracleProvider, ASSEMBLYNAME" />
			</DbProviderFactories>
		</system.data>

	*/

    public class OracleProvider : DbProviderFactory
    {
        private const string _assemblyName = "Oracle.DataAccess";
        private const string _connectionTypeName = "Oracle.DataAccess.Client.OracleConnection";
        private const string _commandTypeName = "Oracle.DataAccess.Client.OracleCommand";
        private static Type _connectionType;
        private static Type _commandType;

        // Required for DbProviderFactories.GetFactory() to work.
        public static OracleProvider Instance = new OracleProvider();

        public OracleProvider()
        {
            _connectionType = TypeFromAssembly(_connectionTypeName, _assemblyName);
            _commandType = TypeFromAssembly(_commandTypeName, _assemblyName);
            if (_connectionType == null)
                throw new InvalidOperationException("Can't find Connection type: " + _connectionTypeName);
        }

        public override DbConnection CreateConnection()
        {
            return (DbConnection)Activator.CreateInstance(_connectionType);
        }

        public override DbCommand CreateCommand()
        {
            DbCommand command = (DbCommand)Activator.CreateInstance(_commandType);

            var oracleCommandBindByName = _commandType.GetProperty("BindByName");
            oracleCommandBindByName.SetValue(command, true, null);

            return command;
        }


        public static Type TypeFromAssembly(string typeName, string assemblyName)
        {
            try
            {
                // Try to get the type from an already loaded assembly
                Type type = Type.GetType(typeName);

                if (type != null)
                {
                    return type;
                }

                if (assemblyName == null)
                {
                    // No assembly was specified for the type, so just fail
                    string message = "Could not load type " + typeName + ". Possible cause: no assembly name specified.";
                    throw new TypeLoadException(message);
                }

                Assembly assembly = Assembly.Load(assemblyName);

                if (assembly == null)
                {
                    throw new InvalidOperationException("Can't find assembly: " + assemblyName);
                }

                type = assembly.GetType(typeName);

                if (type == null)
                {
                    return null;
                }

                return type;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }


    /// <summary>
    /// Wrap strings in an instance of this class to force use of DBType.AnsiString
    /// </summary>
    public class AnsiString
    {
        /// <summary>
        /// Constructs an AnsiString
        /// </summary>
        /// <param name="str">The C# string to be converted to ANSI before being passed to the DB</param>
        public AnsiString(string str)
        {
            Value = str;
        }

        /// <summary>
        /// The string value
        /// </summary>
        public string Value
        {
            get;
            private set;
        }
    }


    /// <summary>
    /// Hold information about a column in the database.
    /// </summary>
    /// <remarks>
    /// Typically ColumnInfo is automatically populated from the attributes on a POCO object and it's properties. It can
    /// however also be returned from the IMapper interface to provide your owning bindings between the DB and your POCOs.
    /// </remarks>
    public class ColumnInfo
    {
        /// <summary>
        /// The SQL name of the column
        /// </summary>
        public string ColumnName
        {
            get;
            set;
        }

        /// <summary>
        /// True if this column returns a calculated value from the database and shouldn't be used in Insert and Update operations.
        /// </summary>
        public bool ResultColumn
        {
            get;
            set;
        }

        /// <summary>
        /// True if time and date values returned through this column should be forced to UTC DateTimeKind. (no conversion is applied - the Kind of the DateTime property
        /// is simply set to DateTimeKind.Utc instead of DateTimeKind.Unknown.
        /// </summary>
        public bool ForceToUtc
        {
            get;
            set;
        }

        /// <summary>
        /// Creates and populates a ColumnInfo from the attributes of a POCO property.
        /// </summary>
        /// <param name="pi">The property whose column info is required</param>
        /// <returns>A ColumnInfo instance</returns>
        public static ColumnInfo FromProperty(PropertyInfo pi)
        {
            // Check if declaring poco has [Explicit] attribute
            bool ExplicitColumns = pi.DeclaringType.GetCustomAttributes(typeof(ExplicitColumnsAttribute), true).Length > 0;

            // Check for [Column]/[Ignore] Attributes
            var ColAttrs = pi.GetCustomAttributes(typeof(ColumnAttribute), true);
            if (ExplicitColumns)
            {
                if (ColAttrs.Length == 0)
                    return null;
            }
            else
            {
                if (pi.GetCustomAttributes(typeof(IgnoreAttribute), true).Length != 0)
                    return null;
            }

            ColumnInfo ci = new ColumnInfo();

            // Read attribute
            if (ColAttrs.Length > 0)
            {
                var colattr = (ColumnAttribute)ColAttrs[0];

                ci.ColumnName = colattr.Name == null ? pi.Name : colattr.Name;
                ci.ForceToUtc = colattr.ForceToUtc;
                if ((colattr as ResultColumnAttribute) != null)
                    ci.ResultColumn = true;

            }
            else
            {
                ci.ColumnName = pi.Name;
                ci.ForceToUtc = false;
                ci.ResultColumn = false;
            }

            return ci;



        }
    }

    /// <summary>
    /// IMapper provides a way to hook into PetaPoco's DbContext to POCO mapping mechanism to either
    /// customize or completely replace it.
    /// </summary>
    /// <remarks>
    /// To use this functionality, instantiate a class that implements IMapper and then pass it to
    /// PetaPoco through the static method Mappers.Register()
    /// </remarks>
    public interface IMapper
    {
        /// <summary>
        /// Get information about the table associated with a POCO class
        /// </summary>
        /// <param name="pocoType"></param>
        /// <returns>A TableInfo instance</returns>
        /// <remarks>
        /// This method must return a valid TableInfo.  
        /// To create a TableInfo from a POCO's attributes, use TableInfo.FromPoco
        /// </remarks>
        TableInfo GetTableInfo(Type pocoType);

        /// <summary>
        /// Get information about the column associated with a property of a POCO
        /// </summary>
        /// <param name="pocoProperty">The PropertyInfo of the property being queried</param>
        /// <returns>A reference to a ColumnInfo instance, or null to ignore this property</returns>
        /// <remarks>
        /// To create a ColumnInfo from a property's attributes, use PropertyInfo.FromProperty
        /// </remarks>
        ColumnInfo GetColumnInfo(PropertyInfo pocoProperty);

        /// <summary>
        /// Supply a function to convert a database value to the correct property value
        /// </summary>
        /// <param name="TargetProperty">The target property</param>
        /// <param name="SourceType">The type of data returned by the DB</param>
        /// <returns>A Func that can do the conversion, or null for no conversion</returns>
        Func<object, object> GetFromDbConverter(PropertyInfo TargetProperty, Type SourceType);

        /// <summary>
        /// Supply a function to convert a property value into a database value
        /// </summary>
        /// <param name="SourceProperty">The property to be converted</param>
        /// <returns>A Func that can do the conversion</returns>
        /// <remarks>
        /// This conversion is only used for converting values from POCO's that are 
        /// being Inserted or Updated.  
        /// Conversion is not available for parameter values passed directly to queries.
        /// </remarks>
        Func<object, object> GetToDbConverter(PropertyInfo SourceProperty);
    }


    /// <summary>
    /// This static manages registation of IMapper instances with PetaPoco
    /// </summary>
    public static class Mappers
    {
        /// <summary>
        /// Registers a mapper for all types in a specific assembly
        /// </summary>
        /// <param name="assembly">The assembly whose types are to be managed by this mapper</param>
        /// <param name="mapper">The IMapper implementation</param>
        public static void Register(Assembly assembly, IMapper mapper)
        {
            RegisterInternal(assembly, mapper);
        }

        /// <summary>
        /// Registers a mapper for a single POCO type
        /// </summary>
        /// <param name="type">The type to be managed by this mapper</param>
        /// <param name="mapper">The IMapper implementation</param>
        public static void Register(Type type, IMapper mapper)
        {
            RegisterInternal(type, mapper);
        }

        /// <summary>
        /// Remove all mappers for all types in a specific assembly
        /// </summary>
        /// <param name="assembly">The assembly whose mappers are to be revoked</param>
        public static void Revoke(Assembly assembly)
        {
            RevokeInternal(assembly);
        }

        /// <summary>
        /// Remove the mapper for a specific type
        /// </summary>
        /// <param name="type">The type whose mapper is to be removed</param>
        public static void Revoke(Type type)
        {
            RevokeInternal(type);
        }

        /// <summary>
        /// Revoke an instance of a mapper
        /// </summary>
        /// <param name="mapper">The IMapper to be revkoed</param>
        public static void Revoke(IMapper mapper)
        {
            _lock.EnterWriteLock();
            try
            {
                foreach (var i in _mappers.Where(kvp => kvp.Value == mapper).ToList())
                    _mappers.Remove(i.Key);
            }
            finally
            {
                _lock.ExitWriteLock();
                FlushCaches();
            }
        }

        /// <summary>
        /// Retrieve the IMapper implementation to be used for a specified POCO type
        /// </summary>
        /// <param name="t"></param>
        /// <returns></returns>
        public static IMapper GetMapper(Type t)
        {
            _lock.EnterReadLock();
            try
            {
                IMapper val;
                if (_mappers.TryGetValue(t, out val))
                    return val;
                if (_mappers.TryGetValue(t.Assembly, out val))
                    return val;

                return Singleton<StandardMapper>.Instance;
            }
            finally
            {
                _lock.ExitReadLock();
            }
        }


        static void RegisterInternal(object typeOrAssembly, IMapper mapper)
        {
            _lock.EnterWriteLock();
            try
            {
                _mappers.Add(typeOrAssembly, mapper);
            }
            finally
            {
                _lock.ExitWriteLock();
                FlushCaches();
            }
        }

        static void RevokeInternal(object typeOrAssembly)
        {
            _lock.EnterWriteLock();
            try
            {
                _mappers.Remove(typeOrAssembly);
            }
            finally
            {
                _lock.ExitWriteLock();
                FlushCaches();
            }
        }

        static void FlushCaches()
        {
            // Whenever a mapper is registered or revoked, we have to assume any generated code is no longer valid.
            // Since this should be a rare occurance, the simplest approach is to simply dump everything and start over.
            MultiPocoFactory.FlushCaches();
            PocoData.FlushCaches();
        }

        static Dictionary<object, IMapper> _mappers = new Dictionary<object, IMapper>();
        static ReaderWriterLockSlim _lock = new ReaderWriterLockSlim();
    }

    /// <summary>
    /// A simple helper class for build SQL statements
    /// </summary>
    public class Sql
    {
        /// <summary>
        /// Default, empty constructor
        /// </summary>
        public Sql()
        {
        }

        /// <summary>
        /// Construct an SQL statement with the supplied SQL and arguments
        /// </summary>
        /// <param name="sql">The SQL statement or fragment</param>
        /// <param name="args">Arguments to any parameters embedded in the SQL</param>
        public Sql(string sql, params object[] args)
        {
            _sql = sql;
            _args = args;
        }

        /// <summary>
        /// Instantiate a new SQL Builder object.  Weirdly implemented as a property but makes
        /// for more elegantly readble fluent style construction of SQL Statements
        /// eg: db.Query(Sql.Builder.Append(....))
        /// </summary>
        public static Sql Builder
        {
            get { return new Sql(); }
        }

        string _sql;
        object[] _args;
        Sql _rhs;
        string _sqlFinal;
        object[] _argsFinal;

        private void Build()
        {
            // already built?
            if (_sqlFinal != null)
                return;

            // Build it
            var sb = new StringBuilder();
            var args = new List<object>();
            Build(sb, args, null);
            _sqlFinal = sb.ToString();
            _argsFinal = args.ToArray();
        }

        /// <summary>
        /// Returns the final SQL statement represented by this builder
        /// </summary>
        public string SQL
        {
            get
            {
                Build();
                return _sqlFinal;
            }
        }

        /// <summary>
        /// Gets the complete, final set of arguments collected by this builder.
        /// </summary>
        public object[] Arguments
        {
            get
            {
                Build();
                return _argsFinal;
            }
        }

        /// <summary>
        /// Append another SQL builder instance to the right-hand-side of this SQL builder
        /// </summary>
        /// <param name="sql">A reference to another SQL builder instance</param>
        /// <returns>A reference to this builder, allowing for fluent style concatenation</returns>
        public Sql Append(Sql sql)
        {
            if (_rhs != null)
                _rhs.Append(sql);
            else
                _rhs = sql;

            return this;
        }

        /// <summary>
        /// Append an SQL fragement to the right-hand-side of this SQL builder
        /// </summary>
        /// <param name="sql">The SQL statement or fragment</param>
        /// <param name="args">Arguments to any parameters embedded in the SQL</param>
        /// <returns>A reference to this builder, allowing for fluent style concatenation</returns>
        public Sql Append(string sql, params object[] args)
        {
            return Append(new Sql(sql, args));
        }

        static bool Is(Sql sql, string sqltype)
        {
            return sql != null && sql._sql != null && sql._sql.StartsWith(sqltype, StringComparison.InvariantCultureIgnoreCase);
        }

        private void Build(StringBuilder sb, List<object> args, Sql lhs)
        {
            if (!String.IsNullOrEmpty(_sql))
            {
                // Add SQL to the string
                if (sb.Length > 0)
                {
                    sb.Append("\n");
                }

                var sql = ParametersHelper.ProcessParams(_sql, _args, args);

                if (Is(lhs, "WHERE ") && Is(this, "WHERE "))
                    sql = "AND " + sql.Substring(6);
                if (Is(lhs, "ORDER BY ") && Is(this, "ORDER BY "))
                    sql = ", " + sql.Substring(9);

                sb.Append(sql);
            }

            // Now do rhs
            if (_rhs != null)
                _rhs.Build(sb, args, this);
        }

        /// <summary>
        /// Appends an SQL WHERE clause to this SQL builder
        /// </summary>
        /// <param name="sql">The condition of the WHERE clause</param>
        /// <param name="args">Arguments to any parameters embedded in the supplied SQL</param>
        /// <returns>A reference to this builder, allowing for fluent style concatenation</returns>
        public Sql Where(string sql, params object[] args)
        {
            return Append(new Sql("WHERE (" + sql + ")", args));
        }

        /// <summary>
        /// Appends an SQL ORDER BY clause to this SQL builder
        /// </summary>
        /// <param name="columns">A collection of SQL column names to order by</param>
        /// <returns>A reference to this builder, allowing for fluent style concatenation</returns>
        public Sql OrderBy(params object[] columns)
        {
            return Append(new Sql("ORDER BY " + String.Join(", ", (from x in columns select x.ToString()).ToArray())));
        }

        /// <summary>
        /// Appends an SQL SELECT clause to this SQL builder
        /// </summary>
        /// <param name="columns">A collection of SQL column names to select<param>
        /// <returns>A reference to this builder, allowing for fluent style concatenation</returns>
        public Sql Select(params object[] columns)
        {
            return Append(new Sql("SELECT " + String.Join(", ", (from x in columns select x.ToString()).ToArray())));
        }

        /// <summary>
        /// Appends an SQL FROM clause to this SQL builder
        /// </summary>
        /// <param name="tables">A collection of table names to be used in the FROM clause</param>
        /// <returns>A reference to this builder, allowing for fluent style concatenation</returns>
        public Sql From(params object[] tables)
        {
            return Append(new Sql("FROM " + String.Join(", ", (from x in tables select x.ToString()).ToArray())));
        }

        /// <summary>
        /// Appends an SQL GROUP BY clause to this SQL builder
        /// </summary>
        /// <param name="columns">A collection of column names to be grouped by</param>
        /// <returns>A reference to this builder, allowing for fluent style concatenation</returns>
        public Sql GroupBy(params object[] columns)
        {
            return Append(new Sql("GROUP BY " + String.Join(", ", (from x in columns select x.ToString()).ToArray())));
        }

        private SqlJoinClause Join(string JoinType, string table)
        {
            return new SqlJoinClause(Append(new Sql(JoinType + table)));
        }

        /// <summary>
        /// Appends an SQL INNER JOIN clause to this SQL builder
        /// </summary>
        /// <param name="table">The name of the table to join</param>
        /// <returns>A reference an SqlJoinClause through which the join condition can be specified</returns>
        public SqlJoinClause InnerJoin(string table) { return Join("INNER JOIN ", table); }

        /// <summary>
        /// Appends an SQL LEFT JOIN clause to this SQL builder
        /// </summary>
        /// <param name="table">The name of the table to join</param>
        /// <returns>A reference an SqlJoinClause through which the join condition can be specified</returns>
        public SqlJoinClause LeftJoin(string table) { return Join("LEFT JOIN ", table); }

        /// <summary>
        /// The SqlJoinClause is a simple helper class used in the construction of SQL JOIN statements with the SQL builder
        /// </summary>
        public class SqlJoinClause
        {
            private readonly Sql _sql;

            public SqlJoinClause(Sql sql)
            {
                _sql = sql;
            }

            /// <summary>
            /// Appends a SQL ON clause after a JOIN statement
            /// </summary>
            /// <param name="onClause">The ON clause to be appended</param>
            /// <param name="args">Arguments to any parameters embedded in the supplied SQL</param>
            /// <returns>A reference to the parent SQL builder, allowing for fluent style concatenation</returns>
            public Sql On(string onClause, params object[] args)
            {
                return _sql.Append("ON " + onClause, args);
            }
        }
    }


    /// <summary>
    /// StandardMapper is the default implementation of IMapper used by PetaPoco
    /// </summary>
    public class StandardMapper : IMapper
    {
        /// <summary>
        /// Constructs a TableInfo for a POCO by reading its attribute data
        /// </summary>
        /// <param name="pocoType">The POCO Type</param>
        /// <returns></returns>
        public TableInfo GetTableInfo(Type pocoType)
        {
            return TableInfo.FromPoco(pocoType);
        }

        /// <summary>
        /// Constructs a ColumnInfo for a POCO property by reading its attribute data
        /// </summary>
        /// <param name="pocoProperty"></param>
        /// <returns></returns>
        public ColumnInfo GetColumnInfo(PropertyInfo pocoProperty)
        {
            return ColumnInfo.FromProperty(pocoProperty);
        }

        public Func<object, object> GetFromDbConverter(PropertyInfo TargetProperty, Type SourceType)
        {
            return null;
        }

        public Func<object, object> GetToDbConverter(PropertyInfo SourceProperty)
        {
            return null;
        }
    }

    /// <summary>
    /// Use by IMapper to override table bindings for an object
    /// </summary>
    public class TableInfo
    {
        /// <summary>
        /// The database table name
        /// </summary>
        public string TableName
        {
            get;
            set;
        }

        /// <summary>
        /// The name of the primary key column of the table
        /// </summary>
        public string PrimaryKey
        {
            get;
            set;
        }

        /// <summary>
        /// True if the primary key column is an auto-incrementing
        /// </summary>
        public bool AutoIncrement
        {
            get;
            set;
        }

        /// <summary>
        /// The name of the sequence used for auto-incrementing Oracle primary key fields
        /// </summary>
        public string SequenceName
        {
            get;
            set;
        }


        /// <summary>
        /// Creates and populates a TableInfo from the attributes of a POCO
        /// </summary>
        /// <param name="t">The POCO type</param>
        /// <returns>A TableInfo instance</returns>
        public static TableInfo FromPoco(Type t)
        {
            TableInfo ti = new TableInfo();

            // Get the table name
            var a = t.GetCustomAttributes(typeof(TableNameAttribute), true);
            ti.TableName = a.Length == 0 ? t.Name : (a[0] as TableNameAttribute).Value;

            // Get the primary key
            a = t.GetCustomAttributes(typeof(PrimaryKeyAttribute), true);
            ti.PrimaryKey = a.Length == 0 ? "ID" : (a[0] as PrimaryKeyAttribute).Value;
            ti.SequenceName = a.Length == 0 ? null : (a[0] as PrimaryKeyAttribute).sequenceName;
            ti.AutoIncrement = a.Length == 0 ? false : (a[0] as PrimaryKeyAttribute).autoIncrement;

            return ti;
        }
    }


    //public interface ITransaction : IDisposable
    //{
    //    void Complete();
    //}

    /// <summary>
    /// Transaction object helps maintain transaction depth counts
    /// </summary>
    public class Transaction : ITransaction
    {
        public Transaction(DbContext db)
        {
            _db = db;
            _db.BeginTransaction();
        }

        public void Complete()
        {
            _db.CompleteTransaction();
            _db = null;
        }

        public void Dispose()
        {
            if (_db != null)
                _db.AbortTransaction();
        }

        DbContext _db;
    }
}
