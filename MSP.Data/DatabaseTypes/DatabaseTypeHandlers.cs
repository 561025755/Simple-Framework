using SD.Data.Context;
using System;
using System.Data;
using System.Linq;

namespace SD.Data.DatabaseTypes
{
    class DatabaseTypeHandlers
    {
    }

    class FirebirdDatabaseType : DatabaseType
    {
        public override string GetParameterPrefix(string ConnectionString)
        {
            return "@";
        }

        public override string EscapeSqlIdentifier(string str)
        {
            return string.Format("\"{0}\"", str);
        }

        public override string GetExistsSql()
        {
            return "SELECT EXISTS (SELECT 1 FROM {0} WHERE {1})";
        }
    }

    class MySqlDatabaseType : DatabaseType
    {
        public override string GetParameterPrefix(string ConnectionString)
        {
            if (ConnectionString != null && ConnectionString.IndexOf("Allow User Variables=true") >= 0)
                return "?";
            else
                return "@";
        }

        public override string EscapeSqlIdentifier(string str)
        {
            return string.Format("`{0}`", str);
        }

        public override string GetExistsSql()
        {
            return "SELECT EXISTS (SELECT 1 FROM {0} WHERE {1})";
        }
    }

    class OracleDatabaseType : DatabaseType
    {
        public override string GetParameterPrefix(string ConnectionString)
        {
            return ":";
        }

        public override void PreExecute(IDbCommand cmd)
        {
            cmd.GetType().GetProperty("BindByName").SetValue(cmd, true, null);
        }

        public override string BuildPageQuery(long skip, long take, PagingHelper.SQLParts parts, ref object[] args)
        {
            if (parts.sqlSelectRemoved.StartsWith("*"))
                throw new Exception("Query must alias '*' when performing a paged query.\neg. select t.* from table t order by t.id");

            // Same deal as SQL Server
            return Singleton<SqlServerDatabaseType>.Instance.BuildPageQuery(skip, take, parts, ref args);
        }

        public override string EscapeSqlIdentifier(string str)
        {
            return string.Format("\"{0}\"", str.ToUpperInvariant());
        }

        public override string GetAutoIncrementExpression(TableInfo ti)
        {
            if (!string.IsNullOrEmpty(ti.SequenceName))
                return string.Format("{0}.nextval", ti.SequenceName);

            return null;
        }

        public override object ExecuteInsert(DbContext db, IDbCommand cmd, string PrimaryKeyName)
        {
            if (PrimaryKeyName != null)
            {
                cmd.CommandText += string.Format(" returning {0} into :newid", EscapeSqlIdentifier(PrimaryKeyName));
                var param = cmd.CreateParameter();
                param.ParameterName = ":newid";
                param.Value = DBNull.Value;
                param.Direction = ParameterDirection.ReturnValue;
                param.DbType = DbType.Int64;
                cmd.Parameters.Add(param);
                db.ExecuteNonQueryHelper(cmd);
                return param.Value;
            }
            else
            {
                db.ExecuteNonQueryHelper(cmd);
                return -1;
            }
        }

    }

    class PostgreSQLDatabaseType : DatabaseType
    {
        public override object MapParameterValue(object value)
        {
            // Don't map bools to ints in PostgreSQL
            if (value.GetType() == typeof(bool))
                return value;

            return base.MapParameterValue(value);
        }

        public override string EscapeSqlIdentifier(string str)
        {
            return string.Format("\"{0}\"", str);
        }

        public override object ExecuteInsert(DbContext db, System.Data.IDbCommand cmd, string PrimaryKeyName)
        {
            if (PrimaryKeyName != null)
            {
                cmd.CommandText += string.Format("returning {0} as NewID", EscapeSqlIdentifier(PrimaryKeyName));
                return db.ExecuteScalarHelper(cmd);
            }
            else
            {
                db.ExecuteNonQueryHelper(cmd);
                return -1;
            }
        }
    }

    class SQLiteDatabaseType : DatabaseType
    {
        public override object MapParameterValue(object value)
        {
            if (value.GetType() == typeof(uint))
                return (long)((uint)value);

            return base.MapParameterValue(value);
        }

        public override object ExecuteInsert(DbContext db, System.Data.IDbCommand cmd, string PrimaryKeyName)
        {
            if (PrimaryKeyName != null)
            {
                cmd.CommandText += ";\nSELECT last_insert_rowid();";
                return db.ExecuteScalarHelper(cmd);
            }
            else
            {
                db.ExecuteNonQueryHelper(cmd);
                return -1;
            }
        }

        public override string GetExistsSql()
        {
            return "SELECT EXISTS (SELECT 1 FROM {0} WHERE {1})";
        }

    }

    class SqlServerCEDatabaseType : DatabaseType
    {
        public override string BuildPageQuery(long skip, long take, PagingHelper.SQLParts parts, ref object[] args)
        {
            var sqlPage = string.Format("{0}\nOFFSET @{1} ROWS FETCH NEXT @{2} ROWS ONLY", parts.sql, args.Length, args.Length + 1);
            args = args.Concat(new object[] { skip, take }).ToArray();
            return sqlPage;
        }

        public override object ExecuteInsert(DbContext db, System.Data.IDbCommand cmd, string PrimaryKeyName)
        {
            db.ExecuteNonQueryHelper(cmd);
            return db.ExecuteScalar<object>("SELECT @@@IDENTITY AS NewID;");
        }

    }

    class SqlServerDatabaseType : DatabaseType
    {
        public override string BuildPageQuery(long skip, long take, PagingHelper.SQLParts parts, ref object[] args)
        {
            parts.sqlSelectRemoved = PagingHelper.rxOrderBy.Replace(parts.sqlSelectRemoved, "", 1);
            if (PagingHelper.rxDistinct.IsMatch(parts.sqlSelectRemoved))
            {
                parts.sqlSelectRemoved = "peta_inner.* FROM (SELECT " + parts.sqlSelectRemoved + ") peta_inner";
            }
            var sqlPage = string.Format("SELECT * FROM (SELECT ROW_NUMBER() OVER ({0}) peta_rn, {1}) peta_paged WHERE peta_rn>@{2} AND peta_rn<=@{3}",
                                    parts.sqlOrderBy == null ? "ORDER BY (SELECT NULL)" : parts.sqlOrderBy, parts.sqlSelectRemoved, args.Length, args.Length + 1);
            args = args.Concat(new object[] { skip, skip + take }).ToArray();

            return sqlPage;
        }

        public override object ExecuteInsert(DbContext db, System.Data.IDbCommand cmd, string PrimaryKeyName)
        {
            return db.ExecuteScalarHelper(cmd);
        }

        public override string GetExistsSql()
        {
            return "IF EXISTS (SELECT 1 FROM {0} WHERE {1}) SELECT 1 ELSE SELECT 0";
        }

        public override string GetInsertOutputClause(string primaryKeyName)
        {
            return String.Format(" OUTPUT INSERTED.[{0}]", primaryKeyName);
        }
    }
}
