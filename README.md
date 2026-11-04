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
src/input.css           # Tokens de la guía de estilos y componentes (Tailwind)
assets/css/styles.css   # CSS generado (no editar a mano)
assets/js/config.js     # URLs externas (portal de Appsmith)
assets/js/main.js       # Menú móvil y enlaces
assets/js/simulator.js  # Simulador ilustrativo del triaje
assets/img/             # Logo, favicon e imagen para redes sociales
```

## Publicación (GitHub Pages)

Cada push a `main` ejecuta `.github/workflows/deploy-pages.yml`, que compila el CSS y publica el sitio en
https://tracehelp-upc.github.io/tracehelp-landing/

Configuración única del repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Pendiente por tarea del Sprint 1

- T54 (US02): sección `#demo` con el formulario de prueba de concepto.
- T55 (US03): sección `#roi` con la calculadora.
- T56 (US04): sección `#seguridad`, contacto y política de privacidad.
- T57 (US05): sección `#casos` con casos de éxito.
