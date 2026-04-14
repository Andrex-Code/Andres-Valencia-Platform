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
      "Editor para cambiar contenido desde el navegador",
      "Botones directos a pedido, mapa y preguntas frecuentes",
    ],
    tags: ["Catalogo", "Pedidos", "WhatsApp"],
    editorDemo: true,
    editorCopy: "Aqui ya puedes cambiar contenido de verdad sin tocar codigo.",
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
    editorDemo: false,
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
      "Botones de contacto visibles desde el inicio",
    ],
    tags: ["Planes", "Clases", "Contacto"],
    editorDemo: false,
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
      "WhatsApp como contacto principal",
    ],
    tags: ["Galeria", "Estilo", "Contacto"],
    editorDemo: false,
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

function getEditorSelectorHref(entry) {
  const slug = String(entry?.slug || "").trim();
  return slug ? `editor.html#${encodeURIComponent(slug)}` : "editor.html";
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
          <span class="case-status">${entry.editorDemo ? "Se puede editar" : "Lista para mostrar"}</span>
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
  const helperCopy = entry.editorDemo
    ? entry.editorCopy || entry.summary || ""
    : "Abre esta demo desde una pagina aparte para revisarla sin salir del portafolio.";

  return `
    <article class="editor-mini-card" data-reveal>
      <small>${escapeHtml(entry.editorDemo ? "Editor visual listo" : "Elegir demo")}</small>
      <h3>${escapeHtml(entry.name || "")}</h3>
      <p>${escapeHtml(helperCopy)}</p>
      <div class="case-tags">
        ${(entry.tags || []).map((item) => `<span class="editor-pill">${escapeHtml(item)}</span>`).join("")}
      </div>
      <footer>
        <a href="${escapeHtml(getEditorSelectorHref(entry))}" ${externalLinkAttrs}>Abrir selector</a>
      </footer>
    </article>
  `;
}

function buildEditorSelectionCard(entry, index) {
  const highlights = (entry.highlights || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const tags = (entry.tags || [])
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  const demoHref = entry.entry || "#";
  const notesHref = entry.readme || "#";
  const classes = ["case-card", "selection-card"];

  if (index === 0) {
    classes.push("case-card-featured");
  }

  if (entry.editorDemo) {
    classes.push("case-card-editable");
  }

  return `
    <article class="${classes.join(" ")}" data-reveal data-editor-slug="${escapeHtml(entry.slug || "")}">
      <div class="case-media" style="background-image:url('${escapeHtml(entry.cover || "")}')"></div>
      <div class="case-body">
        <div class="case-top">
          <span class="case-kicker">${escapeHtml(entry.eyebrow || entry.category || "")}</span>
          <span class="case-status">${entry.editorDemo ? "Editor visual listo" : "Base lista para trabajar"}</span>
        </div>
        <div>
          <h3>${escapeHtml(entry.name || "")}</h3>
          <p class="case-summary">${escapeHtml(entry.summary || "")}</p>
        </div>
        <p class="case-angle">${escapeHtml(
          entry.editorDemo
            ? entry.editorCopy || entry.angle || ""
            : "Se abre por separado para revisarla y seguir llevando este mismo flujo al resto del catalogo."
        )}</p>
        <ul class="case-highlights">${highlights}</ul>
        <div class="case-footer">
          <div class="case-tags">${tags}</div>
          <div class="case-links">
            <a href="${escapeHtml(demoHref)}" ${externalLinkAttrs}>${entry.editorDemo ? "Abrir editor" : "Abrir demo"}</a>
            <a href="${escapeHtml(notesHref)}" ${externalLinkAttrs}>Ver notas</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function highlightSelectedEditorCard() {
  const slug = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!slug) {
    return;
  }

  const cards = [...document.querySelectorAll("[data-editor-slug]")];
  const selected = cards.find((card) => card.dataset.editorSlug === slug);

  if (!selected) {
    return;
  }

  selected.classList.add("is-selected");
  selected.scrollIntoView({ behavior: "smooth", block: "center" });
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

async function loadPortfolioEntries() {
  const [templates, showcase] = await Promise.all([
    fetchJson("catalog/templates.json", fallbackTemplates),
    fetchJson("catalog/showcase.json", fallbackShowcase),
  ]);

  const showcaseBySlug = new Map(showcase.map((item) => [item.slug, item]));
  const merged = templates
    .map((item) => ({ ...item, ...(showcaseBySlug.get(item.slug) || {}) }))
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  return merged;
}

function renderFooterYear() {
  const yearNode = document.getElementById("footerYear");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
}

function renderPortfolioPage(merged) {
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
}

function renderEditorPage(merged) {
  const editorPageGrid = document.getElementById("editorPageGrid");

  if (!editorPageGrid) {
    return;
  }

  editorPageGrid.innerHTML = merged.length
    ? merged.map((entry, index) => buildEditorSelectionCard(entry, index)).join("")
    : '<article class="case-loading">No se encontraron demos para mostrar.</article>';
  highlightSelectedEditorCard();
}

async function renderPortfolio() {
  const merged = await loadPortfolioEntries();
  renderPortfolioPage(merged);
  renderEditorPage(merged);
  renderFooterYear();
  revealOnScroll();
}

renderPortfolio();
