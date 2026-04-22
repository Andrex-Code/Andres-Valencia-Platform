# Catalogo

Este directorio separa el portafolio en tres capas:

- `templates.json`: plantillas reutilizables.
- `showcase.json`: metadata visual y comercial de cada plantilla.
- `implementations.json`: casos reales o implementaciones basadas en una plantilla.

Reglas de mantenimiento:

- Mantener `slug` estable y compartido entre archivos relacionados.
- Mantener `order` explicito para controlar el orden de la home y del editor.
- Ordenar los arreglos por `order` de menor a mayor.
- No mezclar una implementacion real dentro de `templates.json`.
- Si una implementacion usa una plantilla base, referenciarla con `templateEntry`.

