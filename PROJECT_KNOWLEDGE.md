# Project Knowledge

## Objetivo
Este repo es el escaparate comercial de Andres Valencia para vender sitios web por categoria de negocio, mostrar demos publicas y dejar trazabilidad tecnica suficiente para futuras iteraciones sin perder contexto.

## Mapa canonico
- `index.html`: portada principal del portafolio.
- `assets/`: CSS y JS del portafolio publico.
- `admin/`: shell principal de AV Studio, protegida por Supabase.
- `assets/js/universal-template-editor.js`: unico motor de edicion para home, plantillas e implementaciones.
- `assets/js/admin/`: capa de acceso, auth y dashboard de AV Studio.
- `catalog/templates.json`: inventario minimo de demos publicas.
- `catalog/showcase.json`: copy comercial y metadatos para renderizar las tarjetas del portafolio.
- `catalog/implementations.json`: casos reales, estado y rutas de admin/live.
- `templates/`: demos publicas por vertical.
- `studio/`: copia versionada del sistema Python interno para operar contenido y explorar un CMS real.
- `docs/`: despliegue, referencias y notas operativas.
- `scripts/`: automatizaciones para scaffolding de nuevas plantillas.

## Legacy local
- `av-system/` sigue existiendo en el workspace como repo anidado legacy y laboratorio local.
- No es la fuente canonica para cambios futuros dentro del repo principal.
- La version que se debe leer y versionar desde ahora es `studio/`.

## Superficies del producto
### 1. Portafolio publico
- Stack: HTML, CSS y JS estaticos.
- Fuente de verdad para tarjetas y textos comerciales: `catalog/templates.json` + `catalog/showcase.json`.
- Despliegue objetivo: Vercel como sitio estatico.

### 2. AV Studio
- Entrada: `admin/index.html`.
- Auth: Supabase (`assets/js/admin/config.js`, `assets/js/admin/supabase-client.js`, `assets/js/admin/auth.js`, `assets/js/admin/gate.js`).
- Shell actual: dashboard con acceso a portafolio, plantillas e implementaciones.
- Regla: la puerta segura es `/admin`; el editor no debe depender de enlaces publicos sin validacion.

### 3. Editor universal
- Canonico: `assets/js/universal-template-editor.js`.
- Sirve para `index.html`, `templates/*` e implementaciones publicadas.
- El launcher flotante solo aparece en plantillas; las implementaciones entran por `/<dominio>/admin`.
- Ya tiene una primera vista integrada `PC / Movil` y una ventana movil rapida.

### 4. Demos publicas
- Cada demo vive en `templates/<slug>/index.html`.
- Todas deben cargar el mismo `assets/js/universal-template-editor.js`.

### 5. Studio interno
- Stack: Python standard library + JSON local.
- Entry points: `studio/app.py` y `studio/export_static.py`.
- Fuente de verdad: `studio/data/businesses.json`.
- Uso actual: laboratorio local y base para evolucionar un CMS multi-negocio.

## Flujo del editor de panaderia
- El archivo contiene el contenido inicial embebido en `initialBusinessData`.
- El editor modifica un `draftBusiness` en memoria.
- Los cambios se guardan localmente en el navegador y se pueden exportar/importar como JSON.
- La demo publica no necesita backend para operar el editor.

## Flujo del studio Python
- `studio/app.py` sirve paginas publicas y vistas admin.
- `studio/data/businesses.json` guarda contenido y credenciales locales.
- `studio/export_static.py` genera una salida publica estatica.
- Riesgo principal: hoy escribe sobre el filesystem local, por eso no es buena idea desplegarlo en Vercel sin migrar persistencia.

## Convenciones
- Slugs en `kebab-case`.
- Cada template debe tener `index.html` y `README.md`.
- Los cambios de contenido comercial del portafolio van a `catalog/showcase.json`, no se repiten a mano en varias partes del HTML.

## Riesgos conocidos
- `studio/data/businesses.json` contiene credenciales de ejemplo: debe endurecerse antes de cualquier exposicion publica real.
- `studio/` no debe desplegarse en Vercel con persistencia local; requiere Blob, Postgres, KV u otro storage duradero.
- `av-system/` puede confundir porque sigue presente como carpeta legacy local.

## Regla para cambios futuros
- Si el cambio afecta marketing y demos publicas: trabajar en `index.html`, `assets/`, `catalog/` y `templates/`.
- Si el cambio afecta el acceso, dashboard o permisos del editor: trabajar en `admin/` y `assets/js/admin/`.
- Si el cambio afecta la experiencia de edicion: trabajar en `assets/js/universal-template-editor.js`.
- Si el cambio afecta operacion multi-negocio o admin local legacy: trabajar en `studio/`.
- No reconstruir contenido comercial en varios sitios si puede vivir en JSON o en documentacion central.
