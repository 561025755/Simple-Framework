using System;
using System.Collections.Generic;
using System.Linq;

using AutoMapper;
using SD.Core.Domain;
using SD.Models.Domain;
using System.Linq.Expressions;
using System.Collections;

namespace SD.Web
{
    public static class MappingExtensions
    {
        #region System

        #region Group

        public static GroupModel ToModel(this Sys_Group entity)
        {
            return Mapper.Map<Sys_Group, GroupModel>(entity);
        }
        public static Sys_Group ToEntity(this GroupModel model)
        {
            return Mapper.Map<GroupModel, Sys_Group>(model);
        }
        public static Sys_Group ToEntity(this GroupModel model, Sys_Group destination)
        {
            return Mapper.Map(model, destination);
        }

        #endregion

        public static UserModel ToModel(this Sys_User entity)
        {
            return Mapper.Map<Sys_User, UserModel>(entity);
        }
        public static Sys_User ToEntity(this UserModel model)
        {
            return Mapper.Map<UserModel, Sys_User>(model);
        }
        public static Sys_User ToEntity(this UserModel model, Sys_User destination)
        {
            return Mapper.Map(model, destination);
        }

        #endregion


        /// <summary>
        /// 类型映射
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static T MapTo<T>(this object obj)
        {
            if (obj == null)
            {
                return default(T);
            }
            
            Mapper.CreateMap(obj.GetType(), typeof(T));
            return Mapper.Map<T>(obj);
        }

        /// <summary>
        /// 类型映射
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <typeparam name="TDestination"></typeparam>
        /// <param name="source"></param>
        /// <param name="destination"></param>
        /// <returns></returns>
        public static TDestination MapTo<TSource, TDestination>(this TSource source, TDestination destination) where TDestination : class where TSource : class
        {
            if (source == null)
            {
                return destination;
            }

            Mapper.CreateMap<TSource, TDestination>();
            return Mapper.Map<TDestination>(source);
        }

        /// <summary>
        /// 集合列表类型互转
        /// </summary>
        /// <typeparam name="TDestination"></typeparam>
        /// <param name="source"></param>
        /// <returns></returns>
        public static List<TDestination> MapToList<TDestination>(this IEnumerable source)
        {
            foreach (var first in source)
            {
                var type = first.GetType();
                Mapper.CreateMap(type, typeof(TDestination));
                break;
            }

            return Mapper.Map<List<TDestination>>(source);
        }

        /// <summary>
        /// 集合列表类型互转
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <typeparam name="TDestination"></typeparam>
        /// <param name="source"></param>
        /// <returns></returns>
        public static List<TDestination> MapToList<TSource, TDestination>(this IEnumerable<TSource> source)
        {
            Mapper.CreateMap<TSource, TDestination>();
            return Mapper.Map<List<TDestination>>(source);
        }

        /// <summary>
        /// CreateMap
        /// </summary>
        /// <typeparam name="TSource"></typeparam>
        /// <typeparam name="TDestination"></typeparam>
        /// <param name="source"></param>
        /// <param name="destination"></param>
        /// <returns></returns>
        public static void CreateMap<TSource, TDestination>(this object obj) where TDestination : class where TSource : class
        {
            Mapper.CreateMap<TSource, TDestination>();
        }


        /// <summary>
        /// 把object对象的属性反射获取到字典列表中
        /// </summary>
        /// <param name="data">object对象</param>
        /// <returns>返回Dictionary(属性名,属性值)列表</returns>
        public static Dictionary<string, string> GetProperties(object data)
        {
            Dictionary<string, string> dict = new Dictionary<string, string>();

            Type type = data.GetType();
            string[] propertyNames = type.GetProperties().Select(p => p.Name).ToArray();
            foreach (var prop in propertyNames)
            {
                var f = type.GetProperty(prop);
                object propValue = type.GetProperty(prop).GetValue(data, null);
                string value = (propValue != null) ? propValue.ToString() : "";
                if (!dict.ContainsKey(prop))
                {
                    dict.Add(prop, value);
                }
            }
            return dict;
        }

    }
}