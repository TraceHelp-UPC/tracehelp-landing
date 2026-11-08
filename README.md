# TraceHelp Landing Page

Sitio público de TraceHelp (HTML5, Tailwind CSS v4 y JavaScript).

## Desarrollo

```bash
npm install
npm run dev      # recompila assets/css/styles.css al guardar cambios
```

Abre `index.html` en el navegador (o usa la extensión Live Server de VS Code).

Antes de hacer commit ejecuta `npm run build` para generar el CSS minificado.

## Estructura

```
index.html              # Página principal
privacidad.html         # Política de privacidad (US04)
src/input.css           # Tokens de la guía de estilos y componentes (Tailwind)
assets/css/styles.css   # CSS generado (no editar a mano)
assets/js/config.js     # URLs externas (portal de Appsmith) y canales de contacto del pie de página
assets/js/main.js       # Menú móvil y enlaces
assets/js/simulator.js  # Simulador ilustrativo del triaje
assets/js/demo-form.js  # Validación y envío del formulario de prueba (Formspree)
assets/js/success-cases-data.js  # Contenido de los casos de éxito (editar aquí al publicar casos reales)
assets/js/success-cases.js       # Banner, tarjetas y video de los casos de éxito (US05)
assets/js/roi-calculator.js  # Calculadora de ROI en el navegador (US03)
assets/img/             # Logo, favicon e imagen para redes sociales
```

## Publicación (GitHub Pages)

Cada push a `main` ejecuta `.github/workflows/deploy-pages.yml`, que compila el CSS y publica el sitio en
https://tracehelp-upc.github.io/tracehelp-landing/

Configuración única del repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Pruebas de Aceptación (Playwright · T58 / US05)

La suite automatizada en `tests/landing.spec.js` verifica:
- Carga de todas las secciones de la portada (`#inicio`, `#capacidades`, `#roi`, `#seguridad`, `#casos`, `#nosotros`, `#demo`).
- Enlace del botón **Iniciar sesión** hacia `APP_LOGIN_URL` configurado en `assets/js/config.js`.
- Validaciones en el navegador y flujo de envío del formulario de prueba de concepto (US02).
- Resultados exactos de la calculadora de ROI (`window.TraceHelpRoi.calculateMonthlyRoi`), traslado al formulario de prueba y validaciones (US03).
- Tarjetas de casos de éxito y mensaje de recurso no disponible cuando un video no tiene fuente (US05).
- Enlaces institucionales y navegación a la Política de Privacidad `privacidad.html` (US04).
- Vista móvil (`375x812`) sin desbordamiento horizontal y apertura/cierre del menú móvil.

### Cómo ejecutar las pruebas

```bash
# 1. Instalar dependencias y el navegador Chromium de Playwright (solo la primera vez)
npm install
npx playwright install chromium

# 2. Ejecutar las pruebas levantando el servidor local automáticamente
npm test

# 3. (Opcional) Ejecutar contra la landing publicada en GitHub Pages
npm run test:live
```

