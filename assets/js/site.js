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
    eyebrow: "Catalogo editable / retail local",
    summary: "Storefront artesanal para mostrar productos del dia, resolver dudas y mandar pedidos a WhatsApp con la menor friccion posible.",
    angle: "Pensado para negocios que viven de frecuencia, antojo y rapidez: primero vende, luego adorna.",
    highlights: [
      "Busqueda, filtros y vitrina por categorias",
      "Editor visual con guardado local, importacion y exportacion JSON",
      "CTA directos a pedido, mapa y FAQ",
    ],
    tags: ["Editable", "WhatsApp", "Catalogo"],
    editorDemo: true,
    editorCopy: "La demo ideal para mostrar el producto-editor desde el mismo portafolio.",
  },
  {
    slug: "restaurant",
    order: 2,
    cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Editorial hospitality / premium dining",
    summary: "Direccion visual tipo magazine para restaurantes donde el prestigio depende de atmosfera, tono y presentacion.",
    angle: "La venta pasa por deseo y posicionamiento; el sitio necesita parecer una marca, no un menu en linea barato.",
    highlights: [
      "Hero editorial partido en dos",
      "Jerarquia tipografica para marca y menu",
      "Reservas y storytelling como piezas centrales",
    ],
    tags: ["High-end", "Editorial", "Storytelling"],
    editorDemo: false,
  },
  {
    slug: "gym",
    order: 3,
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Lead generation / premium fitness",
    summary: "Una propuesta de gimnasio premium que se siente marca y no folleto de clases.",
    angle: "La prioridad es deseo aspiracional, claridad comercial y una energia visual que siembre membresia.",
    highlights: [
      "Direccion dark-luxury con jerarquia agresiva",
      "Planes, clases y entrenadores con estructura comercial",
      "Ritmo visual para pantallas grandes y mobile",
    ],
    tags: ["Fitness", "Brand-heavy", "Leads"],
    editorDemo: false,
  },
  {
    slug: "tattoo-studio",
    order: 4,
    cover: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Subculture branding / contacto directo",
    summary: "Sitio de alto contraste para un estudio de tatuajes que necesita parecer deseable y facil de contactar.",
    angle: "No vende funcionalidad solamente; vende identidad, estilo y confianza en el trabajo del estudio.",
    highlights: [
      "Portafolio visual con CTA claros",
      "Composicion intensa y tono de marca coherente",
      "WhatsApp como cierre principal",
    ],
    tags: ["Tattoo", "Impacto visual", "Contacto"],
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

function buildCaseCard(entry) {
  const highlights = (entry.highlights || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const tags = (entry.tags || [])
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  const demoHref = entry.entry || "#";
  const notesHref = entry.readme || "#";

  return `
    <article class="case-card" data-reveal>
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
    caseGrid.innerHTML = merged.map(buildCaseCard).join("");
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
