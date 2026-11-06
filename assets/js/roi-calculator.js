// Calculadora de ROI (US03). El cálculo se hace en el navegador con costos de referencia; no llama al backend.
(function () {
  const form = document.getElementById("roi-form");
  if (!form) return;

  // Costos y supuestos de referencia (Capítulo V, RoiEstimation): L1 ≈ $22 por ticket y autoservicio < $2
  const ASSUMPTIONS = {
    costL1: 22,
    costSelfService: 2,
    deflectionRate: 0.4,
    minutesPerTicket: 20,
  };

  const FIELDS = {
    tickets: { id: "roi-tickets", label: "los tickets al mes", max: 20000 },
    analysts: { id: "roi-analysts", label: "el número de analistas", max: 500 },
  };

  const status = document.getElementById("roi-status");
  const results = form.querySelector("[data-roi-results]");
  const output = (key) => form.querySelector(`[data-roi-output="${key}"]`);

  const usd = new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const number = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 });
  const decimal = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 });

  form.querySelector('[data-roi-assumption="costL1"]').textContent = usd.format(ASSUMPTIONS.costL1);
  form.querySelector('[data-roi-assumption="costSelfService"]').textContent = usd.format(ASSUMPTIONS.costSelfService);
  form.querySelector('[data-roi-assumption="deflectionRate"]').textContent = `${ASSUMPTIONS.deflectionRate * 100} %`;
  form.querySelector('[data-roi-assumption="minutesPerTicket"]').textContent = `${ASSUMPTIONS.minutesPerTicket} minutos`;

  /**
   * Calcula el ahorro mensual estimado. Devuelve null si los datos no son enteros positivos.
   * Se expone en window.TraceHelpRoi para las pruebas de aceptación de la landing (T58).
   */
  function calculateMonthlyRoi(tickets, analysts) {
    if (!Number.isInteger(tickets) || !Number.isInteger(analysts) || tickets <= 0 || analysts <= 0) return null;
    const deflected = tickets * ASSUMPTIONS.deflectionRate;
    const monthlySavings = deflected * (ASSUMPTIONS.costL1 - ASSUMPTIONS.costSelfService);
    const hoursFreed = (deflected * ASSUMPTIONS.minutesPerTicket) / 60;
    return {
      deflectedTickets: deflected,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      hoursFreed,
      hoursPerAnalyst: hoursFreed / analysts,
      ticketsPerAnalystBefore: tickets / analysts,
      ticketsPerAnalystAfter: (tickets - deflected) / analysts,
    };
  }

  // Devuelve { value } o { error, kind } donde kind es "missing" (dato omitido) o "invalid" (negativo o no válido)
  function readField(field) {
    const raw = document.getElementById(field.id).value.trim();
    if (raw === "") return { kind: "missing", error: `Ingresa ${field.label}.` };
    const value = Number(raw);
    if (!Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
      return { kind: "invalid", error: "Usa un número entero mayor que cero." };
    }
    if (value > field.max) return { kind: "invalid", error: `El máximo permitido es ${number.format(field.max)}.` };
    return { value };
  }

  function setFieldError(field, message) {
    const input = document.getElementById(field.id);
    const error = form.querySelector(`[data-roi-error-for="${field.id}"]`);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    input.classList.toggle("border-crimson", Boolean(message));
    input.classList.toggle("border-navy-600", !message);
    error.id = `${field.id}-error`;
    if (message) input.setAttribute("aria-describedby", error.id);
    else input.removeAttribute("aria-describedby");
    error.textContent = message || "";
    error.classList.toggle("hidden", !message);
  }

  function showStatus(message) {
    status.textContent = message || "";
    status.classList.toggle("hidden", !message);
    results.classList.toggle("opacity-40", Boolean(message));
  }

  function clearOutputs() {
    form.querySelectorAll("[data-roi-output]").forEach((node) => {
      node.textContent = node.dataset.roiOutput === "summary" ? "" : "—";
    });
  }

  let lastValid = null;

  function update() {
    const read = { tickets: readField(FIELDS.tickets), analysts: readField(FIELDS.analysts) };
    setFieldError(FIELDS.tickets, read.tickets.error);
    setFieldError(FIELDS.analysts, read.analysts.error);

    const problems = [read.tickets, read.analysts].filter((r) => r.error);
    if (problems.length) {
      lastValid = null;
      clearOutputs();
      const missing = problems.some((p) => p.kind === "missing");
      showStatus(
        missing
          ? "Falta información para estimar el ahorro: completa los tickets al mes y el número de analistas."
          : "Revisa los datos: solo se aceptan números enteros mayores que cero."
      );
      return;
    }

    const roi = calculateMonthlyRoi(read.tickets.value, read.analysts.value);
    lastValid = { tickets: read.tickets.value, analysts: read.analysts.value, roi };
    showStatus("");
    output("monthlySavings").textContent = usd.format(roi.monthlySavings);
    output("annualSavings").textContent = usd.format(roi.annualSavings);
    output("hoursFreed").textContent = number.format(roi.hoursFreed);
    output("hoursPerAnalyst").textContent = `${decimal.format(roi.hoursPerAnalyst)} h`;
    output("ticketsPerAnalystAfter").textContent = number.format(roi.ticketsPerAnalystAfter);
    output("ticketsPerAnalystBefore").textContent = number.format(roi.ticketsPerAnalystBefore);
    output("summary").textContent =
      `Con ${number.format(read.tickets.value)} tickets al mes, unos ${number.format(roi.deflectedTickets)} se resolverían ` +
      `por autoservicio en lugar de pasar por un analista L1.`;
  }

  // Sincroniza cada slider con su campo numérico
  form.querySelectorAll("[data-roi-range-for]").forEach((range) => {
    const input = document.getElementById(range.dataset.roiRangeFor);
    range.addEventListener("input", () => {
      input.value = range.value;
      update();
    });
    input.addEventListener("input", () => {
      const value = Number(input.value);
      if (Number.isFinite(value)) range.value = String(Math.min(Math.max(value, Number(range.min)), Number(range.max)));
      update();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });

  // "Probarlo con mis datos": lleva las cifras al formulario de prueba de concepto (US02)
  const toDemo = form.querySelector("[data-roi-to-demo]");
  toDemo.addEventListener("click", (event) => {
    if (!lastValid) {
      event.preventDefault();
      update();
      document.getElementById(problemFieldId()).focus();
      return;
    }
    document.querySelector('[data-roi-hidden="tickets"]').value = String(lastValid.tickets);
    document.querySelector('[data-roi-hidden="analysts"]').value = String(lastValid.analysts);
    const note = document.querySelector("[data-roi-demo-note]");
    if (note) {
      note.textContent =
        `Incluiremos tus datos en la solicitud: ${number.format(lastValid.tickets)} tickets al mes y ` +
        `${number.format(lastValid.analysts)} analistas (ahorro estimado de ${usd.format(lastValid.roi.monthlySavings)} al mes).`;
      note.classList.remove("hidden");
    }
  });

  function problemFieldId() {
    return readField(FIELDS.tickets).error ? FIELDS.tickets.id : FIELDS.analysts.id;
  }

  window.TraceHelpRoi = { calculateMonthlyRoi, ASSUMPTIONS };
  update();
})();
