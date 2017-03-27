using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace SD.Web
{
    public static class StreamExtentions
    {
        public static byte[] ReadBytes(this Stream input)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                input.Position = 0;

                input.CopyTo(ms);
                return ms.ToArray();
            }
        }

        public static string HashSum(this Stream input)
        {
            input.Position = 0;

            byte[] hash = new MD5CryptoServiceProvider().ComputeHash(input);

            StringBuilder sb = new StringBuilder();

            for (int i = 0; i < hash.Length; i++)
            {
                sb.Append(hash[i].ToString("x2"));
            }

            return sb.ToString();
        }
    }
}