using Microsoft.AspNetCore.Mvc;

namespace SeuProjeto.ViewComponents
{
    // O nome da classe deve terminar em 'ViewComponent'
    public class NavigationBarDropDownViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            // Aqui você pode buscar dados do Umbraco se necessário
            return View();
        }
    }
}