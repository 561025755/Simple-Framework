using System;

namespace SD.Core.Domain
{
    /// <summary>
    /// For explicit poco properties, marks the property as a column and optionally 
    /// supplies the DB column name.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class ColumnAttribute : Attribute
    {
        public ColumnAttribute()
        {
            ForceToUtc = false;
        }

        public ColumnAttribute(string Name)
        {
            this.Name = Name;
            ForceToUtc = false;
        }

        public string Name
        {
            get;
            set;
        }

        public bool ForceToUtc
        {
            get;
            set;
        }
    }




    /// <summary>
    /// Poco classes marked with the Explicit attribute require all column properties to 
    /// be marked with the Column attribute
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class ExplicitColumnsAttribute : Attribute
    {
    }

    /// <summary>
    /// Use the Ignore attribute on POCO class properties that shouldn't be mapped
    /// by PetaPoco.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class IgnoreAttribute : Attribute
    {
    }


    /// <summary>
    /// Specifies the primary key column of a poco class, whether the column is auto incrementing
    /// and the sequence name for Oracle sequence columns.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class PrimaryKeyAttribute : Attribute
    {
        public PrimaryKeyAttribute(string primaryKey)
        {
            Value = primaryKey;
            autoIncrement = true;
        }

        public string Value
        {
            get;
            private set;
        }

        public string sequenceName
        {
            get;
            set;
        }

        public bool autoIncrement
        {
            get;
            set;
        }
    }



    /// <summary>
    /// Marks a poco property as a result only column that is populated in queries
    /// but not used for updates or inserts.
    /// </summary>
    [AttributeUsage(AttributeTargets.Property)]
    public class ResultColumnAttribute : ColumnAttribute
    {
        public ResultColumnAttribute()
        {
        }

        public ResultColumnAttribute(string name)
            : base(name)
        {
        }
    }


    /// <summary>
    /// Sets the DB table name to be used for a Poco class.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class TableNameAttribute : Attribute
    {
        public TableNameAttribute(string tableName)
        {
            Value = tableName;
        }

        public string Value
        {
            get;
            private set;
        }
    }
}
