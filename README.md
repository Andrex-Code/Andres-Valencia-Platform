# Andres Valencia Web Portfolio

Portafolio comercial con demos por industria, un editor visual funcional en la demo de panaderia y una base documentada para evolucionar un studio interno.

## Mapa rapido
- `index.html`: portada publica del portafolio.
- `assets/`: estilos y scripts del sitio principal.
- `catalog/`: inventario y copy de los casos.
- `templates/`: demos publicas por vertical.
- `studio/`: sistema Python versionado como base interna.
- `PROJECT_KNOWLEDGE.md`: documento maestro para no perder contexto.

## Documentos clave
- `PROJECT_KNOWLEDGE.md`
- `docs/DEPLOYMENT.md`
- `docs/REFERENCES.md`
- `docs/structure.md`

## Crear una nueva plantilla
```powershell
./scripts/new-template.ps1 -Slug "dental-clinic" -Name "Dental Clinic" -Category "health"
```

Despues agrega la entrada correspondiente en `catalog/templates.json` y el copy comercial en `catalog/showcase.json`.
