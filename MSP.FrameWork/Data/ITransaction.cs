using System;

namespace SD.FrameWork.Data
{
    public interface ITransaction : IDisposable
    {
        void Complete();
    }
}
