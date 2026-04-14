# Deployment Notes

## Portafolio publico
Este repo se publica como sitio estatico.

### GitHub
1. Confirmar estado con `git status`.
2. Hacer commit desde la raiz del repo principal.
3. Empujar a `origin`.

### Vercel
1. La raiz del proyecto es este repo principal.
2. El portafolio no necesita build step.
3. El despliegue puede hacerse con `vercel --prod` o conectando el repo en Vercel para publicar en cada push.

## Studio interno
`studio/` no se despliega junto al portafolio publico en la arquitectura actual.

### Por que
- El sistema hoy guarda cambios en `studio/data/businesses.json`.
- Tambien contempla subidas locales de archivos.
- Vercel es excelente para frontends estaticos y funciones serverless, pero esta capa necesita storage duradero para operar bien.

### Que haria falta para desplegarlo bien
- Mover contenido persistente a una base de datos o KV.
- Mover imagenes a Blob o storage equivalente.
- Reemplazar las escrituras locales del filesystem por llamadas a storage duradero.

## Ejecucion local del studio
```powershell
cd studio
python app.py
```

## Exportacion estatica desde el studio
```powershell
cd studio
python export_static.py
```
