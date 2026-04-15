# Trabajo Local Simple

## Objetivo
Usar el mismo proyecto en casa y en el trabajo sin depender de permisos de administrador.

## Regla principal
Trabaja siempre sobre esta misma carpeta del repo y usa los accesos directos de la raiz.

## Lo que necesitas
- Git para traer y subir cambios.
- Python funcionando de una de estas dos formas:
  - instalado normalmente en el equipo
  - portable dentro de `tools/python/python.exe`

## Abrir el proyecto

### Portafolio publico
Ejecuta:

```text
run-portfolio.cmd
```

Abre:

```text
http://127.0.0.1:4173
```

### Sistema local
Ejecuta:

```text
run-av-system.cmd
```

Abre:

```text
http://127.0.0.1:8765
```

## Moverte entre casa y trabajo
1. Antes de empezar en un equipo, ejecuta `update-from-git.cmd`.
2. Trabaja normalmente.
3. Haz commit y push de tus cambios.
4. En el otro equipo vuelve a ejecutar `update-from-git.cmd`.

## Si en el trabajo no puedes instalar Python
1. En un equipo donde ya funcione Python, prepara una copia portable.
2. Copia esa carpeta dentro del repo en esta ruta:

```text
tools/python/python.exe
```

3. Vuelve a usar los `.cmd` de la raiz.

No hace falta cambiar ningun script.

## Que carpeta editar
- Usa `av-system/` para el sistema local.
- Usa `templates/`, `assets/` y `catalog/` para el portafolio publico.
- No tomes `studio/` como base nueva. Queda solo como referencia legada.
