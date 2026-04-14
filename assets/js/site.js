const fallbackTemplates = [
  {
    slug: "panaderia",
    name: "Panaderia La Chiquita",
    category: "bakery",
    entry: "templates/panaderia/index.html",
    readme: "templates/panaderia/README.md",
    status: "ready",
  },
  {
    slug: "restaurant",
    name: "Aubergine",
    category: "restaurant",
    entry: "templates/restaurant/index.html",
    readme: "templates/restaurant/README.md",
    status: "ready",
  },
  {
    slug: "gym",
    name: "IRONFORM Gym",
    category: "fitness",
    entry: "templates/gym/index.html",
    readme: "templates/gym/README.md",
    status: "ready",
  },
  {
    slug: "tattoo-studio",
    name: "Sombra Ink",
    category: "tattoo",
    entry: "templates/tattoo-studio/index.html",
    readme: "templates/tattoo-studio/README.md",
    status: "ready",
  },
];

const fallbackShowcase = [
  {
    slug: "panaderia",
    order: 1,
    cover: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Panaderia / catalogo editable",
    summary: "Pagina para mostrar productos del dia, recibir pedidos y responder dudas rapido.",
    angle: "Pensada para vender por WhatsApp y facilitar cambios frecuentes.",
    highlights: [
      "Catalogo con categorias y filtros",
      "Editor central con vista previa en vivo",
      "Botones directos a pedido, mapa y preguntas frecuentes",
    ],
    tags: ["Catalogo", "Pedidos", "WhatsApp"],
    editorDemo: true,
    editorCopy: "Edita textos, imagenes, colores y CTA desde un editor central separado de la plantilla.",
  },
  {
    slug: "restaurant",
    order: 2,
    cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Restaurante / menu y reservas",
    summary: "Pagina para mostrar el lugar, la carta y facilitar reservas.",
    angle: "Busca transmitir confianza y ganas de visitar el sitio.",
    highlights: [
      "Presentacion clara del lugar y la experiencia",
      "Secciones para menu, historia y reservas",
      "Editor central para ajustar mensajes y CTA",
    ],
    tags: ["Menu", "Reservas", "Presentacion"],
    editorDemo: true,
    editorCopy: "Ajusta propuesta, experiencia y reserva desde un editor central separado de la plantilla.",
  },
  {
    slug: "gym",
    order: 3,
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Gimnasio / planes y clases",
    summary: "Pagina comercial para mostrar planes, clases y datos clave.",
    angle: "La idea es explicar rapido la oferta y llevar al contacto.",
    highlights: [
      "Planes y clases en bloques faciles de leer",
      "Secciones para entrenadores, horarios y beneficios",
      "Editor central para promesa, CTA y datos de contacto",
    ],
    tags: ["Planes", "Clases", "Contacto"],
    editorDemo: true,
    editorCopy: "Edita promesa, planes, CTA y datos de contacto desde un editor central reutilizable.",
  },
  {
    slug: "tattoo-studio",
    order: 4,
    cover: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Tattoo / portafolio visual",
    summary: "Sitio para mostrar trabajos, estilo y datos de contacto.",
    angle: "La confianza entra por las piezas publicadas y un contacto claro.",
    highlights: [
      "Galeria de trabajos como pieza principal",
      "Secciones para artistas, cuidados y preguntas comunes",
      "Editor central para mensaje, enlaces e informacion clave",
    ],
    tags: ["Galeria", "Estilo", "Contacto"],
    editorDemo: true,
    editorCopy: "Ajusta mensaje, estilos, CTA y datos clave desde el mismo editor central.",
  },
];

const externalLinkAttrs = 'target="_blank" rel="noopener noreferrer"';

async function fetchJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${path}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(error);
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getEditorHref(entry) {
  const slug = String(entry?.slug || "").trim();
  return slug ? `editor.html?template=${encodeURIComponent(slug)}` : "editor.html";
}

function buildCaseCard(entry, index) {
  const highlights = (entry.highlights || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const tags = (entry.tags || [])
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  const demoHref = entry.entry || "#";
  const notesHref = entry.readme || "#";
  const classes = ["case-card"];

  if (index === 0) {
    classes.push("case-card-featured");
  }

  if (entry.editorDemo) {
    classes.push("case-card-editable");
  }

  return `
    <article class="${classes.join(" ")}" data-reveal>
      <div class="case-media" style="background-image:url('${escapeHtml(entry.cover || "")}')"></div>
      <div class="case-body">
        <div class="case-top">
          <span class="case-kicker">${escapeHtml(entry.eyebrow || entry.category || "")}</span>
          <span class="case-status">${entry.editorDemo ? "Editor disponible" : "Lista para mostrar"}</span>
        </div>
        <div>
          <h3>${escapeHtml(entry.name || "")}</h3>
          <p class="case-summary">${escapeHtml(entry.summary || "")}</p>
        </div>
        <p class="case-angle">${escapeHtml(entry.angle || "")}</p>
        <ul class="case-highlights">${highlights}</ul>
        <div class="case-footer">
          <div class="case-tags">${tags}</div>
          <div class="case-links">
            <a href="${escapeHtml(demoHref)}" ${externalLinkAttrs}>Ver demo</a>
            <a href="${escapeHtml(notesHref)}" ${externalLinkAttrs}>Ver notas</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function buildEditorCard(entry) {
  return `
    <article class="editor-mini-card" data-reveal>
      <small>Editor central</small>
      <h3>${escapeHtml(entry.name || "")}</h3>
      <p>${escapeHtml(entry.editorCopy || entry.summary || "")}</p>
      <div class="case-tags">
        ${(entry.tags || []).map((item) => `<span class="editor-pill">${escapeHtml(item)}</span>`).join("")}
      </div>
      <footer>
        <a href="${escapeHtml(getEditorHref(entry))}" ${externalLinkAttrs}>Abrir editor</a>
      </footer>
    </article>
  `;
}

function revealOnScroll() {
  const nodes = [...document.querySelectorAll("[data-reveal]")];
  if (!nodes.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  nodes.forEach((node) => observer.observe(node));
}

async function renderPortfolio() {
  const [templates, showcase] = await Promise.all([
    fetchJson("catalog/templates.json", fallbackTemplates),
    fetchJson("catalog/showcase.json", fallbackShowcase),
  ]);

  const showcaseBySlug = new Map(showcase.map((item) => [item.slug, item]));
  const merged = templates
    .map((item) => ({ ...item, ...(showcaseBySlug.get(item.slug) || {}) }))
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  const caseGrid = document.getElementById("templateGrid");
  const editorGrid = document.getElementById("editorTemplateGrid");

  if (caseGrid) {
    caseGrid.innerHTML = merged.map((entry, index) => buildCaseCard(entry, index)).join("");
  }

  if (editorGrid) {
    editorGrid.innerHTML = merged.length
      ? merged.map(buildEditorCard).join("")
      : '<article class="editor-mini-card"><h3>Editor en crecimiento</h3><p>Las siguientes demos editables apareceran aqui.</p></article>';
  }

  const yearNode = document.getElementById("footerYear");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  revealOnScroll();
}

renderPortfolio();
