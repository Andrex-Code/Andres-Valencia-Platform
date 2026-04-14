# Panaderia Web - Documento de Proyecto

## 1) Referencias consultadas
- Raices Bakery (ejemplo de tono y oferta de panaderia colombiana): https://raicesbakery.com/inicio
- Google Ads Help - Create an effective mobile site (enfoque mobile y conversion local): https://support.google.com/google-ads/answer/2549057?hl=en
- Google Search Central - Mobile-first indexing best practices: https://developers.google.com/webmasters/mobile-sites/

## 2) Patrones aplicados para pyme local
- Hero con propuesta de valor clara y CTA principal a WhatsApp.
- Informacion de contacto visible (direccion, ciudad y horario).
- Catalogo simple y escaneable por categorias.
- Boton de "Como llegar" para reducir friccion local.
- FAQ para resolver objeciones comunes antes de escribir.
- Diseno limpio y rapido para movil (cliente local primero).

## 3) Stack elegida y justificacion
- Python + servidor HTTP nativo + HTML/CSS/JS + JSON.

Por que esta stack:
- Facil de mantener para emprendimiento pequeno.
- Sin pagos mensuales por CMS externo.
- Despliegue simple en VPS propio.
- Permite escalar luego a base de datos sin reescribir todo.

## 4) Entregables implementados
- Front publico para panaderia con secciones comerciales completas.
- Panel admin con login por roles (dueno y cliente).
- CRUD de productos con categoria, estado y orden.
- Persistencia en `data/businesses.json`.

## 5) Fase 2 recomendada
- Cambiar contrasenas desde el panel (sin editar JSON).
- Historial de cambios (quien edito y cuando).
- Subida de imagen por producto.
- Editor de FAQ desde el panel.
- Publicacion en dominio propio + SSL + copias de seguridad.
