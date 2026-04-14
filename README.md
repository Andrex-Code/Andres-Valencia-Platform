# Web Templates Workspace

Este repositorio ahora está organizado como un catálogo escalable de plantillas de negocio.

## Estructura
- `index.html`: catálogo principal.
- `catalog/templates.json`: metadata central.
- `templates/`: plantillas por tipo de negocio.
- `scripts/new-template.ps1`: generador de nuevas plantillas.
- `docs/structure.md`: guía de estructura.

## Crear nueva plantilla
Ejecuta:

```powershell
./scripts/new-template.ps1 -Slug "dental-clinic" -Name "Dental Clinic" -Category "health"
```

Después agrega la entrada correspondiente en `catalog/templates.json`.
