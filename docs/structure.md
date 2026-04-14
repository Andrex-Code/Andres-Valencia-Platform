# Estructura del Proyecto

## Objetivo
Separar con claridad la capa comercial publica de la capa de studio interno para que el portafolio pueda crecer sin desorden.

## Estructura actual
- `index.html`: portada principal del portafolio.
- `assets/`: estilos y scripts del sitio publico.
- `catalog/templates.json`: inventario base de demos.
- `catalog/showcase.json`: copy comercial y metadata de las tarjetas del portafolio.
- `templates/<slug>/`: demos publicas por vertical.
- `studio/`: sistema Python interno para admin, exportacion estatica y exploracion CMS.
- `docs/`: documentacion operativa y referencias.
- `scripts/`: automatizaciones para crear nuevas plantillas.

## Convenciones
- Slugs en `kebab-case`.
- Cada template debe incluir como minimo `index.html` y `README.md`.
- El contenido del portafolio se centraliza en `catalog/`, no se duplica manualmente en varias zonas.

## Regla operativa
- Cambios de marketing, narrativa y demos publicas: `index.html`, `assets/`, `catalog/`, `templates/`.
- Cambios del studio interno o admin multi-negocio: `studio/`.
