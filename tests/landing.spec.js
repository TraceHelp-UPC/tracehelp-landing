// Pruebas de aceptación automatizadas de la Landing Page de TraceHelp (T58 · US05).
const { test, expect } = require("@playwright/test");

test.describe("TraceHelp Landing Page — Pruebas de Aceptación (T58)", () => {
  test("1. Carga todas las secciones principales de la landing", async ({ page }) => {
    await page.goto("index.html");
    await expect(page).toHaveTitle(/TraceHelp/i);

    for (const sectionId of ["inicio", "capacidades", "roi", "seguridad", "casos", "nosotros", "demo"]) {
      await expect(page.locator(`#${sectionId}`)).toBeVisible();
    }
  });

  test("2. El botón de ingreso apunta a APP_LOGIN_URL configurado en config.js", async ({ page }) => {
    await page.goto("index.html");

    const configuredUrl = await page.evaluate(() => window.TRACEHELP_CONFIG?.APP_LOGIN_URL);
    expect(configuredUrl).toBeTruthy();
    expect(configuredUrl).toContain("appsmith.com");

    const loginLinks = page.locator("[data-app-login]");
    expect(await loginLinks.count()).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < (await loginLinks.count()); i++) {
      await expect(loginLinks.nth(i)).toHaveAttribute("href", configuredUrl);
    }
  });

  test("3. Validaciones y envío del formulario de solicitud de prueba de concepto (US02)", async ({ page }) => {
    await page.goto("index.html");

    const submitBtn = page.locator('#demo-form button[type="submit"]');
    await submitBtn.click();

    await expect(page.locator('[data-error-for="demo-name"]')).toContainText("Escribe tu nombre y apellido.");
    await expect(page.locator('[data-error-for="demo-email"]')).toContainText("Escribe tu correo corporativo.");
    await expect(page.locator('[data-error-for="demo-company"]')).toContainText("Escribe el nombre de tu empresa.");
    await expect(page.locator('[data-error-for="demo-itsm"]')).toContainText(
      "Selecciona la herramienta que usa tu mesa de ayuda."
    );

    // Correo con formato inválido
    await page.fill("#demo-name", "Roberto Pérez");
    await page.fill("#demo-email", "correo-invalido");
    await page.fill("#demo-company", "Empresa Demo S.A.C.");
    await page.selectOption("#demo-itsm", { label: "Jira Service Management" });
    await submitBtn.dispatchEvent("click");

    await expect(page.locator('[data-error-for="demo-email"]')).toContainText("El correo no tiene un formato válido");

    // Envío exitoso simulando respuesta 200 de Formspree
    await page.route("**/formspree.io/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      })
    );
    await page.fill("#demo-email", "roberto.perez@empresa.pe");
    await page.locator("#demo-form").dispatchEvent("submit");

    await expect(page.locator("#demo-form-status")).toContainText("Solicitud registrada");
  });

  test("4. Calculadora de ROI con valores conocidos y validaciones de entrada (US03)", async ({ page }) => {
    await page.goto("index.html");

    // Verificación directa de la función expuesta window.TraceHelpRoi.calculateMonthlyRoi
    // Con 1000 tickets/mes y 5 analistas:
    // deflected = 1000 * 0.4 = 400
    // monthlySavings = 400 * (22 - 2) = 8000 USD
    // annualSavings = 8000 * 12 = 96000 USD
    // hoursFreed = (400 * 20) / 60 = 133.333...
    // ticketsPerAnalystBefore = 200, ticketsPerAnalystAfter = 120
    const roiResult = await page.evaluate(() => window.TraceHelpRoi.calculateMonthlyRoi(1000, 5));
    expect(roiResult).toEqual({
      deflectedTickets: 400,
      monthlySavings: 8000,
      annualSavings: 96000,
      hoursFreed: (400 * 20) / 60,
      hoursPerAnalyst: (400 * 20) / 60 / 5,
      ticketsPerAnalystBefore: 200,
      ticketsPerAnalystAfter: 120,
    });

    // Interacción en la UI con 1000 tickets y 5 analistas
    await page.fill("#roi-tickets", "1000");
    await page.fill("#roi-analysts", "5");

    await expect(page.locator('[data-roi-output="monthlySavings"]')).toContainText("8");
    await expect(page.locator('[data-roi-output="annualSavings"]')).toContainText("96");
    await expect(page.locator('[data-roi-output="hoursFreed"]')).toHaveText("133");
    await expect(page.locator('[data-roi-output="ticketsPerAnalystBefore"]')).toHaveText("200");
    await expect(page.locator('[data-roi-output="ticketsPerAnalystAfter"]')).toHaveText("120");

    // "Probarlo con mis datos" traslada los valores al formulario de demo
    await page.locator("[data-roi-to-demo]").click();
    await expect(page.locator('[data-roi-hidden="tickets"]')).toHaveValue("1000");
    await expect(page.locator('[data-roi-hidden="analysts"]')).toHaveValue("5");
    await expect(page.locator("[data-roi-demo-note]")).toBeVisible();

    // Validación con datos vacíos o negativos
    await page.fill("#roi-tickets", "");
    await expect(page.locator("#roi-status")).toContainText("Falta información para estimar el ahorro");

    await page.fill("#roi-tickets", "-10");
    await expect(page.locator("#roi-status")).toContainText(
      "Revisa los datos: solo se aceptan números enteros mayores que cero."
    );
  });

  test("5. Casos de éxito visibles y manejo de video no disponible (US05)", async ({ page }) => {
    await page.goto("index.html");

    const cards = page.locator("[data-cases-list] > li");
    await expect(cards).toHaveCount(3);
    await expect(page.locator("[data-cases-banner-title]")).not.toBeEmpty();
    await expect(page.locator("[data-cases-disclaimer]")).toContainText("ilustrativos");

    // Al pulsar el botón de video de un caso ilustrativo sin src, muestra aviso controlado
    const firstVideoBtn = cards.first().locator("button");
    await expect(firstVideoBtn).toBeVisible();
    await firstVideoBtn.click();
    await expect(cards.first().locator('[role="status"]')).toContainText(
      "El video de este caso no está disponible por el momento."
    );
  });

  test("6. Enlaces institucionales y página legal de Política de Privacidad funcionando (US04)", async ({ page }) => {
    await page.goto("index.html");

    const privacyLink = page.locator('footer a[href="privacidad.html"]');
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();

    await expect(page).toHaveURL(/privacidad\.html$/);
    await expect(page.locator("h1")).toContainText("Política de privacidad");
    await expect(page.locator("#responsable")).toContainText("Ley N.° 29733");

    const backLink = page.locator('header a[href="index.html"]').first();
    await backLink.click();
    await expect(page.locator("#inicio")).toBeVisible();
  });

  test("7. Vista móvil responsiva sin desbordes horizontales y menú móvil operativo", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("index.html");

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasHorizontalOverflow).toBe(false);

    const toggle = page.locator("[data-menu-toggle]");
    const mobileMenu = page.locator("#menu-movil");
    await expect(toggle).toBeVisible();
    await expect(mobileMenu).toBeHidden();

    await toggle.click();
    await expect(mobileMenu).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await mobileMenu.locator('a[href="#roi"]').click();
    await expect(mobileMenu).toBeHidden();
  });
});
