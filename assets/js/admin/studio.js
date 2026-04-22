(function (global) {
  "use strict";

  const fallbackTemplates = [
    {
      slug: "health-consultation",
      name: "Health Consultation",
      category: "health",
      family: "salud-consulta",
      entry: "templates/health-consultation/index.html",
      status: "ready",
      order: 1,
    },
    {
      slug: "panaderia",
      name: "Casa Horno",
      category: "food-local",
      family: "comida-local",
      entry: "templates/panaderia/index.html",
      status: "ready",
      order: 2,
    },
    {
      slug: "professional-services",
      name: "Professional Services",
      category: "professional-services",
      family: "servicios-profesionales",
      entry: "templates/professional-services/index.html",
      status: "ready",
      order: 3,
    },
    {
      slug: "restaurant",
      name: "Aubergine",
      category: "food-local",
      family: "comida-local",
      entry: "templates/restaurant/index.html",
      status: "ready",
      order: 4,
    },
    {
      slug: "gym",
      name: "IRONFORM Gym",
      category: "fitness",
      family: "bienestar",
      entry: "templates/gym/index.html",
      status: "ready",
      order: 5,
    },
    {
      slug: "tattoo-studio",
      name: "Sombra Ink",
      category: "creative",
      family: "marca-visual",
      entry: "templates/tattoo-studio/index.html",
      status: "ready",
      order: 6,
    },
  ];

  const fallbackImplementations = [
    {
      slug: "monica-valencia",
      name: "Monica Valencia H.",
      category: "psychology",
      entry: "https://monica-valencia.vercel.app/",
      statusLabel: "Implementado",
      state: "live",
      order: 1,
    },
    {
      slug: "mario-valencia",
      name: "Mario Valencia",
      category: "engineering",
      entry: "https://mario-valencia.vercel.app/",
      adminUrl: "https://mario-valencia.vercel.app/admin/",
      statusLabel: "En implementacion",
      state: "progress",
      order: 2,
    },
    {
      slug: "panaderia-la-chiquita",
      name: "Panaderia La Chiquita",
      category: "bakery",
      entry: "https://la-chiquita.vercel.app/",
      adminUrl: "https://la-chiquita.vercel.app/admin/",
      statusLabel: "Implementado",
      state: "live",
      order: 3,
    },
  ];

  const fallbackShowcase = [
    {
      slug: "health-consultation",
      eyebrow: "Salud / psicologia y consulta",
      summary: "Base para psicologia, salud y bienestar con una landing calmada, confiable y lista para contacto.",
      tags: ["Salud", "Consulta", "Confianza"],
    },
    {
      slug: "panaderia",
      eyebrow: "Comida local / panaderia y catalogo",
      summary: "Plantilla para panaderias, cafes y negocios de comida local con productos, horarios y pedidos.",
      tags: ["Comida local", "Catalogo", "WhatsApp"],
    },
    {
      slug: "professional-services",
      eyebrow: "Servicios profesionales / consultoria",
      summary: "Base premium para ingenieros, consultores y servicios profesionales.",
      tags: ["Servicios", "Consultoria", "Confianza"],
    },
    {
      slug: "restaurant",
      eyebrow: "Comida local / restaurante",
      summary: "Pagina para restaurantes, cafes y propuestas gastronomicas que muestran experiencia y reservas.",
      tags: ["Restaurante", "Cafe", "Reservas"],
    },
    {
      slug: "gym",
      eyebrow: "Bienestar / gimnasio",
      summary: "Pagina comercial para mostrar planes, clases y datos clave de bienestar.",
      tags: ["Fitness", "Planes", "Contacto"],
    },
    {
      slug: "tattoo-studio",
      eyebrow: "Marca visual / tattoo",
      summary: "Sitio para mostrar trabajos, estilo y datos de contacto con enfoque visual.",
      tags: ["Galeria", "Estilo", "Contacto"],
    },
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function fetchJson(path, fallback) {
    try {
      const response = await fetch(path, { credentials: "same-origin" });
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${path}`);
      }
      return await response.json();
    } catch (error) {
      console.warn("[AVAdminStudio]", error.message);
      return fallback;
    }
  }

  function normalizeUrl(input, fallback) {
    try {
      return new URL(input || fallback, window.location.origin).toString();
    } catch (_) {
      return new URL(fallback, window.location.origin).toString();
    }
  }

  function toEditUrl(entryUrl) {
    const url = new URL(entryUrl, window.location.origin);
    url.searchParams.set("edit", "1");
    return url.toString();
  }

  function resolveImplementationEditUrl(item) {
    if (item.adminUrl) {
      return normalizeUrl(item.adminUrl, item.entry || "/");
    }
    return toEditUrl(item.entry || "/");
  }

  function statusTone(state) {
    switch (state) {
      case "live":
        return "success";
      case "progress":
        return "warning";
      case "paused":
        return "muted";
      default:
        return "info";
    }
  }

  function countFamilies(list) {
    return new Set(list.map((item) => item.family).filter(Boolean)).size;
  }

  function buildStat(label, value, hint) {
    return `
      <article class="av-studio-stat-card">
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(value)}</strong>
        <p>${escapeHtml(hint)}</p>
      </article>
    `;
  }

  function buildTemplateCard(item) {
    return `
      <article class="av-studio-entity-card">
        <div class="av-studio-entity-head">
          <div>
            <small>${escapeHtml(item.eyebrow || item.category || "Plantilla")}</small>
            <h3>${escapeHtml(item.name || item.slug)}</h3>
          </div>
          <span class="av-studio-pill" data-tone="${escapeHtml(statusTone(item.status || "ready"))}">${escapeHtml(item.status || "ready")}</span>
        </div>
        <p>${escapeHtml(item.summary || "Base reusable lista para editar desde el motor universal.")}</p>
        <div class="av-studio-tag-list">${(item.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="av-studio-card-actions">
          <a href="${escapeHtml(toEditUrl(item.entry || "/"))}" target="_blank" rel="noopener noreferrer">Editar</a>
          <a href="${escapeHtml(normalizeUrl(item.entry, "/"))}" target="_blank" rel="noopener noreferrer">Ver demo</a>
        </div>
      </article>
    `;
  }

  function buildImplementationCard(item) {
    return `
      <article class="av-studio-entity-card">
        <div class="av-studio-entity-head">
          <div>
            <small>${escapeHtml(item.eyebrow || item.category || "Implementacion")}</small>
            <h3>${escapeHtml(item.name || item.slug)}</h3>
          </div>
          <span class="av-studio-pill" data-tone="${escapeHtml(statusTone(item.state || ""))}">${escapeHtml(item.statusLabel || item.state || "Activo")}</span>
        </div>
        <p>${escapeHtml(item.summary || "Caso real derivado de una base del portafolio.")}</p>
        <div class="av-studio-tag-list">${(item.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
        <div class="av-studio-card-actions">
          <a href="${escapeHtml(resolveImplementationEditUrl(item))}" target="_blank" rel="noopener noreferrer">Abrir admin</a>
          <a href="${escapeHtml(normalizeUrl(item.entry, "/"))}" target="_blank" rel="noopener noreferrer">Ver sitio</a>
        </div>
      </article>
    `;
  }

  function buildCollectionRoadmap() {
    const items = [
      {
        title: "Proyectos",
        copy: "Para ingenieros, arquitectos y consultores: proyectos subidos, estado, ciudad, alcance, imagenes y ficha tecnica.",
      },
      {
        title: "Productos e inventario",
        copy: "Para panaderias, restaurantes y tiendas: productos, precio, stock, categorias, destacados y disponibilidad.",
      },
      {
        title: "Servicios",
        copy: "Para profesionales: servicios, modalidad, precio orientativo, CTA principal y prioridad comercial.",
      },
      {
        title: "Galerias y testimonios",
        copy: "Para marcas visuales: portafolio, casos, reseñas y pruebas de confianza editables sin tocar codigo.",
      },
    ];

    return items
      .map(
        (item) => `
          <article class="av-studio-roadmap-card">
            <small>Coleccion universal</small>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.copy)}</p>
          </article>
        `
      )
      .join("");
  }

  function buildAppShell(data, ctx) {
    const { templates, implementations, showcase } = data;
    const showcaseBySlug = new Map(showcase.map((item) => [item.slug, item]));
    const enrichedTemplates = templates
      .map((item) => ({ ...item, ...(showcaseBySlug.get(item.slug) || {}) }))
      .sort((a, b) => (a.order || 99) - (b.order || 99));
    const sortedImplementations = [...implementations].sort((a, b) => (a.order || 99) - (b.order || 99));
    const liveImplementations = sortedImplementations.filter((item) => item.state === "live").length;
    const quickDate = new Intl.DateTimeFormat("es-CO", { dateStyle: "long" }).format(new Date());

    document.body.innerHTML = `
      <main class="av-studio-shell">
        <section class="av-studio-hero">
          <div class="av-studio-hero-copy">
            <span class="av-studio-kicker">AV Studio / control central</span>
            <h1>Administra portafolio, plantillas e implementaciones desde una sola entrada.</h1>
            <p>
              Esta es la primera shell real del sistema: acceso con Supabase, rutas claras al editor universal,
              lectura del catalogo vivo y una base lista para crecer hacia colecciones, inventario y proyectos.
            </p>
            <div class="av-studio-hero-actions">
              <a href="/?edit=1" target="_blank" rel="noopener noreferrer">Editar portafolio</a>
              <a href="/" target="_blank" rel="noopener noreferrer" data-ghost="true">Ver sitio publico</a>
              <button type="button" id="avStudioLogout">Cerrar sesion</button>
            </div>
          </div>

          <aside class="av-studio-hero-aside">
            <article class="av-studio-profile-card">
              <small>Sesion activa</small>
              <strong>${escapeHtml(ctx.user?.email || "Admin")}</strong>
              <p>${escapeHtml(quickDate)}</p>
            </article>
            <div class="av-studio-stat-grid">
              ${buildStat("Plantillas", String(enrichedTemplates.length).padStart(2, "0"), "bases reutilizables disponibles")}
              ${buildStat("Implementaciones", String(sortedImplementations.length).padStart(2, "0"), "casos reales y en progreso")}
              ${buildStat("Familias", String(countFamilies(enrichedTemplates)).padStart(2, "0"), "grupos comerciales activos")}
              ${buildStat("Live", String(liveImplementations).padStart(2, "0"), "sitios listos para mostrar")}
            </div>
          </aside>
        </section>

        <section class="av-studio-panel-grid">
          <article class="av-studio-panel-card">
            <div class="av-studio-panel-head">
              <small>Entrada principal</small>
              <h2>Portafolio central</h2>
            </div>
            <p>Desde aqui abres el home en modo edicion y sigues refinando la oferta comercial del sistema.</p>
            <div class="av-studio-card-actions">
              <a href="/?edit=1" target="_blank" rel="noopener noreferrer">Abrir editor</a>
              <a href="/" target="_blank" rel="noopener noreferrer">Ver home</a>
            </div>
          </article>

          <article class="av-studio-panel-card">
            <div class="av-studio-panel-head">
              <small>Vision del producto</small>
              <h2>Proximo salto</h2>
            </div>
            <p>
              El siguiente bloque del sistema es llevar el editor a colecciones universales: proyectos, inventario,
              servicios, galerias y testimonios con estados, orden y publicacion.
            </p>
            <ul class="av-studio-list">
              <li>Modo rapido para clientes no tecnicos.</li>
              <li>Modo profesional para estructura, SEO y bloques.</li>
              <li>Vista PC y movil dentro del editor.</li>
            </ul>
          </article>

          <article class="av-studio-panel-card">
            <div class="av-studio-panel-head">
              <small>Uso recomendado</small>
              <h2>PC para editar, celular para revisar</h2>
            </div>
            <p>
              El sistema ya esta pensado para ambos, pero la construccion fina conviene hacerla en PC.
              El cliente puede revisar, ajustar y validar desde el celular sin entrar en una interfaz pesada.
            </p>
          </article>
        </section>

        <section class="av-studio-section">
          <div class="av-studio-section-head">
            <small>Plantillas</small>
            <h2>Bases listas para abrir con el editor universal</h2>
          </div>
          <div class="av-studio-card-grid">
            ${enrichedTemplates.map(buildTemplateCard).join("")}
          </div>
        </section>

        <section class="av-studio-section">
          <div class="av-studio-section-head">
            <small>Implementaciones</small>
            <h2>Casos reales, con acceso directo a admin cuando existe</h2>
          </div>
          <div class="av-studio-card-grid">
            ${sortedImplementations.map(buildImplementationCard).join("")}
          </div>
        </section>

        <section class="av-studio-section">
          <div class="av-studio-section-head">
            <small>Roadmap activo</small>
            <h2>Colecciones universales que vuelven este editor un sistema real</h2>
          </div>
          <div class="av-studio-roadmap-grid">
            ${buildCollectionRoadmap()}
          </div>
        </section>
      </main>
    `;

    document.getElementById("avStudioLogout")?.addEventListener("click", async () => {
      await ctx.logout();
      window.location.replace("/admin/?reason=signin");
    });
  }

  async function mount(ctx) {
    const [templates, implementations, showcase] = await Promise.all([
      fetchJson("/catalog/templates.json", fallbackTemplates),
      fetchJson("/catalog/implementations.json", fallbackImplementations),
      fetchJson("/catalog/showcase.json", fallbackShowcase),
    ]);

    buildAppShell({ templates, implementations, showcase }, ctx);
    ctx.setStatus?.({
      tone: "success",
      text: "Sesion validada. AV Studio listo.",
    });
  }

  global.AVAdminStudio = {
    mount,
  };
})(window);
