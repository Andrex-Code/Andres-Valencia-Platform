import { Mail, Camera, MessageCircle } from 'lucide-react';

export const whatsapp = 'https://wa.me/573007561667?text=Hola%20Andr%C3%A9s%2C%20quiero%20un%20sitio%20web%20para%20mi%20negocio.';

export function SocialLinks() {
  return <nav className="social-links" aria-label="Contactar a Andrés">
    <a href={whatsapp} target="_blank" rel="noreferrer"><span className="social-icon whatsapp"><MessageCircle size={25} aria-hidden="true" /></span><span><strong>WhatsApp</strong><small>300 756 1667</small></span></a>
    <a href="mailto:pipevv999@gmail.com"><span className="social-icon email"><Mail size={25} aria-hidden="true" /></span><span><strong>Correo</strong><small>pipevv999@gmail.com</small></span></a>
    <a href="https://www.instagram.com/andres_fv9/" target="_blank" rel="noreferrer"><span className="social-icon instagram"><Camera size={25} aria-hidden="true" /></span><span><strong>Instagram</strong><small>@andres_fv9</small></span></a>
  </nav>;
}

