using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace SD.FrameWork.Common
{
    public static class Des_Encryption
    {

        public static string eKey = ConfigurationManager.AppSettings["eKey"];//"Digitals";'
        /// <summary>
        /// DES解密
        /// </summary>
        /// <param name="objStr">解密字符串</param>
        /// <returns></returns>
        public static string DESDecrypt(this string objStr)
        {

            if (string.IsNullOrEmpty(eKey))
                throw new Exception("加密Key值不能为空");
            if (eKey.Length != 8)
                throw new Exception("加密Key值的长度必须为8位");
            DESCryptoServiceProvider des = new DESCryptoServiceProvider();
            byte[] inputByteArray = new byte[objStr.Length / 2];
            for (int x = 0; x < objStr.Length / 2; x++)
            {
                int i = (Convert.ToInt32(objStr.Substring(x * 2, 2), 16));
                inputByteArray[x] = (byte)i;
            }
            des.Key = UTF8Encoding.UTF8.GetBytes(eKey);
            des.IV = UTF8Encoding.UTF8.GetBytes(eKey);
            MemoryStream ms = new MemoryStream();
            CryptoStream cs = new CryptoStream(ms, des.CreateDecryptor(), CryptoStreamMode.Write);
            cs.Write(inputByteArray, 0, inputByteArray.Length);
            cs.FlushFinalBlock();
            StringBuilder ret = new StringBuilder();
            return Encoding.UTF8.GetString(ms.ToArray());
        }

        /// <summary>
        /// DES 默认框架Key值加密
        /// </summary>
        /// <param name="strObj"></param>
        /// <param name="eKey"></param>
        /// <returns></returns>
        public static string DESEncrypt(this string strObj)
        {
            if (string.IsNullOrEmpty(eKey))
                throw new Exception("加密Key值不能为空");
            if (eKey.Length != 8)
                throw new Exception("加密Key值的长度必须为8位");
            var des = new DESCryptoServiceProvider();
            var inputByteArray = Encoding.UTF8.GetBytes(strObj);
            des.Key = Encoding.UTF8.GetBytes(eKey);
            des.IV = Encoding.UTF8.GetBytes(eKey);
            var ms = new MemoryStream();
            var cs = new CryptoStream(ms, des.CreateEncryptor(), CryptoStreamMode.Write);
            cs.Write(inputByteArray, 0, inputByteArray.Length);
            cs.FlushFinalBlock();
            var ret = new StringBuilder();
            foreach (var b in ms.ToArray())
                ret.AppendFormat("{0:X2}", b);
            return ret.ToString();
        }

    }
}
