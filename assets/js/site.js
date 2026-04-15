const fallbackTemplates = [
  {
    slug: "civil-engineer",
    name: "Strata Civil",
    category: "engineering",
    entry: "templates/civil-engineer/index.html",
    readme: "templates/civil-engineer/README.md",
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
    slug: "panaderia",
    name: "Casa Horno",
    category: "bakery",
    entry: "templates/panaderia/index.html",
    readme: "templates/panaderia/README.md",
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
    slug: "civil-engineer",
    order: 1,
    cover: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Ingenieria civil / consultoria tecnica",
    summary:
      "Plantilla premium para firmas o especialistas que necesitan mostrar servicios, metodologia, proyectos y una imagen profesional.",
    angle:
      "Pensada para transmitir criterio tecnico, confianza y capacidad real de acompanamiento.",
    highlights: [
      "Bloques para servicios, sectores, proyectos y metodologia",
      "Direccion visual sobria para consultoria, supervision y obra",
      "Editor central compatible para ajustar copy, imagenes y CTA",
    ],
    tags: ["Infraestructura", "Consultoria", "Proyectos"],
    editorDemo: true,
    editorCopy:
      "Edita propuesta, servicios, proyectos y cierre comercial desde el editor central.",
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
      "Diseno limpio para celular y escritorio",
    ],
    tags: ["Menu", "Reservas", "Presentacion"],
    editorDemo: true,
    editorCopy:
      "Ajusta propuesta, experiencia y reserva desde un editor central separado de la plantilla.",
  },
  {
    slug: "panaderia",
    order: 3,
    cover: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Panaderia / catalogo editable",
    summary:
      "Plantilla para mostrar productos del dia, recibir pedidos y responder dudas rapido.",
    angle:
      "Pensada para negocios locales que necesitan vitrina, horarios y WhatsApp visibles.",
    highlights: [
      "Catalogo con categorias y filtros",
      "Editor para cambiar contenido desde el navegador",
      "Botones directos a pedido, mapa y preguntas frecuentes",
    ],
    tags: ["Catalogo", "Pedidos", "WhatsApp"],
    editorDemo: true,
    editorCopy:
      "Edita textos, imagenes, colores y CTA desde un editor central separado de la plantilla.",
  },
  {
    slug: "gym",
    order: 4,
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Gimnasio / planes y clases",
    summary: "Pagina comercial para mostrar planes, clases y datos clave.",
    angle: "La idea es explicar rapido la oferta y llevar al contacto.",
    highlights: [
      "Planes y clases en bloques faciles de leer",
      "Secciones para entrenadores, horarios y beneficios",
      "Botones de contacto visibles desde el inicio",
    ],
    tags: ["Planes", "Clases", "Contacto"],
    editorDemo: true,
    editorCopy:
      "Edita promesa, planes, CTA y datos de contacto desde un editor central reutilizable.",
  },
  {
    slug: "tattoo-studio",
    order: 5,
    cover: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Tattoo / portafolio visual",
    summary: "Sitio para mostrar trabajos, estilo y datos de contacto.",
    angle: "La confianza entra por las piezas publicadas y un contacto claro.",
    highlights: [
      "Galeria de trabajos como pieza principal",
      "Secciones para artistas, cuidados y preguntas comunes",
      "WhatsApp como contacto principal",
    ],
    tags: ["Galeria", "Estilo", "Contacto"],
    editorDemo: true,
    editorCopy:
      "Ajusta mensaje, estilos, CTA y datos clave desde el mismo editor central.",
  },
];

const fallbackImplementations = [
  {
    slug: "mario-valencia",
    order: 1,
    name: "Mario Valencia",
    category: "engineering",
    entry: "av-system/deploy/mario-valencia/index.html",
    templateEntry: "templates/civil-engineer/index.html",
    cover: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Geotecnia / pagina en implementacion",
    summary:
      "Landing para ingeniero civil especialista en geotecnia, con una direccion visual mas editorial y tecnica.",
    angle:
      "Sirve para mostrar que una base sectorial puede convertirse en una marca personal con identidad propia.",
    highlights: [
      "Narrativa enfocada en consultoria, estudios y confianza tecnica",
      "Estilo distinto al resto del portafolio para evitar soluciones repetidas",
      "Pensada para clientes de obra, consultoria e infraestructura",
    ],
    tags: ["Geotecnia", "Marca personal", "Consultoria"],
    statusLabel: "En implementacion",
    state: "progress",
  },
  {
    slug: "panaderia-la-chiquita",
    order: 2,
    name: "Panaderia La Chiquita",
    category: "bakery",
    entry: "av-system/deploy/panaderia-la-chiquita/index.html",
    templateEntry: "templates/panaderia/index.html",
    cover: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Panaderia local / adaptacion real",
    summary:
      "Version implementada a partir de la base para panaderias, aterrizada a catalogo, productos y contacto directo por WhatsApp.",
    angle:
      "Muestra como una plantilla base se convierte en una pagina concreta para un negocio local.",
    highlights: [
      "Contenido real de productos, horarios y pedido rapido",
      "Estructura afinada para negocio de vitrina y encargos",
      "Separada de la plantilla base para no mezclar demo con caso aplicado",
    ],
    tags: ["Caso real", "Catalogo", "WhatsApp"],
    statusLabel: "Implementado",
    state: "live",
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

function formatCount(value) {
  return String(value ?? 0).padStart(2, "0");
}

function getEditorHref(entry) {
  const slug = String(entry?.slug || "").trim();
  return slug ? `editor.html?template=${encodeURIComponent(slug)}` : "editor.html";
}

function getLiveEditHref(entry) {
  const demoHref = String(entry?.entry || "").trim();
  if (!demoHref) {
    return "#";
  }

  return demoHref.includes("?") ? `${demoHref}&edit=1` : `${demoHref}?edit=1`;
}

function getStatusLabel(entry, kind) {
  if (entry?.statusLabel) {
    return entry.statusLabel;
  }

  if (kind === "implementation") {
    return entry?.state === "live" ? "Implementado" : "En implementacion";
  }

  return entry?.editorDemo ? "Plantilla editable" : "Plantilla lista";
}

function getStatusClass(entry, kind) {
  if (kind === "implementation") {
    return entry?.state === "live" ? "case-status-live" : "case-status-progress";
  }

  return "case-status-template";
}

function buildTemplateLinks(entry) {
  const links = [
    `<a href="${escapeHtml(entry.entry || "#")}" ${externalLinkAttrs}>Ver demo</a>`,
    `<a href="${escapeHtml(getLiveEditHref(entry))}" ${externalLinkAttrs}>Editar</a>`,
  ];

  if (entry.readme) {
    links.push(`<a href="${escapeHtml(entry.readme)}" ${externalLinkAttrs}>Ver notas</a>`);
  }

  return links.join("");
}

function buildImplementationLinks(entry) {
  const links = [
    `<a href="${escapeHtml(entry.entry || "#")}" ${externalLinkAttrs}>Ver sitio</a>`,
  ];

  if (entry.templateEntry) {
    links.push(
      `<a href="${escapeHtml(entry.templateEntry)}" ${externalLinkAttrs}>Ver plantilla base</a>`
    );
  }

  return links.join("");
}

function buildCaseCard(entry, index, kind = "template") {
  const highlights = (entry.highlights || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const tags = (entry.tags || [])
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  const classes = ["case-card"];

  if (index === 0) {
    classes.push("case-card-featured");
  }

  if (kind === "implementation") {
    classes.push("case-card-implementation");
    classes.push(entry.state === "live" ? "case-card-live" : "case-card-progress");
  } else if (entry.editorDemo) {
    classes.push("case-card-editable");
  }

  const linksHtml =
    kind === "implementation" ? buildImplementationLinks(entry) : buildTemplateLinks(entry);

  return `
    <article class="${classes.join(" ")}" data-reveal>
      <div class="case-media" style="background-image:url('${escapeHtml(entry.cover || "")}')"></div>
      <div class="case-body">
        <div class="case-top">
          <span class="case-kicker">${escapeHtml(entry.eyebrow || entry.category || "")}</span>
          <span class="case-status ${getStatusClass(entry, kind)}">${escapeHtml(getStatusLabel(entry, kind))}</span>
        </div>
        <div>
          <h3>${escapeHtml(entry.name || "")}</h3>
          <p class="case-summary">${escapeHtml(entry.summary || "")}</p>
        </div>
        <p class="case-angle">${escapeHtml(entry.angle || "")}</p>
        <ul class="case-highlights">${highlights}</ul>
        <div class="case-footer">
          <div class="case-tags">${tags}</div>
          <div class="case-links">${linksHtml}</div>
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
        ${(entry.tags || [])
          .map((item) => `<span class="editor-pill">${escapeHtml(item)}</span>`)
          .join("")}
      </div>
      <footer>
        <a href="${escapeHtml(getEditorHref(entry))}" ${externalLinkAttrs}>Elegir plantilla</a>
        <a href="${escapeHtml(getLiveEditHref(entry))}" ${externalLinkAttrs}>Editar ahora</a>
      </footer>
    </article>
  `;
}

function setNodeText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value;
  }
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
  const [templates, showcase, implementations] = await Promise.all([
    fetchJson("catalog/templates.json", fallbackTemplates),
    fetchJson("catalog/showcase.json", fallbackShowcase),
    fetchJson("catalog/implementations.json", fallbackImplementations),
  ]);

  const showcaseBySlug = new Map(showcase.map((item) => [item.slug, item]));
  const mergedTemplates = templates
    .map((item) => ({ ...item, ...(showcaseBySlug.get(item.slug) || {}) }))
    .sort((a, b) => (a.order || 99) - (b.order || 99));
  const mergedImplementations = [...implementations].sort(
    (a, b) => (a.order || 99) - (b.order || 99)
  );

  const templateGrid = document.getElementById("templateGrid");
  const implementationGrid = document.getElementById("implementationGrid");
  const editorGrid = document.getElementById("editorTemplateGrid");

  if (templateGrid) {
    templateGrid.innerHTML = mergedTemplates.length
      ? mergedTemplates.map((entry, index) => buildCaseCard(entry, index, "template")).join("")
      : '<article class="case-loading">Aun no hay plantillas cargadas.</article>';
  }

  if (implementationGrid) {
    implementationGrid.innerHTML = mergedImplementations.length
      ? mergedImplementations
          .map((entry, index) => buildCaseCard(entry, index, "implementation"))
          .join("")
      : '<article class="case-loading">Las implementaciones apareceran aqui.</article>';
  }

  if (editorGrid) {
    editorGrid.innerHTML = mergedTemplates.length
      ? mergedTemplates.map(buildEditorCard).join("")
      : '<article class="editor-mini-card"><h3>Editor en crecimiento</h3><p>Las siguientes demos editables apareceran aqui.</p></article>';
  }

  setNodeText("heroTemplateCount", formatCount(mergedTemplates.length));
  setNodeText("heroImplementationCount", formatCount(mergedImplementations.length));
  setNodeText(
    "heroEditorCount",
    formatCount(mergedTemplates.filter((entry) => entry.editorDemo).length)
  );

  const yearNode = document.getElementById("footerYear");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  revealOnScroll();
}

renderPortfolio();
