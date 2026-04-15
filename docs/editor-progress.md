# Editor Progress

## Objetivo
Evolucionar el editor actual hacia una experiencia inline, mobile-first y amable para clientes no tecnicos.

## Principios
- Editar sobre la pagina real.
- Evitar paneles laterales.
- Priorizar movil.
- Mantener compatibilidad con `?edit=1`.
- Guardar estado por plantilla.
- Publicar hitos importantes en GitHub.

## Estado Actual

### Completado
- Se aterrizo la especificacion del editor al stack real del repo en `codex-prompt-page-editor.md`.
- Se definio que la ruta correcta es evolucionar `assets/js/universal-template-editor.js`.
- Se reemplazo el runtime del editor por una base nueva con:
  - toolbar superior mas clara
  - bottom sheet mobile-first
  - undo / redo
  - toasts
  - exportacion JSON
  - exportacion HTML final
  - reset con modal propio
- Se agregaron etiquetas amigables y claves estables en varias plantillas para que la seleccion sea menos tecnica.

### En progreso
- Fase 1: verificacion y ajuste fino del runtime nuevo.
- Fase 2: contrato editable por plantilla.

### Siguiente hito tecnico
- Verificar funcionamiento real en las plantillas principales.
- Mejorar etiquetas, prioridades de seleccion y campos por seccion.
- Empezar adaptadores por slug para que cada vertical exponga controles mas utiles.

## Fases

### Fase 1. Core profesional del editor inline
- refactor de `universal-template-editor.js`
- mejor seleccion
- mejor posicionamiento del editor
- toasts
- undo / redo
- export JSON + export HTML
- reset sin `confirm()`

### Fase 2. Contrato editable por plantilla
- adaptadores por slug
- labels amigables
- secciones editables mas estables

### Fase 3. Unificacion de plantillas
- migrar casos especiales
- reducir divergencia entre plantillas

### Fase 4. Publicacion
- salida lista para deploy
- posible puente con `studio/`

### Fase 5. Pulido UX
- shortcuts
- accesibilidad
- mejor experiencia movil

## Archivos Clave
- `editor.html`
- `assets/js/editor-app.js`
- `assets/js/universal-template-editor.js`
- `codex-prompt-page-editor.md`

## Nota De Continuidad
Si la sesion se corta, retomar por:
1. revisar este archivo
2. abrir `codex-prompt-page-editor.md`
3. seguir en `assets/js/universal-template-editor.js`
