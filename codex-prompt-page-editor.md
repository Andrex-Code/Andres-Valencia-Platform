# Prompt: Evolucion Del Editor Visual Actual

## Rol
Actua como un senior full-stack engineer enfocado en herramientas visuales para sitios web comerciales.

Tu trabajo no es inventar un producto nuevo desde cero ni proponer una arquitectura ajena al repo.
Tu trabajo es evolucionar el editor actual de este proyecto de forma realista, incremental y compatible
con la forma en que hoy viven las plantillas.

## Objetivo
Construir una version mucho mas solida del editor visual que ya existe en este repo, manteniendo estas reglas:

- Las plantillas siguen siendo HTML reales dentro de `templates/<slug>/index.html`.
- El editor sigue pudiendo abrirse sobre la plantilla real con `?edit=1`.
- El estado sigue pudiendo guardarse localmente por plantilla.
- El sistema debe mejorar seleccion, edicion, consistencia, exportacion y mantenibilidad sin romper el flujo actual.

La meta no es clonar Webflow.
La meta es convertir el editor actual en una herramienta comercial robusta para adaptar y mantener landing pages reales.

## Realidad Del Proyecto Hoy
Antes de escribir codigo, asume esto como verdad del repo:

- `editor.html` es un selector de plantillas, no el canvas editor en si.
- `assets/js/editor-app.js` renderiza el launcher del editor y abre cada plantilla con `?edit=1`.
- `assets/js/universal-template-editor.js` es el editor universal actual.
- Ese editor trabaja directo sobre el DOM real de la plantilla publicada.
- El editor actual detecta elementos clicables, construye un selector CSS unico y guarda patches en `localStorage`.
- La mayor parte de las plantillas nuevas usan `universal-template-editor.js`.
- `templates/panaderia/index.html` todavia tiene un editor mas estructurado y legacy dentro del propio archivo, aunque tambien carga el editor universal.

## Stack Real
No asumas React, Vite, Zustand ni drag-and-drop tipo SaaS salvo que se pida explicitamente una reescritura aparte.

Trabaja con el stack real:

```text
- HTML estatico
- CSS estatico
- JavaScript vanilla modular
- localStorage para persistencia local
- JSON para catalogo y metadatos
- despliegue estatico en Vercel
```

## Fuente De Verdad Actual

```text
editor.html
assets/js/editor-app.js
assets/js/universal-template-editor.js
assets/css/editor-app.css
templates/<slug>/index.html
catalog/templates.json
catalog/showcase.json
```

## Modelo De Datos Actual
El estado minimo del editor hoy debe tratarse como base canonica:

```js
{
  pageTitle: string,
  metaDescription: string,
  customCss: string,
  patches: {
    [selector: string]: {
      textContent?: string,
      href?: string,
      target?: string,
      src?: string,
      alt?: string,
      placeholder?: string,
      value?: string,
      backgroundImage?: string,
      backgroundColor?: string,
      color?: string,
      borderRadius?: string,
      fontSize?: string
    }
  }
}
```

Storage actual:

```text
localStorage key = av-template-editor::<slug>
```

## Enfoque Correcto
La evolucion debe ser incremental y compatible con plantillas reales.

Eso significa:

1. Mejorar el editor universal primero.
2. Crear una capa de configuracion por plantilla cuando haga falta.
3. Migrar gradualmente las plantillas especiales al mismo sistema.
4. Evitar una reescritura total a SPA si no hay una decision explicita de producto para hacerlo.

## Direccion De Arquitectura Recomendada

### Capa 1. Launcher
Responsabilidad:
- listar plantillas editables
- abrir demo y modo edicion
- mostrar metadata comercial

Archivos:
- `editor.html`
- `assets/js/editor-app.js`
- `assets/css/editor-app.css`

### Capa 2. Runtime Del Editor
Responsabilidad:
- detectar elementos editables en el DOM
- seleccionar, resaltar y editar
- persistir patches
- importar, exportar y resetear

Archivo principal:
- `assets/js/universal-template-editor.js`

### Capa 3. Contrato De Plantilla
Responsabilidad:
- definir que tan bien se puede editar una plantilla
- exponer hooks, data attributes o configuracion estructurada

Posibles formas:
- atributos `data-` en elementos clave
- adaptadores por slug
- mapeo opcional de campos estructurados por plantilla

### Capa 4. Legacy Especial
Responsabilidad:
- sostener casos como `templates/panaderia/index.html`
- decidir si se mantienen como experiencia especial o se migran al sistema unificado

## Lo Que Si Debe Mejorarse

### 1. Seleccion Y Overlay
Objetivo:
- mejor hover
- mejor seleccion
- mayor claridad visual
- comportamiento consistente en movil y desktop

Deseable:
- outline consistente
- estado hover mas limpio
- mejor posicionamiento del panel flotante
- excluir mejor elementos no editables o contenedores vacios

### 2. Modelo De Campos
Objetivo:
- pasar de "editar cualquier nodo generico" a "editar contenido con mas intencion"

Fases:
- mantener campos genericos actuales
- agregar definicion estructurada por tipo de elemento
- luego agregar adaptadores por plantilla o por seccion

Ejemplo de futura configuracion:

```js
const templateAdapters = {
  restaurant: {
    page: [...],
    sections: {
      hero: [...],
      reservation: [...]
    }
  }
}
```

### 3. Historial
Objetivo:
- undo / redo reales

No hace falta un command pattern complejo en la primera fase.
Para este repo, lo mas realista es:

- snapshots inmutables del estado del editor
- pila `past`
- estado `present`
- pila `future`
- limite de entradas para no inflar `localStorage`

### 4. Feedback De UI
Objetivo:
- reemplazar friccion y ambiguedad por una experiencia mas profesional

Agregar:
- toasts propios
- estados de guardado
- confirmaciones no bloqueantes
- mensajes de error claros

Evitar:
- `alert()`
- `confirm()` nativos
- depender solo de `console.error`

### 5. Exportacion
Objetivo:
- exportar cambios de forma mas confiable

Minimo viable:
- mantener JSON de estado
- permitir descargar el estado actual de la plantilla

Siguiente paso viable:
- exportar HTML final ya parcheado

Paso mas ambicioso:
- integrar eso con flujo de publicacion o con `studio/`

### 6. Contrato Unificado Para Plantillas
Objetivo:
- que todas las demos nuevas entren con el mismo nivel de editabilidad

Minimo:
- script universal cargado
- slugs consistentes
- selectores mas estables
- secciones importantes con marcas `data-` utiles

Ideal:
- helpers por plantilla
- mapa de campos editables por seccion

## Lo Que No Se Debe Hacer Ahora

- No rehacer el editor completo en React solo porque suena mas moderno.
- No introducir Vite, Zustand o dnd-kit en esta capa sin una decision explicita de producto.
- No romper las plantillas publicas existentes por meter una abstraccion demasiado pesada.
- No mezclar el editor universal con logica comercial del portafolio.
- No duplicar configuracion manual en demasiados archivos si puede vivir en una capa comun.

## Fases De Implementacion Recomendadas

### Fase 1. Endurecer El Editor Universal
- limpiar arquitectura interna de `universal-template-editor.js`
- separar helpers internos por responsabilidad
- mejorar seleccion, hover y panel flotante
- agregar toasts y estados de guardado
- agregar undo / redo basico
- reemplazar `confirm()` por modal propio

### Fase 2. Definir Un Contrato Editable Por Plantilla
- agregar adaptadores por slug
- mapear campos estructurados por seccion
- preferir `data-attributes` estables frente a selectores fragiles
- hacer que el editor use configuracion cuando exista y fallback generico cuando no

### Fase 3. Unificar Experiencias
- revisar `templates/panaderia/index.html`
- decidir si su editor legacy se migra al runtime universal o se mantiene temporalmente
- reducir divergencia entre plantillas

### Fase 4. Exportacion Y Publicacion
- exportar estado y HTML final
- definir como aterriza eso en `studio/` o en una carpeta de deploy
- decidir si la publicacion sigue siendo manual o semiautomatica

### Fase 5. Pulido Comercial
- mejor UI del launcher
- mejor copy dentro del editor
- soporte mejorado para movil
- accesibilidad minima de botones, foco y keyboard shortcuts

## Checklist De Calidad
Antes de considerar una fase como terminada, verificar:

- el editor abre con `?edit=1` sin romper la plantilla
- la demo sigue funcionando sin `?edit=1`
- el estado se guarda por slug
- importar y exportar funcionan
- el overlay no tapa interacciones criticas
- la seleccion no apunta a nodos inestables o imposibles de mantener
- la experiencia movil no queda bloqueada por el panel flotante

## Archivos Que Se Deben Leer Antes De Implementar

```text
editor.html
assets/js/editor-app.js
assets/js/universal-template-editor.js
templates/panaderia/index.html
templates/restaurant/index.html
templates/gym/index.html
templates/tattoo-studio/index.html
templates/civil-engineer/index.html
catalog/templates.json
catalog/showcase.json
```

## Formato Esperado De Las Entregas
Cuando implementes una fase:

1. Resume que parte del flujo actual estas tocando.
2. Explica que compatibilidad preservas.
3. Lista los archivos editados.
4. Indica que limitaciones siguen abiertas.
5. Propone el siguiente paso incremental.

## Viabilidad Real
Este objetivo es viable si se aborda como evolucion del editor actual, no como clon de un page builder SaaS.

### Muy viable
- mejorar overlay, seleccion y bubble UI
- agregar undo / redo
- agregar toast system
- mejorar export / import
- crear adaptadores por plantilla
- unificar mas plantillas bajo el editor universal

### Viable con trabajo medio
- paneles estructurados por seccion
- exportar HTML final parcheado
- puente entre editor y `studio/`
- migrar el caso especial de panaderia al sistema comun

### Poco viable sin cambiar el producto
- drag and drop completo entre bloques arbitrarios
- constructor visual tipo Webflow con canvas y layout engine propio
- editor de layout responsive por breakpoint en tiempo real
- block tree universal con nesting libre en todas las plantillas actuales

## Preguntas Que Se Deben Resolver Antes De Ir Muy Lejos

1. Quieres evolucionar el editor actual o crear un producto nuevo aparte?
2. El objetivo principal es editar copy y assets o tambien reordenar estructura?
3. La publicacion final seguira siendo manual o quieres conectarla con `studio/`?
4. `templates/panaderia` debe quedar como caso especial o lo migramos?
5. Quieres mantener el enfoque "editar sobre la plantilla real" como principio central?

## Instruccion Final
Si vas a implementar mejoras:

- prioriza compatibilidad con el flujo actual
- trabaja primero en `assets/js/universal-template-editor.js`
- no metas una reescritura total salvo solicitud explicita
- documenta cualquier nueva convencion que las plantillas deban cumplir
