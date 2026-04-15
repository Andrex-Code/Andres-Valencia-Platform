# Studio Interno

Base local legacy para manejar varios negocios desde un solo panel.

## Estado
`av-system/` es la carpeta activa del proyecto.

Usa `studio/` solo como referencia historica o para comparar cambios viejos. No la tomes como base principal para nuevas ediciones.

## Que incluye
- Paginas publicas por negocio (`/site/<slug>`)
- Panel de administracion (`/admin`)
- Edicion de texto, direccion, horario, WhatsApp, productos o servicios y precios
- Datos guardados en `data/businesses.json`
- CRUD de productos con categoria, estado y orden

## Como ejecutarlo
1. Abre terminal en `studio`
2. Ejecuta:

```powershell
python app.py
```

3. Abre en navegador:
- Inicio: `http://127.0.0.1:8765/`
- Admin dueno: `http://127.0.0.1:8765/login`
- Admin cliente: `http://127.0.0.1:8765/client-login`

## Credenciales actuales
- Admin general: `andres2026`
- Panaderia Belalcazar: `pan12345`
- Psicologia en Manizales: `psi12345`
- Ingenieria Civil Caldas: `civil12345`

Cambialas antes de usar esto en un entorno serio.

## Archivos importantes
- `app.py`: servidor y panel admin
- `export_static.py`: exportacion estatica
- `data/businesses.json`: contenido y accesos
- `docs/panaderia-proyecto.md`: notas del caso de panaderia

## Nota de arquitectura
No despliegues este studio con persistencia local sobre Vercel en su estado actual. Primero mueve datos e imagenes a storage duradero.
