# Estructura del Proyecto

## Objetivo
Escalar un catálogo de muchas plantillas de negocio sin desordenar la raíz.

## Estructura recomendada
- `index.html`: catálogo principal.
- `catalog/templates.json`: inventario central de plantillas.
- `templates/<slug>/`: una carpeta por plantilla.
- `docs/`: guías de operación.
- `scripts/`: automatizaciones (scaffolding, validaciones, etc.).

## Convención de nombres
- Usar `kebab-case` en slugs de plantilla.
- Ejemplo: `templates/dental-clinic`, `templates/real-estate`, `templates/law-firm`.

## Regla de escalabilidad
Cada plantilla debe incluir mínimo:
- `index.html`
- `README.md`
