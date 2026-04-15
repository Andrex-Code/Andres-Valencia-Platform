# AV System (MVP propio)

Sistema base para manejar varios negocios desde un solo panel.

## Que incluye
- Paginas publicas por negocio (`/site/<slug>`)
- Panel de administracion (`/admin`)
- Edicion de texto, direccion, horario, WhatsApp, productos/servicios y precios
- Datos guardados en `data/businesses.json`
- CRUD de productos: crear, editar, eliminar, categoria, estado y orden
- Roles de acceso:
  - Dueno: edita todos los negocios
  - Cliente: edita solo su negocio

## Como ejecutarlo
1. Abre terminal en `av-system`
2. Ejecuta:

```powershell
python app.py
```

3. Abre en navegador:
- Inicio: `http://127.0.0.1:8765/`
- Admin dueno: `http://127.0.0.1:8765/login`
- Admin cliente: `http://127.0.0.1:8765/client-login`

## Credenciales locales
Antes de usar el panel, define credenciales propias en `data/businesses.json`.

- Admin general: `admin.owner_password`
- Cliente por negocio: `client_password`

Recomendacion: usa claves distintas por negocio y no las subas al repositorio.

## Donde editar credenciales
- Archivo: `data/businesses.json`
- Admin general: `admin.owner_password`
- Cliente por negocio: `client_password` dentro de cada negocio

## Estructura
- `app.py`: servidor + sitio publico + panel admin
- `data/businesses.json`: contenido editable y accesos
- `README.md`: guia de uso
- `export_static.py`: genera una version publica lista para Vercel
- `deploy/panaderia-la-chiquita/`: salida publica para subir o desplegar

## Negocios cargados
- Panaderia Belalcazar
- Psicologia en Manizales
- Ingenieria Civil Caldas

La panaderia ya tiene pagina comercial completa:
- Hero con CTA a WhatsApp
- Sobre nosotros
- Productos destacados
- Catalogo por categorias
- Contacto y ubicacion
- Preguntas frecuentes
- Footer

## Publicar la panaderia en linea
Si quieres desplegar solo la pagina publica de `Panaderia La Chiquita`, usa esta exportacion:

1. Genera la carpeta publica:

```powershell
python export_static.py
```

2. Se crea:

```text
deploy/panaderia-la-chiquita/
```

3. Esa carpeta queda lista para:
- subirla a GitHub
- conectarla a Vercel como proyecto estatico
- ver la panaderia online sin depender del panel admin

Nota:
- El editor visual y el backend siguen funcionando localmente en `app.py`
- La version de `deploy/panaderia-la-chiquita` es la pagina publica para mostrar online

## Proximo paso recomendado
Agregar recuperacion de contrasena y registrar cambios por usuario.
