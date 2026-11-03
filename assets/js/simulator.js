// Simulador ilustrativo del triaje (US01). Usa datos ficticios; no llama al backend.
(function () {
  const CASES = [
    {
      ticket: "TK-0042",
      errorTitle: "Error de autenticación de dominio",
      errorCode: "0x80070005",
      errorText:
        "Acceso denegado. El controlador de dominio rechazó la solicitud del usuario jperez (DNI 45872319) desde 10.4.2.18. Permisos insuficientes en OU=Finanzas.",
      masked: [
        ["jperez", "[USUARIO]"],
        ["45872319", "[DNI_OCULTO]"],
        ["10.4.2.18", "[IP_OCULTA]"],
      ],
      score: 0.94,
      citation: "Manual_Directorio_Activo_v2.pdf, pág. 14, párr. 3",
      steps: [
        "Ejecutar <code>gpupdate /force</code> en la estación del colaborador.",
        "Verificar su pertenencia al grupo <code>CORP-Finanzas-Acceso</code> y purgar tickets con <code>klist purge</code>.",
      ],
    },
    {
      ticket: "TK-0057",
      errorTitle: "Conexión VPN fallida",
      errorCode: "Error 809",
      errorText:
        "No se pudo establecer la conexión entre su equipo y el servidor VPN vpn.empresa.pe. Usuario: mtorres@empresa.pe.",
      masked: [["mtorres@empresa.pe", "[CORREO_OCULTO]"]],
      score: 0.88,
      citation: "Guia_VPN_Corporativa.pdf, pág. 6, párr. 2",
      steps: [
        "Confirmar que la red doméstica permite tráfico por los puertos UDP 500 y 4500.",
        "Reinstalar el perfil VPN desde el Portal de Software y reiniciar el servicio de acceso remoto.",
      ],
    },
    {
      ticket: "TK-0063",
      errorTitle: "Error en aplicación interna",
      errorCode: "ERR-X99",
      errorText: "El módulo de cotizaciones devolvió un error no controlado al generar el PDF de la cotización 2026-118.",
      masked: [],
      score: 0.52,
      citation: null,
      steps: [],
    },
  ];

  const THRESHOLD = 0.7;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (key) => document.querySelector(`[data-sim="${key}"]`);
  const tabs = document.querySelectorAll(".sim-tab");
  const stages = document.querySelectorAll(".stage");
  if (!tabs.length) return;

  let timers = [];

  function render(index) {
    const c = CASES[index];
    const grounded = c.score >= THRESHOLD;

    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute("aria-selected", String(active));
      tab.className = `sim-tab rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-electric text-white" : "text-muted hover:text-white"
      }`;
    });

    $("ticket").textContent = c.ticket;
    $("errorTitle").textContent = c.errorTitle;
    $("errorCode").textContent = c.errorCode;
    $("errorText").textContent = c.errorText;

    $("masked").innerHTML = c.masked.length
      ? c.masked
          .map(
            ([raw, tag]) =>
              `<li class="rounded-md border border-navy-700 bg-navy-800 px-2 py-1 font-mono text-[11px]"><span class="text-muted line-through">${raw}</span> <span class="text-cyan">${tag}</span></li>`
          )
          .join("")
      : '<li class="text-xs text-muted">No se detectaron datos sensibles.</li>';

    const percent = Math.round(c.score * 100);
    const color = !grounded ? "amber" : c.score >= 0.85 ? "emerald" : "cyan";
    $("score").textContent = `${percent} %`;
    $("score").className = `font-display text-xl font-bold text-${color}`;
    $("bar").className = `h-full rounded-full transition-[width] duration-700 bg-${color}`;
    $("bar").style.width = "0%";

    $("answer").innerHTML = grounded
      ? `<p class="text-xs font-medium text-muted">Solución propuesta</p>
         <ol class="mt-2 space-y-2">${c.steps
           .map(
             (s, i) =>
               `<li class="flex gap-3 rounded-lg border border-navy-700 bg-navy-800 p-3 text-sm leading-snug"><span class="font-display font-bold text-cyan">${
                 i + 1
               }</span><span class="[&_code]:font-mono [&_code]:text-[12px] [&_code]:text-cyan">${s}</span></li>`
           )
           .join("")}</ol>
         <p class="mt-3 inline-flex rounded-md border border-cyan/30 bg-cyan/10 px-2 py-1 font-mono text-[11px] text-cyan">Fuente: ${c.citation}</p>`
      : `<div class="rounded-lg border border-amber/30 bg-amber/10 p-4 text-sm leading-relaxed">
           <p class="font-semibold text-amber">Sin evidencia suficiente en los manuales</p>
           <p class="mt-1 text-ink/90">TraceHelp no genera una respuesta. El ticket pasa a la cola de un analista L1 con la captura y el texto ya extraídos.</p>
         </div>`;

    $("footnote").textContent = grounded
      ? "La respuesta se envía solo después de que un analista la valide."
      : "Resolución manual por un analista.";

    const action = $("action");
    action.disabled = false;
    action.textContent = grounded ? "Aprobar y enviar" : "Asignar a un analista";
    action.className = `inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
      grounded ? "bg-emerald/90 hover:bg-emerald" : "bg-electric hover:bg-electric-hover"
    }`;
    action.onclick = () => {
      action.disabled = true;
      action.textContent = grounded ? "Aprobado y enviado al colaborador" : "Asignado a la cola L1";
      action.className =
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border border-emerald/40 bg-emerald/10 text-emerald";
    };

    // Revela las etapas en orden: captura, anonimización, coincidencia y respuesta
    timers.forEach(clearTimeout);
    timers = [];
    stages.forEach((s) => s.classList.remove("is-done"));
    const step = reduceMotion ? 0 : 450;
    stages.forEach((stage, i) => {
      timers.push(
        setTimeout(() => {
          stage.classList.add("is-done");
          if (stage.dataset.stage === "2") $("bar").style.width = `${percent}%`;
        }, i * step)
      );
    });
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => render(Number(tab.dataset.case))));
  render(0);
})();
