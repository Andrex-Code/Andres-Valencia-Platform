# Andres Valencia Web Portfolio

Portafolio comercial con demos por industria, editor visual inline y un sistema local para administrar negocios sin depender de instalaciones complejas.

## Que carpeta usamos de verdad
- `av-system/`: sistema activo para trabajar localmente.
- `studio/`: referencia legada. No es la carpeta principal para seguir construyendo.
- `index.html`, `assets/`, `templates/`, `catalog/`: portafolio publico y demos estaticas.

## Arranque rapido

### Abrir el portafolio
Haz doble clic en:

```text
run-portfolio.cmd
```

Luego abre:

```text
http://127.0.0.1:4173
```

### Abrir AV System
Haz doble clic en:

```text
run-av-system.cmd
```

Luego abre:

```text
http://127.0.0.1:8765
```

### Exportar una version publica
Haz doble clic en:

```text
export-av-system.cmd
```

## Como usarlo en casa y en el trabajo
1. En un equipo haces cambios y los subes a Git.
2. En el otro equipo abres esta misma carpeta y ejecutas:

```text
update-from-git.cmd
```

3. Trabajas normalmente con `run-portfolio.cmd` o `run-av-system.cmd`.

## Python sin permisos de administrador
Los scripts buscan Python en este orden:
1. `tools/python/python.exe`
2. `python`
3. `py`

Si en tu trabajo no puedes instalar Python, copia una version portable dentro de:

```text
tools/python/python.exe
```

Con eso los `.cmd` siguen funcionando igual.

## Mapa rapido
- `assets/`: estilos y scripts del sitio principal.
- `catalog/`: inventario y copy comercial.
- `templates/`: demos publicas por vertical.
- `av-system/`: panel local y paginas por negocio.
- `scripts/`: automatizaciones para arrancar, exportar y actualizar.
- `tools/`: utilidades portables no versionadas.
- `PROJECT_KNOWLEDGE.md`: contexto del proyecto.

## Documentos clave
- `PROJECT_KNOWLEDGE.md`
- `docs/DEPLOYMENT.md`
- `docs/LOCAL_SETUP.md`
- `docs/REFERENCES.md`
- `docs/structure.md`

## Crear una nueva plantilla
```powershell
./scripts/new-template.ps1 -Slug "dental-clinic" -Name "Dental Clinic" -Category "health"
```

Despues agrega la entrada correspondiente en `catalog/templates.json` y el copy comercial en `catalog/showcase.json`.
