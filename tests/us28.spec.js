// Pruebas básicas de US28 (T113): confianza en la landing. T114 las completará.
const { test, expect } = require("@playwright/test");

test.describe("TraceHelp Landing — US28 mejoras de confianza (T113)", () => {
  test("8. Comparación antes/después del enmascarado PII con texto alternativo", async ({ page }) => {
    await page.goto("index.html");
    const before = page.locator('img[data-pii="antes"]');
    const after = page.locator('img[data-pii="despues"]');
    await before.scrollIntoViewIfNeeded();
    await after.scrollIntoViewIfNeeded();
    await expect(before).toBeVisible();
    await expect(after).toBeVisible();
    await expect(before).toHaveAttribute("alt", /ficticia/);
    await expect(after).toHaveAttribute("alt", /etiquetas/);
    await expect
      .poll(() => page.evaluate(() => [...document.querySelectorAll("img[data-pii]")].every((i) => i.complete && i.naturalWidth > 0)))
      .toBe(true);
  });

  test("9. Preguntas frecuentes de seguridad se abren con teclado y muestran su respuesta", async ({ page }) => {
    await page.goto("index.html");
    const items = page.locator("[data-faq-seguridad] details");
    await expect(items).toHaveCount(5);
    await expect(page.locator("#faq-seguridad")).toContainText("Información de referencia del proyecto académico TraceHelp (UPC)");
    await expect(page.locator("#faq-seguridad")).not.toContainText("[confirmar]");
    for (let i = 0; i < 5; i++) {
      const item = items.nth(i);
      await item.scrollIntoViewIfNeeded();
      await item.locator("summary").focus();
      await page.keyboard.press("Enter");
      await expect(item).toHaveJSProperty("open", true);
      await expect(item.locator("p").first()).toBeVisible();
    }
    await expect(items.nth(4).locator('a[href="privacidad.html"]')).toBeVisible();
  });

  test("10. Calculadora con supuestos editables: cambia el ahorro, restablece y valida", async ({ page }) => {
    await page.goto("index.html");
    await page.fill("#roi-tickets", "1000");
    await page.fill("#roi-analysts", "5");
    const monthly = page.locator('[data-roi-output="monthlySavings"]');
    const baseline = await monthly.textContent();
    expect(baseline.replace(/\D/g, "")).toBe("8000");

    await page.locator("summary", { hasText: "Supuestos del cálculo" }).click();
    await page.fill("#roi-cost-l1", "32");
    // 400 * (32 - 2) = 12000
    await expect(monthly).toContainText("12");
    expect((await monthly.textContent()).replace(/\D/g, "")).toBe("12000");

    await page.selectOption("#roi-currency", "PEN");
    await expect(monthly).toContainText("S/");

    // Validaciones: vacío, negativo y autoservicio >= L1
    await page.fill("#roi-cost-l1", "");
    await expect(page.locator('[data-roi-error-for="roi-cost-l1"]')).toContainText("Ingresa");
    await page.fill("#roi-cost-l1", "-5");
    await expect(page.locator('[data-roi-error-for="roi-cost-l1"]')).toContainText("mayor que cero");
    await page.fill("#roi-cost-l1", "2");
    await expect(page.locator('[data-roi-error-for="roi-cost-self"]')).toContainText("menor");

    await page.click("[data-roi-reset]");
    await expect(page.locator("#roi-cost-l1")).toHaveValue("22");
    await expect(page.locator("#roi-cost-self")).toHaveValue("2");
    await expect(page.locator("#roi-currency")).toHaveValue("USD");
    expect((await monthly.textContent()).replace(/\D/g, "")).toBe("8000");
    expect(await monthly.textContent()).toBe(baseline);
  });
});
