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
    eyebrow: "Panaderia / editor activo",
    summary: "Catalogo ligero para panaderias y negocios de mostrador que venden por rotacion diaria y pedidos rapidos.",
    angle: "La prioridad es mostrar producto, despejar dudas en segundos y llevar el pedido a WhatsApp sin pasos de sobra.",
    highlights: [
      "Busqueda y filtros por categoria",
      "Editor visual con guardado local e importacion y exportacion JSON",
      "Mapa, FAQ y CTA directos a pedido",
    ],
    tags: ["Editable", "Retail local", "WhatsApp"],
    editorDemo: true,
    editorCopy: "La demo donde ya se ve el producto real: editar contenido sin tocar la estructura.",
  },
  {
    slug: "restaurant",
    order: 2,
    cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Restaurante / editorial",
    summary: "Propuesta para restaurantes que necesitan transmitir atmosfera, carta y nivel de servicio desde la primera pantalla.",
    angle: "La web no compite por tener mas widgets; compite por percepcion, tono y deseo de reserva.",
    highlights: [
      "Jerarquia tipografica de corte editorial",
      "Bloques para menu, historia y reservas",
      "Ritmo visual sobrio para desktop y mobile",
    ],
    tags: ["Editorial", "Reservas", "Servicio"],
    editorDemo: false,
  },
  {
    slug: "gym",
    order: 3,
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Fitness / captacion",
    summary: "Landing comercial para gimnasios y estudios que venden membresia, autoridad y energia de marca.",
    angle: "Todo el sistema visual empuja claridad de oferta, aspiracion y cierre rapido.",
    highlights: [
      "Hero de marca con tono premium",
      "Planes, clases y entrenadores con lectura clara",
      "CTA enfocados a captar prospectos",
    ],
    tags: ["Fitness", "Captacion", "Marca"],
    editorDemo: false,
  },
  {
    slug: "tattoo-studio",
    order: 4,
    cover: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Tattoo / portafolio",
    summary: "Portafolio directo para estudios que viven de estilo, prueba visual y confianza en el trabajo.",
    angle: "Aqui la marca no se explica con discursos largos; se demuestra con tono, composicion y contacto inmediato.",
    highlights: [
      "Galeria visual como prueba principal",
      "Contraste alto y tono de marca consistente",
      "WhatsApp como cierre dominante",
    ],
    tags: ["Tattoo", "Portafolio", "Contacto"],
    editorDemo: false,
  },
];

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
          <span class="case-status">${entry.editorDemo ? "Editor activo" : "Demo lista"}</span>
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
            <a href="${escapeHtml(demoHref)}">Ver demo</a>
            <a href="${escapeHtml(notesHref)}">Leer concepto</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function buildEditorCard(entry) {
  return `
    <article class="editor-mini-card" data-reveal>
      <small>${escapeHtml(entry.eyebrow || "Editor demo")}</small>
      <h3>${escapeHtml(entry.name || "")}</h3>
      <p>${escapeHtml(entry.editorCopy || entry.summary || "")}</p>
      <div class="case-tags">
        ${(entry.tags || []).map((item) => `<span class="editor-pill">${escapeHtml(item)}</span>`).join("")}
      </div>
      <footer>
        <a href="${escapeHtml(entry.entry || "#")}">Abrir demo editable</a>
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
    const editable = merged.filter((item) => item.editorDemo);
    editorGrid.innerHTML = editable.length
      ? editable.map(buildEditorCard).join("")
      : '<article class="editor-mini-card"><h3>Editor en expansion</h3><p>Las siguientes demos editables viviran aqui.</p></article>';
  }

  const yearNode = document.getElementById("footerYear");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  revealOnScroll();
}

renderPortfolio();
