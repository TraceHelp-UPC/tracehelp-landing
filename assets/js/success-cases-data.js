// Contenido de la sección de casos de éxito (US05).
//
// Mientras no haya clientes, se muestran escenarios ilustrativos marcados como tales y metas (no resultados).
// Cuando el primer cliente del programa de adoptantes tempranos autorice publicar su caso:
//   1. Agrega un objeto a "cases" con illustrative: false, la cita real y los datos de la persona.
//   2. Reemplaza las metas por los resultados medidos y, si hay encuestas, completa "rating".
//   3. Si el caso tiene video, coloca la URL en video.src (archivo .mp4/.webm o enlace de YouTube).
// Un caso sin video o con un video que no carga muestra el mensaje de recurso no disponible.
window.TRACEHELP_SUCCESS_CASES = {
  intro:
    "Estamos documentando nuestros primeros casos con empresas medianas. Así es como mediremos los resultados contigo.",
  banner: {
    eyebrow: "Programa de adoptantes tempranos 2026",
    title: "Las primeras 5 empresas serán nuestros casos documentados",
    text:
      "Precio preferencial congelado durante el primer año a cambio de medir juntos la reducción del tiempo de resolución (MTTR) y las horas recuperadas por tu equipo.",
    // Calificación promedio real de clientes, por ejemplo { value: 4.8, count: 25 }. null = no se muestra.
    rating: null,
    metrics: [
      { value: "5", label: "cupos para empresas medianas" },
      { value: "14 días", label: "de prueba con tus tickets y manuales" },
      { value: "1 informe", label: "de ahorro medido al final de la prueba" },
    ],
  },
  disclaimer:
    "Los escenarios son ilustrativos: describen situaciones típicas de mesas de ayuda y las metas que medimos en la prueba. No corresponden a clientes reales ni a resultados obtenidos.",
  cases: [
    {
      illustrative: true,
      sector: "Retail",
      title: "Restablecimiento de accesos en temporada alta",
      metric: { value: "Meta 40 %", label: "de tickets de acceso resueltos por autoservicio" },
      body:
        "Una mesa de ayuda recibe cientos de pedidos de desbloqueo de cuenta durante campañas. TraceHelp reconoce el error en la captura y guía al colaborador con el procedimiento del manual de Directorio Activo.",
      author: { name: "Escenario ilustrativo", role: "Jefatura de mesa de ayuda", company: "Cadena de tiendas" },
      video: { src: "", title: "Demostración: desbloqueo de cuenta" },
    },
    {
      illustrative: true,
      sector: "Servicios financieros",
      title: "Errores de VPN en trabajo remoto",
      metric: { value: "Meta −30 %", label: "en el tiempo de resolución de incidentes de VPN" },
      body:
        "Los analistas L1 responden siempre las mismas consultas sobre el error 809. TraceHelp propone la solución con la página exacta de la guía de VPN y el analista la aprueba con un clic.",
      author: { name: "Escenario ilustrativo", role: "Gerencia de TI", company: "Entidad financiera" },
      video: { src: "", title: "Demostración: error 809 de VPN" },
    },
    {
      illustrative: true,
      sector: "Logística",
      title: "Fallas del ERP sin documentar",
      metric: { value: "0", label: "respuestas sin cita: si no hay evidencia, decide una persona" },
      body:
        "Cuando el manual no cubre un error del ERP, TraceHelp no inventa una solución: escala el ticket y registra el vacío para que el equipo complete la documentación.",
      author: { name: "Escenario ilustrativo", role: "Coordinación de soporte", company: "Operador logístico" },
      video: null,
    },
  ],
};
