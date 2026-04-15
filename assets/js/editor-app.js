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
    slug: "panaderia",
    name: "Casa Horno",
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
    slug: "civil-engineer",
    order: 1,
    cover: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Ingenieria civil / consultoria tecnica",
    summary: "Plantilla premium para especialistas o firmas que necesitan verse solidos, tecnicos y confiables.",
    angle: "Pensada para transmitir criterio tecnico, experiencia y claridad comercial.",
    tags: ["Infraestructura", "Consultoria", "Proyectos"],
    editorCopy: "Editor visual para tocar servicios, metodologia, proyectos y CTA directamente sobre la pagina.",
  },
  {
    slug: "panaderia",
    order: 2,
    cover: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Panaderia / catalogo editable",
    summary: "Plantilla para mostrar productos del dia, recibir pedidos y responder dudas rapido.",
    angle: "Pensada para negocios locales que necesitan vitrina, horarios y WhatsApp visibles.",
    tags: ["Catalogo", "Pedidos", "WhatsApp"],
    editorCopy: "Editor visual sobre la plantilla real para cambiar texto, CTA y presentacion.",
  },
  {
    slug: "restaurant",
    order: 3,
    cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Restaurante / menu y reservas",
    summary: "Pagina para mostrar el lugar, la carta y facilitar reservas.",
    angle: "Busca transmitir confianza y ganas de visitar el sitio.",
    tags: ["Menu", "Reservas", "Presentacion"],
    editorCopy: "Editor visual para tocar mensaje, secciones, enlaces e imagenes desde la propia demo.",
  },
  {
    slug: "gym",
    order: 4,
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Gimnasio / planes y clases",
    summary: "Pagina comercial para mostrar planes, clases y datos clave.",
    angle: "La idea es explicar rapido la oferta y llevar al contacto.",
    tags: ["Planes", "Clases", "Contacto"],
    editorCopy: "Editor visual para ajustar promesa, CTA, planes y datos clave donde haces clic.",
  },
  {
    slug: "tattoo-studio",
    order: 5,
    cover: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Tattoo / portafolio visual",
    summary: "Sitio para mostrar trabajos, estilo y datos de contacto.",
    angle: "La confianza entra por las piezas publicadas y un contacto claro.",
    tags: ["Galeria", "Estilo", "Contacto"],
    editorCopy: "Editor visual para cambiar piezas, textos y CTA sin depender de una barra lateral.",
  },
];

const dom = {
  grid: document.getElementById("editorLauncherGrid"),
  title: document.getElementById("editorLauncherTitle"),
  description: document.getElementById("editorLauncherDescription"),
  editLink: document.getElementById("editorLauncherEdit"),
  viewLink: document.getElementById("editorLauncherView"),
  status: document.getElementById("editorLauncherStatus"),
  footerYear: document.getElementById("footerYear"),
};

let entries = [];
let activeSlug = "";

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

function getPreviewHref(entry) {
  return entry?.entry || "#";
}

function getEditHref(entry) {
  const previewHref = getPreviewHref(entry);
  if (!previewHref || previewHref === "#") {
    return "#";
  }

  return previewHref.includes("?") ? `${previewHref}&edit=1` : `${previewHref}?edit=1`;
}

function updateUrl(slug) {
  const url = new URL(window.location.href);
  url.searchParams.set("template", slug);
  window.history.replaceState({}, "", url);
}

function renderFocus(entry) {
  if (!entry) {
    return;
  }

  dom.title.textContent = entry.name || "Selecciona una plantilla";
  dom.description.textContent =
    entry.editorCopy ||
    entry.angle ||
    "Se abrira otra pestana con la plantilla lista para editar sobre la demo real.";
  dom.editLink.href = getEditHref(entry);
  dom.viewLink.href = getPreviewHref(entry);
  dom.status.textContent =
    "Haz clic en cualquier bloque cuando se abra la demo y las opciones apareceran junto al elemento seleccionado.";
}

function buildCard(entry) {
  const isActive = entry.slug === activeSlug;
  const tagList = (entry.tags || [])
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");

  return `
    <article class="editor-launcher-card${isActive ? " is-active" : ""}" data-template-card="${escapeHtml(entry.slug)}">
      <div class="editor-launcher-card-cover" style="background-image:url('${escapeHtml(entry.cover || "")}')"></div>
      <div class="editor-launcher-card-top">
        <small>${escapeHtml(entry.eyebrow || entry.category || "Demo web")}</small>
        <span>${isActive ? "Seleccionada" : "Lista para editar"}</span>
      </div>
      <div>
        <h3>${escapeHtml(entry.name || "")}</h3>
        <p>${escapeHtml(entry.summary || "")}</p>
      </div>
      <p>${escapeHtml(entry.editorCopy || entry.angle || "")}</p>
      <div class="editor-launcher-card-tags">${tagList}</div>
      <div class="editor-launcher-card-actions">
        <a href="${escapeHtml(getEditHref(entry))}" target="_blank" rel="noopener noreferrer">Editar</a>
        <a href="${escapeHtml(getPreviewHref(entry))}" target="_blank" rel="noopener noreferrer">Ver demo</a>
        <button type="button" data-select-template="${escapeHtml(entry.slug)}">Seleccionar aqui</button>
      </div>
    </article>
  `;
}

function renderGrid() {
  if (!dom.grid) {
    return;
  }

  if (!entries.length) {
    dom.grid.innerHTML = '<article class="editor-launcher-card is-loading">No hay demos listas para editar.</article>';
    return;
  }

  dom.grid.innerHTML = entries.map(buildCard).join("");
}

function setActiveTemplate(slug) {
  const nextEntry = entries.find((entry) => entry.slug === slug) || entries[0];
  if (!nextEntry) {
    return;
  }

  activeSlug = nextEntry.slug;
  updateUrl(activeSlug);
  renderFocus(nextEntry);
  renderGrid();
}

function attachEvents() {
  dom.grid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-template]");
    const card = event.target.closest("[data-template-card]");
    const slug = button?.dataset.selectTemplate || card?.dataset.templateCard;

    if (!slug) {
      return;
    }

    if (button) {
      event.preventDefault();
    }

    setActiveTemplate(slug);
  });
}

async function init() {
  const [templates, showcase] = await Promise.all([
    fetchJson("catalog/templates.json", fallbackTemplates),
    fetchJson("catalog/showcase.json", fallbackShowcase),
  ]);

  const showcaseBySlug = new Map(showcase.map((item) => [item.slug, item]));
  entries = templates
    .map((template) => ({ ...template, ...(showcaseBySlug.get(template.slug) || {}) }))
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  if (dom.footerYear) {
    dom.footerYear.textContent = new Date().getFullYear();
  }

  attachEvents();
  setActiveTemplate(new URL(window.location.href).searchParams.get("template") || entries[0]?.slug || "");
}

init();
