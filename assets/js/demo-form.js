// Formulario de solicitud de prueba de concepto (US02). Valida en el navegador y envía a Formspree.
(function () {
  const form = document.getElementById("demo-form");
  if (!form) return;

  const config = window.TRACEHELP_CONFIG || {};
  const status = document.getElementById("demo-form-status");
  const submit = form.querySelector('button[type="submit"]');
  const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

  const rules = [
    ["demo-name", (v) => (v.trim().length >= 3 ? "" : "Escribe tu nombre y apellido.")],
    [
      "demo-email",
      (v) => (!v.trim() ? "Escribe tu correo corporativo." : EMAIL_PATTERN.test(v.trim()) ? "" : "El correo no tiene un formato válido, por ejemplo nombre@empresa.pe."),
    ],
    ["demo-company", (v) => (v.trim().length >= 2 ? "" : "Escribe el nombre de tu empresa.")],
    ["demo-itsm", (v) => (v ? "" : "Selecciona la herramienta que usa tu mesa de ayuda.")],
  ];

  function setError(id, message) {
    const field = document.getElementById(id);
    const error = form.querySelector(`[data-error-for="${id}"]`);
    field.setAttribute("aria-invalid", message ? "true" : "false");
    field.classList.toggle("border-crimson", Boolean(message));
    field.classList.toggle("border-navy-600", !message);
    if (message) field.setAttribute("aria-describedby", `${id}-error`);
    error.id = `${id}-error`;
    error.textContent = message;
    error.classList.toggle("hidden", !message);
  }

  function validate() {
    let firstInvalid = null;
    for (const [id, rule] of rules) {
      const message = rule(document.getElementById(id).value);
      setError(id, message);
      if (message && !firstInvalid) firstInvalid = document.getElementById(id);
    }
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function showStatus(kind, message) {
    const styles = {
      success: "border border-emerald/40 bg-emerald/10 text-emerald",
      error: "border border-crimson/40 bg-crimson/10 text-crimson",
    };
    status.className = `rounded-lg px-4 py-3 text-sm ${styles[kind]}`;
    status.textContent = message;
  }

  rules.forEach(([id, rule]) => {
    document.getElementById(id).addEventListener("blur", (e) => {
      if (e.target.getAttribute("aria-invalid") === "true") setError(id, rule(e.target.value));
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.className = "hidden";
    if (!validate()) return;

    if (!config.FORMSPREE_ENDPOINT) {
      showStatus("error", "El formulario aún no está conectado. Configura FORMSPREE_ENDPOINT en assets/js/config.js.");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Enviando solicitud…";
    try {
      const response = await fetch(config.FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      showStatus("success", "Solicitud registrada. Te escribiremos en las próximas 24 horas hábiles para coordinar la prueba.");
    } catch (error) {
      showStatus("error", "No pudimos registrar tu solicitud. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      submit.disabled = false;
      submit.textContent = "Agendar mi prueba de 14 días";
    }
  });
})();
