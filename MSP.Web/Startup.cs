using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(SD.Web.Startup))]
namespace SD.Web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
