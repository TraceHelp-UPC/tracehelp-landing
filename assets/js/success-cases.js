// Sección de casos de éxito (US05): banner de resultados, tarjetas y reproducción de video.
// El contenido viene de assets/js/success-cases-data.js. Todo se arma con textContent (sin HTML del archivo de datos).
(function () {
  const data = window.TRACEHELP_SUCCESS_CASES;
  const section = document.getElementById("casos");
  if (!data || !section) return;

  const VIDEO_UNAVAILABLE = "El video de este caso no está disponible por el momento.";
  const $ = (selector) => section.querySelector(selector);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  // ------------------------------------------------------------------ banner
  $("[data-cases-intro]").textContent = data.intro || "";
  $("[data-cases-banner-eyebrow]").textContent = data.banner?.eyebrow || "";
  $("[data-cases-banner-title]").textContent = data.banner?.title || "";
  $("[data-cases-banner-text]").textContent = data.banner?.text || "";
  $("[data-cases-disclaimer]").textContent = data.disclaimer || "";

  const rating = data.banner?.rating;
  if (rating && Number.isFinite(rating.value)) {
    const stars = $("[data-cases-stars]");
    const full = Math.round(rating.value);
    stars.textContent = "★".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
    $("[data-cases-rating-text]").textContent = `${rating.value.toFixed(1)} de 5 · ${rating.count} evaluaciones de clientes`;
    $("[data-cases-rating]").classList.replace("hidden", "flex");
  }

  const metrics = $("[data-cases-metrics]");
  (data.banner?.metrics || []).forEach((metric) => {
    const item = el("div", "flex flex-col justify-center bg-navy-900/80 px-8 py-6");
    item.append(el("dt", "order-2 mt-1 text-xs text-muted", metric.label), el("dd", "order-1 font-display text-2xl font-extrabold text-white", metric.value));
    metrics.append(item);
  });

  // ------------------------------------------------------------------ video
  function isYouTube(url) {
    return /^(https?:)?\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
  }

  function youTubeEmbed(url) {
    const match = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1` : null;
  }

  function showUnavailable(container) {
    container.replaceChildren(el("p", "rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber", VIDEO_UNAVAILABLE));
    container.setAttribute("role", "status");
  }

  function playVideo(video, container) {
    const src = (video?.src || "").trim();
    if (!src) return showUnavailable(container);

    if (isYouTube(src)) {
      const embed = youTubeEmbed(src);
      if (!embed) return showUnavailable(container);
      const frame = el("iframe", "aspect-video w-full rounded-lg");
      frame.src = embed;
      frame.title = video.title || "Video del caso";
      frame.allow = "autoplay; encrypted-media; picture-in-picture";
      frame.allowFullscreen = true;
      return container.replaceChildren(frame);
    }

    const player = el("video", "aspect-video w-full rounded-lg bg-black");
    player.controls = true;
    player.preload = "metadata";
    player.setAttribute("aria-label", video.title || "Video del caso");
    if (video.poster) player.poster = video.poster;
    const source = el("source");
    source.src = src;
    // Un archivo inexistente o con formato no soportado dispara "error" en <source>
    source.addEventListener("error", () => showUnavailable(container));
    player.addEventListener("error", () => showUnavailable(container));
    player.append(source);
    container.replaceChildren(player);
    player.play().catch(() => {
      /* el navegador puede bloquear la reproducción automática; quedan los controles */
    });
  }

  // ------------------------------------------------------------------ tarjetas
  const list = $("[data-cases-list]");
  (data.cases || []).forEach((item, index) => {
    const card = el("li", "flex flex-col rounded-2xl border border-navy-700 bg-navy-900 p-6");

    const header = el("div", "flex flex-wrap items-center gap-2");
    header.append(el("span", "rounded-full border border-navy-600 px-2.5 py-0.5 text-xs text-muted", item.sector));
    if (item.illustrative) {
      header.append(el("span", "rounded-full border border-amber/40 bg-amber/10 px-2.5 py-0.5 text-xs font-medium text-amber", "Escenario ilustrativo"));
    }

    const metric = el("div", "mt-5");
    metric.append(el("p", "font-display text-3xl font-extrabold text-emerald", item.metric?.value), el("p", "mt-1 text-sm text-ink", item.metric?.label));

    const body = el("div", "mt-5 flex-1 border-t border-navy-700 pt-5");
    body.append(el("h3", "font-semibold text-white", item.title));
    const text = el(item.illustrative ? "p" : "blockquote", "mt-2 text-sm leading-relaxed text-muted", item.illustrative ? item.body : `“${item.body}”`);
    body.append(text);

    const footer = el("div", "mt-6 flex flex-col gap-4");
    const author = el("p", "text-xs text-muted");
    author.append(el("span", "block font-medium text-ink", item.author?.name), `${item.author?.role || ""}${item.author?.company ? ` · ${item.author.company}` : ""}`);
    footer.append(author);

    if (item.video) {
      const player = el("div", "");
      player.id = `caso-video-${index}`;
      const button = el("button", "btn-secondary w-full py-2");
      button.type = "button";
      button.setAttribute("aria-controls", player.id);
      button.append(el("span", "", "▶"), el("span", "", item.video.title || "Ver video del caso"));
      button.addEventListener("click", () => {
        button.remove();
        playVideo(item.video, player);
      });
      footer.append(button, player);
    }

    card.append(header, metric, body, footer);
    list.append(card);
  });

  window.TraceHelpCases = { VIDEO_UNAVAILABLE, playVideo };
})();
