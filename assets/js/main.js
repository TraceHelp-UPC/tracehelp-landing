// Comportamiento general de la Landing Page: menú móvil, enlaces al portal y canales de contacto.
(function () {
  const config = window.TRACEHELP_CONFIG || {};

  document.querySelectorAll("[data-app-login]").forEach((link) => {
    link.setAttribute("href", config.APP_LOGIN_URL || "#");
  });

  // Canales de contacto (US04): solo se muestran los que están configurados en config.js
  const contact = config.CONTACT || {};
  const channels = {
    email: contact.EMAIL ? { href: `mailto:${contact.EMAIL}`, text: contact.EMAIL } : null,
    linkedin: contact.LINKEDIN_URL ? { href: contact.LINKEDIN_URL } : null,
    github: contact.GITHUB_URL ? { href: contact.GITHUB_URL } : null,
  };
  Object.entries(channels).forEach(([name, channel]) => {
    const item = document.querySelector(`[data-contact="${name}"]`);
    if (!item || !channel) return;
    const link = item.querySelector("[data-contact-link]");
    link.setAttribute("href", channel.href);
    if (channel.text) link.textContent = channel.text;
    item.classList.remove("hidden");
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
