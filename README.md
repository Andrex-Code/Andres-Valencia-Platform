# Andrés Valencia Portfolio

Landing personal para presentar mi perfil como programador y los tipos de soluciones que construyo.

## Enfoque actual

Este repositorio queda simplificado como un sitio estático de portafolio. La versión anterior mezclaba portafolio, editor visual, demos por industria y una idea de CMS; eso hacía difícil entender el objetivo principal.

Ahora la prioridad es clara:

- presentar quién soy como programador;
- explicar qué tipo de soluciones desarrollo;
- mostrar casos generales sin exponer información privada;
- dar a entender que también construyo sitios, landings y productos web;
- servir como página principal para GitHub y Vercel.

## Qué comunica la landing

La página se centra en cuatro líneas de trabajo:

1. **Asistentes de conocimiento interno con IA**  
   Aplicaciones donde se cargan documentos, se estructura información y se consulta mediante IA con contexto.

2. **Plataformas de seguimiento operativo**  
   Sistemas para registrar incidencias, mejoras, prioridades, estados, usuarios e historial.

3. **Automatización de reportes y procesos**  
   Herramientas para procesar Excel, CSV, TXT y generar reportes o archivos finales con reglas de negocio.

4. **Productos web y experiencias digitales**  
   Frontends, dashboards, landings y sitios comerciales cuando el proyecto lo requiere.

## Stack mencionado

- JavaScript
- TypeScript
- React
- Next.js
- Python
- FastAPI
- OpenAI
- PostgreSQL
- Prisma
- Vercel
- GitHub
- Automatización de Excel y reportes

## Estructura principal

```text
Andres-Valencia-Platform/
├── index.html        # landing principal del portafolio
├── README.md         # resumen del objetivo actual
├── assets/           # recursos antiguos o reutilizables
├── admin/            # legado del intento de editor/CMS
├── catalog/          # legado de demos comerciales
├── docs/             # documentación histórica
├── scripts/          # automatizaciones antiguas
└── templates/        # demos comerciales antiguas
```

## Estado del repo

El portafolio principal vive en `index.html` y no depende del editor anterior.

Las carpetas como `admin/`, `catalog/`, `templates/`, `studio/` o `av-system/` pueden servir como referencia histórica, pero no son necesarias para la nueva landing. La recomendación es reconstruir cualquier editor o CMS desde cero en otro repo o en una rama separada, con objetivos más claros.

## Despliegue

El proyecto puede desplegarse como sitio estático en Vercel sin build step especial.

Configuración sugerida:

- Framework preset: `Other`
- Build command: vacío
- Output directory: raíz del proyecto

## Nota de privacidad

Algunos casos descritos en el portafolio vienen de proyectos privados. Se explican de forma general para mostrar el tipo de solución desarrollada sin mencionar nombres, datos operativos ni información sensible.
