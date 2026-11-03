// Comportamiento general de la Landing Page: menú móvil y enlaces al portal.
(function () {
  const config = window.TRACEHELP_CONFIG || {};

  document.querySelectorAll("[data-app-login]").forEach((link) => {
    link.setAttribute("href", config.APP_LOGIN_URL || "#");
  });

  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.getElementById("menu-movil");
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setOpen(menu.classList.contains("hidden")));
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
})();
