using SD.Data.Context;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Reflection.Emit;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

namespace SD.Data.DatabaseTypes
{
    /// <summary>
    /// Base class for DatabaseType handlers - provides default/common handling for different database engines
    /// </summary> 
    abstract class DatabaseType
    {
        /// <summary>
        /// Returns the prefix used to delimit parameters in SQL query strings.
        /// </summary>
        /// <param name="ConnectionString"></param>
        /// <returns></returns>
        public virtual string GetParameterPrefix(string ConnectionString)
        {
            return "@";
        }

        /// <summary>
        /// Converts a supplied C# object value into a value suitable for passing to the database
        /// </summary>
        /// <param name="value">The value to convert</param>
        /// <returns>The converted value</returns>
        public virtual object MapParameterValue(object value)
        {
            // Cast bools to integer
            if (value.GetType() == typeof(bool))
            {
                return ((bool)value) ? 1 : 0;
            }

            // Leave it
            return value;
        }

        /// <summary>
        /// Called immediately before a command is executed, allowing for modification of the IDbCommand before it's passed to the database provider
        /// </summary>
        /// <param name="cmd"></param>
        public virtual void PreExecute(IDbCommand cmd)
        {
        }

        /// <summary>
        /// Builds an SQL query suitable for performing page based queries to the database
        /// </summary>
        /// <param name="skip">The number of rows that should be skipped by the query</param>
        /// <param name="take">The number of rows that should be retruend by the query</param>
        /// <param name="parts">The original SQL query after being parsed into it's component parts</param>
        /// <param name="args">Arguments to any embedded parameters in the SQL query</param>
        /// <returns>The final SQL query that should be executed.</returns>
        public virtual string BuildPageQuery(long skip, long take, PagingHelper.SQLParts parts, ref object[] args)
        {
            var sql = string.Format("{0}\nLIMIT @{1} OFFSET @{2}", parts.sql, args.Length, args.Length + 1);
            args = args.Concat(new object[] { take, skip }).ToArray();
            return sql;
        }

        /// <summary>
        /// Returns an SQL Statement that can check for the existance of a row in the database.
        /// </summary>
        /// <returns></returns>
        public virtual string GetExistsSql()
        {
            return "SELECT COUNT(*) FROM {0} WHERE {1}";
        }

        /// <summary>
        /// Escape a tablename into a suitable format for the associated database provider.
        /// </summary>
        /// <param name="tableName">The name of the table (as specified by the client program, or as attributes on the associated POCO class.</param>
        /// <returns>The escaped table name</returns>
        public virtual string EscapeTableName(string tableName)
        {
            // Assume table names with "dot" are already escaped
            return tableName.IndexOf('.') >= 0 ? tableName : EscapeSqlIdentifier(tableName);
        }

        /// <summary>
        /// Escape and arbitary SQL identifier into a format suitable for the associated database provider
        /// </summary>
        /// <param name="str">The SQL identifier to be escaped</param>
        /// <returns>The escaped identifier</returns>
        public virtual string EscapeSqlIdentifier(string str)
        {
            return string.Format("[{0}]", str);
        }

        /// <summary>
        /// Return an SQL expression that can be used to populate the primary key column of an auto-increment column.
        /// </summary>
        /// <param name="ti">Table info describing the table</param>
        /// <returns>An SQL expressions</returns>
        /// <remarks>See the Oracle database type for an example of how this method is used.</remarks>
        public virtual string GetAutoIncrementExpression(TableInfo ti)
        {
            return null;
        }

        /// <summary>
        /// Returns an SQL expression that can be used to specify the return value of auto incremented columns.
        /// </summary>
        /// <param name="primaryKeyName">The primary key of the row being inserted.</param>
        /// <returns>An expression describing how to return the new primary key value</returns>
        /// <remarks>See the SQLServer database provider for an example of how this method is used.</remarks>
        public virtual string GetInsertOutputClause(string primaryKeyName)
        {
            return string.Empty;
        }

        /// <summary>
        /// Performs an Insert operation
        /// </summary>
        /// <param name="db">The calling DbContext object</param>
        /// <param name="cmd">The insert command to be executed</param>
        /// <param name="PrimaryKeyName">The primary key of the table being inserted into</param>
        /// <returns>The ID of the newly inserted record</returns>
        public virtual object ExecuteInsert(DbContext db, IDbCommand cmd, string PrimaryKeyName)
        {
            cmd.CommandText += ";\nSELECT @@IDENTITY AS NewID;";
            return db.ExecuteScalarHelper(cmd);
        }


        /// <summary>
        /// Look at the type and provider name being used and instantiate a suitable DatabaseType instance.
        /// </summary>
        /// <param name="TypeName"></param>
        /// <param name="ProviderName"></param>
        /// <returns></returns>
        public static DatabaseType Resolve(string TypeName, string ProviderName)
        {
            // Try using type name first (more reliable)
            if (TypeName.StartsWith("MySql"))
                return Singleton<MySqlDatabaseType>.Instance;
            if (TypeName.StartsWith("SqlCe"))
                return Singleton<SqlServerCEDatabaseType>.Instance;
            if (TypeName.StartsWith("Npgsql") || TypeName.StartsWith("PgSql"))
                return Singleton<PostgreSQLDatabaseType>.Instance;
            if (TypeName.StartsWith("Oracle"))
                return Singleton<OracleDatabaseType>.Instance;
            if (TypeName.StartsWith("SQLite"))
                return Singleton<SQLiteDatabaseType>.Instance;
            if (TypeName.StartsWith("System.Data.SqlClient."))
                return Singleton<SqlServerDatabaseType>.Instance;
            if (TypeName.StartsWith("Firebird"))
                return Singleton<FirebirdDatabaseType>.Instance;

            // Try again with provider name
            if (ProviderName.IndexOf("MySql", StringComparison.InvariantCultureIgnoreCase) >= 0)
                return Singleton<MySqlDatabaseType>.Instance;
            if (ProviderName.IndexOf("SqlServerCe", StringComparison.InvariantCultureIgnoreCase) >= 0)
                return Singleton<SqlServerCEDatabaseType>.Instance;
            if (ProviderName.IndexOf("pgsql", StringComparison.InvariantCultureIgnoreCase) >= 0)
                return Singleton<PostgreSQLDatabaseType>.Instance;
            if (ProviderName.IndexOf("Oracle", StringComparison.InvariantCultureIgnoreCase) >= 0)
                return Singleton<OracleDatabaseType>.Instance;
            if (ProviderName.IndexOf("SQLite", StringComparison.InvariantCultureIgnoreCase) >= 0)
                return Singleton<SQLiteDatabaseType>.Instance;
            if (ProviderName.IndexOf("Firebird", StringComparison.InvariantCultureIgnoreCase) >= 0)
                return Singleton<FirebirdDatabaseType>.Instance;

            // Assume SQL Server
            return Singleton<SqlServerDatabaseType>.Instance;
        }

    }

    internal class ExpandoColumn : PocoColumn
    {
        public override void SetValue(object target, object val) { (target as IDictionary<string, object>)[ColumnName] = val; }
        public override object GetValue(object target)
        {
            object val = null;
            (target as IDictionary<string, object>).TryGetValue(ColumnName, out val);
            return val;
        }
        public override object ChangeType(object val) { return val; }
    }

    class MultiPocoFactory
    {
        // Instance data used by the Multipoco factory delegate - essentially a list of the nested poco factories to call
        List<Delegate> _delegates;
        public Delegate GetItem(int index) { return _delegates[index]; }

        // Automagically guess the property relationships between various POCOs and create a delegate that will set them up
        public static object GetAutoMapper(Type[] types)
        {
            // Build a key
            var key = new ArrayKey<Type>(types);

            return AutoMappers.Get(key, () =>
            {
                // Create a method
                var m = new DynamicMethod("petapoco_automapper", types[0], types, true);
                var il = m.GetILGenerator();

                for (int i = 1; i < types.Length; i++)
                {
                    bool handled = false;
                    for (int j = i - 1; j >= 0; j--)
                    {
                        // Find the property
                        var candidates = from p in types[j].GetProperties() where p.PropertyType == types[i] select p;
                        if (candidates.Count() == 0)
                            continue;
                        if (candidates.Count() > 1)
                            throw new InvalidOperationException(string.Format("Can't auto join {0} as {1} has more than one property of type {0}", types[i], types[j]));

                        // Generate code
                        il.Emit(OpCodes.Ldarg_S, j);
                        il.Emit(OpCodes.Ldarg_S, i);
                        il.Emit(OpCodes.Callvirt, candidates.First().GetSetMethod(true));
                        handled = true;
                    }

                    if (!handled)
                        throw new InvalidOperationException(string.Format("Can't auto join {0}", types[i]));
                }

                il.Emit(OpCodes.Ldarg_0);
                il.Emit(OpCodes.Ret);

                // Cache it
                return m.CreateDelegate(Expression.GetFuncType(types.Concat(types.Take(1)).ToArray()));
            }
            );
        }

        // Find the split point in a result set for two different pocos and return the poco factory for the first
        static Delegate FindSplitPoint(Type typeThis, Type typeNext, string ConnectionString, string sql, IDataReader r, ref int pos)
        {
            // Last?
            if (typeNext == null)
                return PocoData.ForType(typeThis).GetFactory(sql, ConnectionString, pos, r.FieldCount - pos, r);

            // Get PocoData for the two types
            PocoData pdThis = PocoData.ForType(typeThis);
            PocoData pdNext = PocoData.ForType(typeNext);

            // Find split point
            int firstColumn = pos;
            var usedColumns = new Dictionary<string, bool>();
            for (; pos < r.FieldCount; pos++)
            {
                // Split if field name has already been used, or if the field doesn't exist in current poco but does in the next
                string fieldName = r.GetName(pos);
                if (usedColumns.ContainsKey(fieldName) || (!pdThis.Columns.ContainsKey(fieldName) && pdNext.Columns.ContainsKey(fieldName)))
                {
                    return pdThis.GetFactory(sql, ConnectionString, firstColumn, pos - firstColumn, r);
                }
                usedColumns.Add(fieldName, true);
            }

            throw new InvalidOperationException(string.Format("Couldn't find split point between {0} and {1}", typeThis, typeNext));
        }

        // Create a multi-poco factory
        static Func<IDataReader, object, TRet> CreateMultiPocoFactory<TRet>(Type[] types, string ConnectionString, string sql, IDataReader r)
        {
            var m = new DynamicMethod("petapoco_multipoco_factory", typeof(TRet), new Type[] { typeof(MultiPocoFactory), typeof(IDataReader), typeof(object) }, typeof(MultiPocoFactory));
            var il = m.GetILGenerator();

            // Load the callback
            il.Emit(OpCodes.Ldarg_2);

            // Call each delegate
            var dels = new List<Delegate>();
            int pos = 0;
            for (int i = 0; i < types.Length; i++)
            {
                // Add to list of delegates to call
                var del = FindSplitPoint(types[i], i + 1 < types.Length ? types[i + 1] : null, ConnectionString, sql, r, ref pos);
                dels.Add(del);

                // Get the delegate
                il.Emit(OpCodes.Ldarg_0);                                                   // callback,this
                il.Emit(OpCodes.Ldc_I4, i);                                                 // callback,this,Index
                il.Emit(OpCodes.Callvirt, typeof(MultiPocoFactory).GetMethod("GetItem"));   // callback,Delegate
                il.Emit(OpCodes.Ldarg_1);                                                   // callback,delegate, datareader

                // Call Invoke
                var tDelInvoke = del.GetType().GetMethod("Invoke");
                il.Emit(OpCodes.Callvirt, tDelInvoke);                                      // Poco left on stack
            }

            // By now we should have the callback and the N pocos all on the stack.  Call the callback and we're done
            il.Emit(OpCodes.Callvirt, Expression.GetFuncType(types.Concat(new Type[] { typeof(TRet) }).ToArray()).GetMethod("Invoke"));
            il.Emit(OpCodes.Ret);

            // Finish up
            return (Func<IDataReader, object, TRet>)m.CreateDelegate(typeof(Func<IDataReader, object, TRet>), new MultiPocoFactory() { _delegates = dels });
        }

        // Various cached stuff
        static Cache<Tuple<Type, ArrayKey<Type>, string, string>, object> MultiPocoFactories = new Cache<Tuple<Type, ArrayKey<Type>, string, string>, object>();
        static Cache<ArrayKey<Type>, object> AutoMappers = new Cache<ArrayKey<Type>, object>();

        internal static void FlushCaches()
        {
            MultiPocoFactories.Flush();
            AutoMappers.Flush();
        }

        // Get (or create) the multi-poco factory for a query
        public static Func<IDataReader, object, TRet> GetFactory<TRet>(Type[] types, string ConnectionString, string sql, IDataReader r)
        {
            var key = Tuple.Create<Type, ArrayKey<Type>, string, string>(typeof(TRet), new ArrayKey<Type>(types), ConnectionString, sql);

            return (Func<IDataReader, object, TRet>)MultiPocoFactories.Get(key, () =>
            {
                return CreateMultiPocoFactory<TRet>(types, ConnectionString, sql, r);
            }
            );
        }

    }

    internal class PocoColumn
    {
        public string ColumnName;
        public PropertyInfo PropertyInfo;
        public bool ResultColumn;
        public bool ForceToUtc;
        public virtual void SetValue(object target, object val) { PropertyInfo.SetValue(target, val, null); }
        public virtual object GetValue(object target) { return PropertyInfo.GetValue(target, null); }
        public virtual object ChangeType(object val) { return Convert.ChangeType(val, PropertyInfo.PropertyType); }
    }

    class PocoData
    {
        public static PocoData ForObject(object o, string primaryKeyName)
        {
            var t = o.GetType();
#if !PETAPOCO_NO_DYNAMIC
            if (t == typeof(System.Dynamic.ExpandoObject))
            {
                var pd = new PocoData();
                pd.TableInfo = new TableInfo();
                pd.Columns = new Dictionary<string, PocoColumn>(StringComparer.OrdinalIgnoreCase);
                pd.Columns.Add(primaryKeyName, new ExpandoColumn() { ColumnName = primaryKeyName });
                pd.TableInfo.PrimaryKey = primaryKeyName;
                pd.TableInfo.AutoIncrement = true;
                foreach (var col in (o as IDictionary<string, object>).Keys)
                {
                    if (col != primaryKeyName)
                        pd.Columns.Add(col, new ExpandoColumn() { ColumnName = col });
                }
                return pd;
            }
            else
#endif
                return ForType(t);
        }

        public static PocoData ForType(Type t)
        {
#if !PETAPOCO_NO_DYNAMIC
            if (t == typeof(System.Dynamic.ExpandoObject))
                throw new InvalidOperationException("Can't use dynamic types with this method");
#endif

            return _pocoDatas.Get(t, () => new PocoData(t));
        }

        public PocoData()
        {
        }

        public PocoData(Type t)
        {
            type = t;

            // Get the mapper for this type
            var mapper = Mappers.GetMapper(t);

            // Get the table info
            TableInfo = mapper.GetTableInfo(t);

            // Work out bound properties
            Columns = new Dictionary<string, PocoColumn>(StringComparer.OrdinalIgnoreCase);
            foreach (var pi in t.GetProperties())
            {
                ColumnInfo ci = mapper.GetColumnInfo(pi);
                if (ci == null)
                    continue;

                var pc = new PocoColumn();
                pc.PropertyInfo = pi;
                pc.ColumnName = ci.ColumnName;
                pc.ResultColumn = ci.ResultColumn;
                pc.ForceToUtc = ci.ForceToUtc;

                // Store it
                Columns.Add(pc.ColumnName, pc);
            }

            // Build column list for automatic select
            QueryColumns = (from c in Columns where !c.Value.ResultColumn select c.Key).ToArray();

        }

        static bool IsIntegralType(Type t)
        {
            var tc = Type.GetTypeCode(t);
            return tc >= TypeCode.SByte && tc <= TypeCode.UInt64;
        }

        // Create factory function that can convert a IDataReader record into a POCO
        public Delegate GetFactory(string sql, string connString, int firstColumn, int countColumns, IDataReader r)
        {
            // Check cache
            var key = Tuple.Create<string, string, int, int>(sql, connString, firstColumn, countColumns);

            return PocoFactories.Get(key, () =>
            {
                // Create the method
                var m = new DynamicMethod("petapoco_factory_" + PocoFactories.Count.ToString(), type, new Type[] { typeof(IDataReader) }, true);
                var il = m.GetILGenerator();
                var mapper = Mappers.GetMapper(type);

#if !PETAPOCO_NO_DYNAMIC
                if (type == typeof(object))
                {
                    // var poco=new T()
                    il.Emit(OpCodes.Newobj, typeof(System.Dynamic.ExpandoObject).GetConstructor(Type.EmptyTypes));          // obj

                    MethodInfo fnAdd = typeof(IDictionary<string, object>).GetMethod("Add");

                    // Enumerate all fields generating a set assignment for the column
                    for (int i = firstColumn; i < firstColumn + countColumns; i++)
                    {
                        var srcType = r.GetFieldType(i);

                        il.Emit(OpCodes.Dup);                       // obj, obj
                        il.Emit(OpCodes.Ldstr, r.GetName(i));       // obj, obj, fieldname

                        // Get the converter
                        Func<object, object> converter = mapper.GetFromDbConverter((PropertyInfo)null, srcType);

                        /*
                        if (ForceDateTimesToUtc && converter == null && srcType == typeof(DateTime))
                            converter = delegate(object src) { return new DateTime(((DateTime)src).Ticks, DateTimeKind.Utc); };
                        */

                        // Setup stack for call to converter
                        AddConverterToStack(il, converter);

                        // r[i]
                        il.Emit(OpCodes.Ldarg_0);                   // obj, obj, fieldname, converter?,    rdr
                        il.Emit(OpCodes.Ldc_I4, i);                 // obj, obj, fieldname, converter?,  rdr,i
                        il.Emit(OpCodes.Callvirt, fnGetValue);      // obj, obj, fieldname, converter?,  value

                        // Convert DBNull to null
                        il.Emit(OpCodes.Dup);                       // obj, obj, fieldname, converter?,  value, value
                        il.Emit(OpCodes.Isinst, typeof(DBNull));    // obj, obj, fieldname, converter?,  value, (value or null)
                        var lblNotNull = il.DefineLabel();
                        il.Emit(OpCodes.Brfalse_S, lblNotNull);     // obj, obj, fieldname, converter?,  value
                        il.Emit(OpCodes.Pop);                       // obj, obj, fieldname, converter?
                        if (converter != null)
                            il.Emit(OpCodes.Pop);                   // obj, obj, fieldname, 
                        il.Emit(OpCodes.Ldnull);                    // obj, obj, fieldname, null
                        if (converter != null)
                        {
                            var lblReady = il.DefineLabel();
                            il.Emit(OpCodes.Br_S, lblReady);
                            il.MarkLabel(lblNotNull);
                            il.Emit(OpCodes.Callvirt, fnInvoke);
                            il.MarkLabel(lblReady);
                        }
                        else
                        {
                            il.MarkLabel(lblNotNull);
                        }

                        il.Emit(OpCodes.Callvirt, fnAdd);
                    }
                }
                else
#endif
                        if (type.IsValueType || type == typeof(string) || type == typeof(byte[]))
                {
                    // Do we need to install a converter?
                    var srcType = r.GetFieldType(0);
                    var converter = GetConverter(mapper, null, srcType, type);

                    // "if (!rdr.IsDBNull(i))"
                    il.Emit(OpCodes.Ldarg_0);                                       // rdr
                    il.Emit(OpCodes.Ldc_I4_0);                                      // rdr,0
                    il.Emit(OpCodes.Callvirt, fnIsDBNull);                          // bool
                    var lblCont = il.DefineLabel();
                    il.Emit(OpCodes.Brfalse_S, lblCont);
                    il.Emit(OpCodes.Ldnull);                                        // null
                    var lblFin = il.DefineLabel();
                    il.Emit(OpCodes.Br_S, lblFin);

                    il.MarkLabel(lblCont);

                    // Setup stack for call to converter
                    AddConverterToStack(il, converter);

                    il.Emit(OpCodes.Ldarg_0);                                       // rdr
                    il.Emit(OpCodes.Ldc_I4_0);                                      // rdr,0
                    il.Emit(OpCodes.Callvirt, fnGetValue);                          // value

                    // Call the converter
                    if (converter != null)
                        il.Emit(OpCodes.Callvirt, fnInvoke);

                    il.MarkLabel(lblFin);
                    il.Emit(OpCodes.Unbox_Any, type);                               // value converted
                }
                else
                {
                    // var poco=new T()
                    il.Emit(OpCodes.Newobj, type.GetConstructor(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic, null, new Type[0], null));

                    // Enumerate all fields generating a set assignment for the column
                    for (int i = firstColumn; i < firstColumn + countColumns; i++)
                    {
                        // Get the PocoColumn for this db column, ignore if not known
                        PocoColumn pc;
                        if (!Columns.TryGetValue(r.GetName(i), out pc))
                            continue;

                        // Get the source type for this column
                        var srcType = r.GetFieldType(i);
                        var dstType = pc.PropertyInfo.PropertyType;

                        // "if (!rdr.IsDBNull(i))"
                        il.Emit(OpCodes.Ldarg_0);                                       // poco,rdr
                        il.Emit(OpCodes.Ldc_I4, i);                                     // poco,rdr,i
                        il.Emit(OpCodes.Callvirt, fnIsDBNull);                          // poco,bool
                        var lblNext = il.DefineLabel();
                        il.Emit(OpCodes.Brtrue_S, lblNext);                             // poco

                        il.Emit(OpCodes.Dup);                                           // poco,poco

                        // Do we need to install a converter?
                        var converter = GetConverter(mapper, pc, srcType, dstType);

                        // Fast
                        bool Handled = false;
                        if (converter == null)
                        {
                            var valuegetter = typeof(IDataRecord).GetMethod("Get" + srcType.Name, new Type[] { typeof(int) });
                            if (valuegetter != null
                                    && valuegetter.ReturnType == srcType
                                    && (valuegetter.ReturnType == dstType || valuegetter.ReturnType == Nullable.GetUnderlyingType(dstType)))
                            {
                                il.Emit(OpCodes.Ldarg_0);                                       // *,rdr
                                il.Emit(OpCodes.Ldc_I4, i);                                     // *,rdr,i
                                il.Emit(OpCodes.Callvirt, valuegetter);                         // *,value

                                // Convert to Nullable
                                if (Nullable.GetUnderlyingType(dstType) != null)
                                {
                                    il.Emit(OpCodes.Newobj, dstType.GetConstructor(new Type[] { Nullable.GetUnderlyingType(dstType) }));
                                }

                                il.Emit(OpCodes.Callvirt, pc.PropertyInfo.GetSetMethod(true));      // poco
                                Handled = true;
                            }
                        }

                        // Not so fast
                        if (!Handled)
                        {
                            // Setup stack for call to converter
                            AddConverterToStack(il, converter);

                            // "value = rdr.GetValue(i)"
                            il.Emit(OpCodes.Ldarg_0);                                       // *,rdr
                            il.Emit(OpCodes.Ldc_I4, i);                                     // *,rdr,i
                            il.Emit(OpCodes.Callvirt, fnGetValue);                          // *,value

                            // Call the converter
                            if (converter != null)
                                il.Emit(OpCodes.Callvirt, fnInvoke);

                            // Assign it
                            il.Emit(OpCodes.Unbox_Any, pc.PropertyInfo.PropertyType);       // poco,poco,value
                            il.Emit(OpCodes.Callvirt, pc.PropertyInfo.GetSetMethod(true));      // poco
                        }

                        il.MarkLabel(lblNext);
                    }

                    var fnOnLoaded = RecurseInheritedTypes<MethodInfo>(type, (x) => x.GetMethod("OnLoaded", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic, null, new Type[0], null));
                    if (fnOnLoaded != null)
                    {
                        il.Emit(OpCodes.Dup);
                        il.Emit(OpCodes.Callvirt, fnOnLoaded);
                    }
                }

                il.Emit(OpCodes.Ret);

                // Cache it, return it
                return m.CreateDelegate(Expression.GetFuncType(typeof(IDataReader), type));
            }
            );
        }

        private static void AddConverterToStack(ILGenerator il, Func<object, object> converter)
        {
            if (converter != null)
            {
                // Add the converter
                int converterIndex = _converters.Count;
                _converters.Add(converter);

                // Generate IL to push the converter onto the stack
                il.Emit(OpCodes.Ldsfld, fldConverters);
                il.Emit(OpCodes.Ldc_I4, converterIndex);
                il.Emit(OpCodes.Callvirt, fnListGetItem);                   // Converter
            }
        }

        private static Func<object, object> GetConverter(IMapper mapper, PocoColumn pc, Type srcType, Type dstType)
        {
            Func<object, object> converter = null;

            // Get converter from the mapper
            if (pc != null)
            {
                converter = mapper.GetFromDbConverter(pc.PropertyInfo, srcType);
                if (converter != null)
                    return converter;
            }

            // Standard DateTime->Utc mapper
            if (pc != null && pc.ForceToUtc && srcType == typeof(DateTime) && (dstType == typeof(DateTime) || dstType == typeof(DateTime?)))
            {
                return delegate (object src) { return new DateTime(((DateTime)src).Ticks, DateTimeKind.Utc); };
            }

            // Forced type conversion including integral types -> enum
            if (dstType.IsEnum && IsIntegralType(srcType))
            {
                if (srcType != typeof(int))
                {
                    return delegate (object src) { return Convert.ChangeType(src, typeof(int), null); };
                }
            }
            else if (!dstType.IsAssignableFrom(srcType))
            {
                if (dstType.IsEnum && srcType == typeof(string))
                {
                    return delegate (object src) { return EnumMapper.EnumFromString(dstType, (string)src); };
                }
                else
                {
                    return delegate (object src) { return Convert.ChangeType(src, dstType, null); };
                }
            }

            return null;
        }


        static T RecurseInheritedTypes<T>(Type t, Func<Type, T> cb)
        {
            while (t != null)
            {
                T info = cb(t);
                if (info != null)
                    return info;
                t = t.BaseType;
            }
            return default(T);
        }


        internal static void FlushCaches()
        {
            _pocoDatas.Flush();
        }

        static Cache<Type, PocoData> _pocoDatas = new Cache<Type, PocoData>();
        static List<Func<object, object>> _converters = new List<Func<object, object>>();
        static MethodInfo fnGetValue = typeof(IDataRecord).GetMethod("GetValue", new Type[] { typeof(int) });
        static MethodInfo fnIsDBNull = typeof(IDataRecord).GetMethod("IsDBNull");
        static FieldInfo fldConverters = typeof(PocoData).GetField("_converters", BindingFlags.Static | BindingFlags.GetField | BindingFlags.NonPublic);
        static MethodInfo fnListGetItem = typeof(List<Func<object, object>>).GetProperty("Item").GetGetMethod();
        static MethodInfo fnInvoke = typeof(Func<object, object>).GetMethod("Invoke");
        public Type type;
        public string[] QueryColumns { get; private set; }
        public TableInfo TableInfo { get; private set; }
        public Dictionary<string, PocoColumn> Columns { get; private set; }
        Cache<Tuple<string, string, int, int>, Delegate> PocoFactories = new Cache<Tuple<string, string, int, int>, Delegate>();
    }

    class ArrayKey<T>
    {
        public ArrayKey(T[] keys)
        {
            // Store the keys
            _keys = keys;

            // Calculate the hashcode
            _hashCode = 17;
            foreach (var k in keys)
            {
                _hashCode = _hashCode * 23 + (k == null ? 0 : k.GetHashCode());
            }
        }

        T[] _keys;
        int _hashCode;

        bool Equals(ArrayKey<T> other)
        {
            if (other == null)
                return false;

            if (other._hashCode != _hashCode)
                return false;

            if (other._keys.Length != _keys.Length)
                return false;

            for (int i = 0; i < _keys.Length; i++)
            {
                if (!object.Equals(_keys[i], other._keys[i]))
                    return false;
            }

            return true;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as ArrayKey<T>);
        }

        public override int GetHashCode()
        {
            return _hashCode;
        }

    }

    static class AutoSelectHelper
    {
        public static string AddSelectClause<T>(DatabaseType DatabaseType, string sql)
        {
            if (sql.StartsWith(";"))
                return sql.Substring(1);

            if (!rxSelect.IsMatch(sql))
            {
                var pd = PocoData.ForType(typeof(T));
                var tableName = DatabaseType.EscapeTableName(pd.TableInfo.TableName);
                string cols = pd.Columns.Count != 0 ? string.Join(", ", (from c in pd.QueryColumns select tableName + "." + DatabaseType.EscapeSqlIdentifier(c)).ToArray()) : "NULL";
                if (!rxFrom.IsMatch(sql))
                    sql = string.Format("SELECT {0} FROM {1} {2}", cols, tableName, sql);
                else
                    sql = string.Format("SELECT {0} {1}", cols, sql);
            }
            return sql;
        }

        static Regex rxSelect = new Regex(@"\A\s*(SELECT|EXECUTE|CALL)\s", RegexOptions.Compiled | RegexOptions.Singleline | RegexOptions.IgnoreCase | RegexOptions.Multiline);
        static Regex rxFrom = new Regex(@"\A\s*FROM\s", RegexOptions.Compiled | RegexOptions.Singleline | RegexOptions.IgnoreCase | RegexOptions.Multiline);
    }

    class Cache<TKey, TValue>
    {
        Dictionary<TKey, TValue> _map = new Dictionary<TKey, TValue>();
        ReaderWriterLockSlim _lock = new ReaderWriterLockSlim();

        public int Count
        {
            get
            {
                return _map.Count;
            }
        }

        public TValue Get(TKey key, Func<TValue> factory)
        {
            // Check cache
            _lock.EnterReadLock();
            TValue val;
            try
            {
                if (_map.TryGetValue(key, out val))
                    return val;
            }
            finally
            {
                _lock.ExitReadLock();
            }


            // Cache it
            _lock.EnterWriteLock();
            try
            {
                // Check again
                if (_map.TryGetValue(key, out val))
                    return val;

                // Create it
                val = factory();

                // Store it
                _map.Add(key, val);

                // Done
                return val;
            }
            finally
            {
                _lock.ExitWriteLock();
            }
        }

        public void Flush()
        {
            // Cache it
            _lock.EnterWriteLock();
            try
            {
                _map.Clear();
            }
            finally
            {
                _lock.ExitWriteLock();
            }

        }
    }

    internal static class EnumMapper
    {
        public static object EnumFromString(Type enumType, string value)
        {
            Dictionary<string, object> map = _types.Get(enumType, () =>
            {
                var values = Enum.GetValues(enumType);

                var newmap = new Dictionary<string, object>(values.Length, StringComparer.InvariantCultureIgnoreCase);

                foreach (var v in values)
                {
                    newmap.Add(v.ToString(), v);
                }

                return newmap;
            });


            return map[value];
        }

        static Cache<Type, Dictionary<string, object>> _types = new Cache<Type, Dictionary<string, object>>();
    }

    internal static class PagingHelper
    {
        public struct SQLParts
        {
            public string sql;
            public string sqlCount;
            public string sqlSelectRemoved;
            public string sqlOrderBy;
        }

        public static bool SplitSQL(string sql, out SQLParts parts)
        {
            parts.sql = sql;
            parts.sqlSelectRemoved = null;
            parts.sqlCount = null;
            parts.sqlOrderBy = null;

            // Extract the columns from "SELECT <whatever> FROM"
            var m = rxColumns.Match(sql);
            if (!m.Success)
                return false;

            // Save column list and replace with COUNT(*)
            System.Text.RegularExpressions.Group g = m.Groups[1];
            parts.sqlSelectRemoved = sql.Substring(g.Index);

            //if (rxDistinct.IsMatch(parts.sqlSelectRemoved))
            //	parts.sqlCount = sql.Substring(0, g.Index) + "COUNT(" + m.Groups[1].ToString().Trim() + ") " + sql.Substring(g.Index + g.Length);
            //else
            //	parts.sqlCount = sql.Substring(0, g.Index) + "COUNT(*) " + sql.Substring(g.Index + g.Length);

            if (rxDistinct.IsMatch(parts.sqlSelectRemoved))
            {
                //    if (sql.ToUpper().Contains("GROUP"))
                //    {
                //        parts.sqlCount = "select count(*) from (" + sql.Substring(0, g.Index) + "COUNT(" + m.Groups[1].ToString().Trim() + ") " + sql.Substring(g.Index + g.Length) + ") as res";
                //    }
                //    else
                //    {
                parts.sqlCount = sql.Substring(0, g.Index) + "COUNT(" + m.Groups[1].ToString().Trim() + ") " + sql.Substring(g.Index + g.Length);
                //}
            }

            else
            {
                //if (sql.ToUpper().Contains("GROUP"))
                //{
                //    parts.sqlCount = "select count(*) from (" + sql.Substring(0, g.Index) + "COUNT(*) " + sql.Substring(g.Index + g.Length) + ") as res";
                //}
                //else
                //{
                parts.sqlCount = sql.Substring(0, g.Index) + "COUNT(*) " + sql.Substring(g.Index + g.Length);
                //}
            }


            return true;

            // Look for the last "ORDER BY <whatever>" clause not part of a ROW_NUMBER expression
            //m = rxOrderBy.Match(parts.sqlCount);
            //if (!m.Success)
            //{
            //    parts.sqlOrderBy = null;
            //}
            //else
            //{
            //    g = m.Groups[0];
            //    parts.sqlOrderBy = g.ToString();
            //    parts.sqlCount = parts.sqlCount.Substring(0, g.Index) + parts.sqlCount.Substring(g.Index + g.Length);
            //}

            //return true;
        }

        public static Regex rxColumns = new Regex(@"\A\s*SELECT\s+((?:\((?>\((?<depth>)|\)(?<-depth>)|.?)*(?(depth)(?!))\)|.)*?)(?<!,\s+)\bFROM\b", RegexOptions.IgnoreCase | RegexOptions.Multiline | RegexOptions.Singleline | RegexOptions.Compiled);
        public static Regex rxOrderBy = new Regex(@"\bORDER\s+BY\s+(?!.*?(?:\)|\s+)AS\s)(?:\((?>\((?<depth>)|\)(?<-depth>)|.?)*(?(depth)(?!))\)|[\w\(\)\.])+(?:\s+(?:ASC|DESC))?(?:\s*,\s*(?:\((?>\((?<depth>)|\)(?<-depth>)|.?)*(?(depth)(?!))\)|[\w\(\)\.])+(?:\s+(?:ASC|DESC))?)*", RegexOptions.RightToLeft | RegexOptions.IgnoreCase | RegexOptions.Multiline | RegexOptions.Singleline | RegexOptions.Compiled);
        public static Regex rxDistinct = new Regex(@"\ADISTINCT\s", RegexOptions.IgnoreCase | RegexOptions.Multiline | RegexOptions.Singleline | RegexOptions.Compiled);
    }

    internal static class ParametersHelper
    {
        // Helper to handle named parameters from object properties
        public static string ProcessParams(string sql, object[] args_src, List<object> args_dest)
        {
            return rxParams.Replace(sql, m =>
            {
                string param = m.Value.Substring(1);

                object arg_val;

                int paramIndex;
                if (int.TryParse(param, out paramIndex))
                {
                    // Numbered parameter
                    if (paramIndex < 0 || paramIndex >= args_src.Length)
                        throw new ArgumentOutOfRangeException(string.Format("Parameter '@{0}' specified but only {1} parameters supplied (in `{2}`)", paramIndex, args_src.Length, sql));
                    arg_val = args_src[paramIndex];
                }
                else
                {
                    // Look for a property on one of the arguments with this name
                    bool found = false;
                    arg_val = null;
                    foreach (var o in args_src)
                    {
                        var pi = o.GetType().GetProperty(param);
                        if (pi != null)
                        {
                            arg_val = pi.GetValue(o, null);
                            found = true;
                            break;
                        }
                    }

                    if (!found)
                        throw new ArgumentException(string.Format("Parameter '@{0}' specified but none of the passed arguments have a property with this name (in '{1}')", param, sql));
                }

                // Expand collections to parameter lists
                if ((arg_val as System.Collections.IEnumerable) != null &&
                    (arg_val as string) == null &&
                    (arg_val as byte[]) == null)
                {
                    var sb = new StringBuilder();
                    foreach (var i in arg_val as System.Collections.IEnumerable)
                    {
                        sb.Append((sb.Length == 0 ? "@" : ",@") + args_dest.Count.ToString());
                        args_dest.Add(i);
                    }
                    return sb.ToString();
                }
                else
                {
                    args_dest.Add(arg_val);
                    return "@" + (args_dest.Count - 1).ToString();
                }
            }
            );
        }

        static Regex rxParams = new Regex(@"(?<!@)@\w+", RegexOptions.Compiled);
    }

    static class Singleton<T> where T : new()
    {
        public static T Instance = new T();
    }
}
