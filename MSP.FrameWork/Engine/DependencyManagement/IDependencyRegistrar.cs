using Autofac;
using SD.Core.Configuration;
using System;

namespace SD.FrameWork.Engine.DependencyManagement
{
    public interface IDependencyRegistrar
    {
        void Register(ContainerBuilder builder, ITypeFinder typeFinder, WebAppEngineConfig config);

        int Order { get; }
    }
}
