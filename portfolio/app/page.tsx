import Image from 'next/image';
import { ArrowUpRight, ArrowDown } from 'lucide-react';
import { projects } from './projects';
import { SocialLinks, whatsapp } from './social-links';

const github = 'https://github.com/Andrex-Code';


export default function Home() {
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="masthead wrap" id="inicio">
      <a className="wordmark" href="#inicio"><Image src="/brand/av-white.svg" width={48} height={30} alt="AV" unoptimized /><span className="wordmark-name">Andrés Valencia</span><span className="window-caption"> / portafolio</span></a>
      <a href={github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={16} /></a>
    </header>
    <nav className="toolbar wrap" aria-label="Accesos del portafolio"><a href="#inicio">Inicio</a><a href="#servicios">Sitios web</a><a href="#proyectos">Mis proyectos</a><a href="#formacion">Formación</a><a href="#contacto">Contacto</a><span className="toolbar-address" aria-hidden="true">andresvalencia.vercel.app</span></nav>
    <main className="wrap" id="contenido">
      <section className="intro" aria-labelledby="intro-title">
        <div className="profile-stamp"><Image src="/brand/av-blue.svg" width={152} height={96} alt="Monograma AV de Andrés Valencia" unoptimized /><span>Andrés Valencia</span><small>Diseño &amp; desarrollo web</small></div><p className="intro-greeting">Hola, soy Andrés.</p><a className="student-line" href="#formacion">Estudiante de Ingeniería de Sistemas y Computación · UTP</a>
        <h1 id="intro-title">Sitios web para <br />presentar tu negocio <br />y conectar con tus clientes<span className="period">.</span></h1>
        <div className="intro-bottom"><p>Diseño y desarrollo sitios web para emprendedores, pequeños y medianos negocios. Tu oferta, tus productos y una forma clara de contactarte, también desde el celular.</p><a className="underlined" href={whatsapp} target="_blank" rel="noreferrer">Hablemos de tu web <ArrowUpRight size={19} /></a></div>
        <SocialLinks /><a className="browse" href="#proyectos">Una selección de mi trabajo <ArrowDown size={17} /></a>
      </section>
      <div className="portfolio-layout">
        <aside className="index"><p>EN ESTA PÁGINA</p><nav aria-label="Navegación principal"><a href="#servicios"><span>01</span> Sitios web</a><a href="#proyectos"><span>02</span> Proyectos</a><a href="#sobre-mi"><span>03</span> Sobre mí</a><a href="#contacto"><span>04</span> Contacto</a></nav></aside>
        <div className="content-column">
          <section id="servicios" aria-labelledby="services-title" className="web-offer">
            <div className="section-label">01 / SITIOS WEB PARA NEGOCIOS</div>
            <h2 id="services-title">Una web pensada para lo que haces</h2>
            <p className="offer-summary">Desde tu primera página hasta un sitio para una empresa que necesita explicar mejor sus servicios. Definimos qué necesita encontrar tu cliente y construimos la web alrededor de eso.</p>
            <div className="niche-list" id="sitios-web">
              <div><h4>Emprendedores y marcas</h4><p>Presenta tu propuesta, muestra tus productos y dirige las consultas a WhatsApp.</p></div>
              <div><h4>Comercios y gastronomía</h4><p>Catálogos o menús, horarios, ubicación y una forma sencilla de preguntar o solicitar un pedido.</p></div>
              <div><h4>Profesionales y servicios</h4><p>Explica qué ofreces, muestra tu trabajo y facilita las solicitudes de información o cotización.</p></div>
              <div><h4>Pequeñas y medianas empresas</h4><p>Un sitio institucional para presentar servicios, áreas de trabajo y canales de contacto.</p></div>
            </div>
            <p className="project-note">Son ejemplos de sitios que podemos construir. El alcance se define según tu negocio.</p>
            <a className="underlined service-cta" href={whatsapp} target="_blank" rel="noreferrer">Cuéntame de tu negocio <ArrowUpRight size={18} /></a>
            <div className="working-method"><h3>Cómo empezamos</h3><ol><li><strong>Conozco tu negocio.</strong> Revisamos público, contenido y objetivo de la web. Acordamos alcance y presupuesto.</li><li><strong>Diseñamos y revisamos.</strong> Organizamos las páginas y probamos una primera versión en escritorio y celular.</li><li><strong>Preparamos la entrega.</strong> Dejamos definidos publicación, accesos, explicación de uso, dominio, alojamiento y mantenimiento.</li></ol><p className="project-note">Contenido, integraciones, costos externos y mantenimiento se acuerdan en la propuesta.</p></div>
            <article className="service"><h3>Si necesitas conectar más cosas</h3><p>También desarrollo automatizaciones de seguimientos y reportes, aplicaciones web y asistentes con IA. Evaluamos estas integraciones según el proceso que quieras resolver.</p></article>
          </section>

          <section id="proyectos" aria-labelledby="projects-title" className="text-section">
            <div className="section-label"><span>02 / TRABAJO SELECCIONADO</span><span>Web · Python · Integraciones</span></div>
            <h2 id="projects-title">Lo que he construido</h2>
            <article className="lead-project">
              <div className="project-heading"><h3>Gestión inmobiliaria</h3><span className="meta">Aplicación web</span></div>
              <p>Una plataforma para organizar inmuebles, inquilinos, contratos y pagos. El panel reúne la información de la operación; el listado permite consultar cada inmueble.</p>
              <figure className="dashboard-shot"><a href="/images/gestion-dashboard.png" target="_blank" rel="noreferrer" aria-label="Abrir captura completa del panel de gestión"><Image src="/images/gestion-dashboard.png" alt="Panel real del proyecto de gestión inmobiliaria con datos de demostración" width={1440} height={900} unoptimized priority /></a><figcaption><span>Panel de control</span><span>Captura real · Datos de demostración</span></figcaption></figure>
              <div className="project-detail-grid"><div><h4>Una segunda vista</h4><p>El mismo proyecto, desde la gestión de inmuebles. Puedes abrir la captura para verla completa.</p><p className="technology">React / TypeScript / PostgreSQL</p></div><figure className="properties-shot"><a href="/images/gestion-inmuebles.png" target="_blank" rel="noreferrer" aria-label="Abrir captura completa de la gestión de inmuebles"><Image src="/images/gestion-inmuebles.png" alt="Listado real de inmuebles del proyecto, con datos de demostración" width={1440} height={2544} unoptimized /></a><figcaption>Gestión de inmuebles ↗</figcaption></figure></div>
            </article>
            <div id="experiencia-operativa" className="project-list">
              {projects.filter(project => project.repo !== 'revision-identidad').map((project, index) => <article className="project-entry" key={project.repo}><span className="entry-number">0{index + 2}</span><div><div className="project-heading"><h3>{project.title}</h3>{project.publicLink ? <a href={`${github}/${project.repo}`} target="_blank" rel="noreferrer" aria-label={`Ver código de ${project.title}`}><ArrowUpRight size={22} /></a> : <span className="meta">Proyecto interno</span>}</div><p>{project.description}</p><p>{project.detail}</p><p className="technology">{project.tags.join(' / ')}</p><p className="project-note">{project.note}</p></div></article>)}
              <article className="project-entry"><span className="entry-number">05</span><div><div className="project-heading"><h3>Asistente de atención</h3><span className="meta">Extensión de navegador</span></div><p>Traducción, transcripción de audio y ayuda para redactar respuestas dentro del flujo de atención. Usa el contexto de la conversación visible; el asesor revisa y decide qué enviar.</p><p className="technology">JavaScript / OpenAI / APIs / Vercel</p><p className="project-note">Proyecto interno · Información de la empresa reservada</p></div></article>
            </div>
            <div className="other-work"><h3>También he trabajado en</h3><p>Flujos y bases de conocimiento para asistentes conversacionales, exportación de conversaciones para auditoría y herramientas de agendas, inventarios y producción.</p><p className="project-note">Los proyectos internos se describen por su función, preservando la información de cada operación.</p></div>
          </section>
          <section id="sobre-mi" aria-labelledby="about-title" className="text-section"><div className="section-label">03 / SOBRE MÍ</div><h2 id="about-title">Del proceso al código</h2><div className="education" id="formacion"><div className="education-bar">FORMACIÓN ACADÉMICA <span>En curso</span></div><div className="education-body"><p className="education-institution">Universidad Tecnológica de Pereira</p><h3>Ingeniería de Sistemas<br />y Computación</h3><p>Estudiante · Pereira, Colombia</p><a href="https://ingenierias.utp.edu.co/ingenieria-en-sistemas/" target="_blank" rel="noreferrer">Conoce mi programa en la UTP <ArrowUpRight size={17} /></a></div></div><p>Soy Andrés Valencia, estudiante de Ingeniería de Sistemas y Computación en la Universidad Tecnológica de Pereira (UTP) y desarrollador. Me interesa el trabajo que hay detrás de una aplicación: quién recibe la información, qué necesita resolver y qué pasos repite todos los días.</p><p>He construido herramientas para procesar archivos, seguir pendientes y conectar información. También diseño sitios web para negocios y desarrollo herramientas con IA cuando el proceso lo necesita.</p><a className="underlined" href={github} target="_blank" rel="noreferrer">Mis repositorios <ArrowUpRight size={18} /></a><div className="skills"><div><h3>Interfaces</h3><p>JavaScript, TypeScript<br />React, Next.js, CSS</p></div><div><h3>Datos y procesos</h3><p>Python, Excel<br />PostgreSQL, Prisma</p></div><div><h3>Integraciones</h3><p>APIs, OpenAI<br />Extensiones de navegador</p></div><div><h3>Entrega</h3><p>Git, GitHub, Vercel<br />Aplicaciones para Windows</p></div></div></section>
          <section id="contacto" className="text-section contact"><div className="section-label">04 / CONTACTO</div><h2>Hablemos del sitio de tu negocio.</h2><p>Cuéntame qué ofreces, a quién quieres llegar y si ya tienes una página web. Puedes escribirme por WhatsApp, correo o Instagram.</p><SocialLinks /></section>
        </div>
      </div>
    </main>
    <footer className="wrap"><span>Andrés Valencia © 2026</span><a href="/brand/av-blue.svg" download="Andres-Valencia-AV.svg">Logo AV ↓</a><a href="#inicio">Volver arriba ↑</a></footer>
  </>;
}
