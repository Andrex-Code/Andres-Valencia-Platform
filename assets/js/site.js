const fallbackTemplates = [
  {
    slug: "professional-services",
    name: "Vertex Pro",
    category: "professional-services",
    entry: "templates/professional-services/index.html",
    readme: "templates/professional-services/README.md",
    status: "ready",
    order: 1,
  },
  {
    slug: "health-consultation",
    name: "Health Consultation",
    category: "health",
    entry: "templates/health-consultation/index.html",
    readme: "templates/health-consultation/README.md",
    status: "ready",
    order: 2,
  },
  {
    slug: "panaderia",
    name: "Casa Horno",
    category: "food-local",
    entry: "templates/panaderia/index.html",
    readme: "templates/panaderia/README.md",
    status: "ready",
    order: 3,
  },
  {
    slug: "restaurant",
    name: "Aubergine",
    category: "food-local",
    entry: "templates/restaurant/index.html",
    readme: "templates/restaurant/README.md",
    status: "ready",
    order: 4,
  },
  {
    slug: "gym",
    name: "IRONFORM Gym",
    category: "fitness",
    entry: "templates/gym/index.html",
    readme: "templates/gym/README.md",
    status: "ready",
    order: 5,
  },
  {
    slug: "civil-engineer",
    name: "Strata Civil",
    category: "engineering",
    entry: "templates/civil-engineer/index.html",
    readme: "templates/civil-engineer/README.md",
    status: "ready",
    order: 6,
  },
  {
    slug: "tattoo-studio",
    name: "Sombra Ink",
    category: "creative",
    entry: "templates/tattoo-studio/index.html",
    readme: "templates/tattoo-studio/README.md",
    status: "ready",
    order: 7,
  },
];

const fallbackShowcase = [
  {
    slug: "professional-services",
    order: 1,
    cover: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Servicios profesionales / consultoria y marca personal",
    summary:
      "Base premium oscura para consultores, arquitectos, ingenieros y profesionales independientes que necesitan comunicar criterio y experiencia.",
    angle:
      "La direccion visual editorial y oscura transmite seriedad y diferenciacion frente a las tipicas landing corporativas claras.",
    highlights: [
      "Bloques para servicios, metodologia, proyectos y contacto",
      "Diseno oscuro premium para consultoria tecnica y marca personal",
      "Editor visual para ajustar copy, imagenes y CTA",
    ],
    tags: ["Servicios", "Consultoria", "Marca personal"],
    editorDemo: true,
    editorCopy:
      "Edita propuesta, servicios, proyectos y cierre comercial para cualquier servicio profesional.",
  },
  {
    slug: "health-consultation",
    order: 2,
    cover: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Salud / psicologia y consulta",
    summary:
      "Base para psicologia, salud y bienestar con una landing calmada, confiable y lista para contacto por WhatsApp o cita.",
    angle:
      "Sirve como punto de partida para profesionales que venden por confianza y necesitan una presencia mas humana que corporativa.",
    highlights: [
      "Estructura clara para servicios, autoridad y preguntas frecuentes",
      "Direccion visual calmada y premium para salud y consulta",
      "Editor visual para ajustar propuesta, CTA y bloques clave",
    ],
    tags: ["Salud", "Consulta", "Confianza"],
    editorDemo: true,
    editorCopy:
      "Edita propuesta, servicios, FAQ y cierre comercial para psicologia, salud y bienestar.",
  },
  {
    slug: "panaderia",
    order: 3,
    cover: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Comida local / panaderia y catalogo",
    summary:
      "Plantilla para panaderias, cafes y negocios de comida local que necesitan mostrar productos, horarios y pedidos por WhatsApp.",
    angle:
      "Pensada para negocios de vitrina y encargos que necesitan verse bien y facilitar el contacto desde el celular.",
    highlights: [
      "Catalogo con categorias y filtros para productos destacados",
      "Editor para cambiar contenido desde el navegador",
      "Botones directos a pedido, mapa y preguntas frecuentes",
    ],
    tags: ["Comida local", "Catalogo", "WhatsApp"],
    editorDemo: true,
    editorCopy:
      "Edita textos, imagenes, colores y CTA para panaderias, cafes y negocios de comida local.",
  },
  {
    slug: "restaurant",
    order: 4,
    cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Comida local / restaurante y cafe",
    summary:
      "Pagina para restaurantes, cafes y propuestas gastronomicas que necesitan mostrar experiencia, menu y reservas o contacto.",
    angle:
      "Sirve como segunda base de comida local para negocios que venden experiencia, ambiente y visita al lugar.",
    highlights: [
      "Presentacion clara del lugar, la experiencia y la carta",
      "Secciones para menu, historia, reservas o contacto",
      "Diseno limpio para celular y escritorio",
    ],
    tags: ["Restaurante", "Cafe", "Reservas"],
    editorDemo: true,
    editorCopy:
      "Ajusta propuesta, experiencia, menu y reserva desde el editor visual de la demo.",
  },
  {
    slug: "gym",
    order: 5,
    cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Bienestar / gimnasio y planes",
    summary: "Pagina comercial para mostrar planes, clases y datos clave de bienestar o entrenamiento.",
    angle: "Util para fitness, entrenadores personales y negocios de bienestar.",
    highlights: [
      "Planes y clases en bloques faciles de leer",
      "Secciones para entrenadores, horarios y beneficios",
      "Botones de contacto visibles desde el inicio",
    ],
    tags: ["Fitness", "Planes", "Contacto"],
    editorDemo: true,
    editorCopy:
      "Edita promesa, planes, CTA y datos de contacto desde el editor visual.",
  },
  {
    slug: "civil-engineer",
    order: 6,
    cover: "https://images.unsplash.com/photo-1513828742140-ccaa28f3eda0?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Ingenieria civil / marca tecnica especializada",
    summary:
      "Base tecnica clara para ingenieros civiles, consultores de suelos y profesionales de infraestructura que necesitan una presencia con criterio propio.",
    angle:
      "Muestra como un tecnico puede comunicar su especialidad con lenguaje directo y una estetica distinta a la landing corporativa comun.",
    highlights: [
      "Servicios con metodologia y entregables explicados por utilidad",
      "Perfil tecnico con foco en criterio y tipo de proyecto",
      "Editor visual para ajustar copy, imagenes y contacto",
    ],
    tags: ["Ingenieria", "Tecnico", "Marca personal"],
    editorDemo: true,
    editorCopy:
      "Edita servicios, metodologia, perfil y contacto para ingenieria civil o consultoria tecnica.",
  },
  {
    slug: "tattoo-studio",
    order: 7,
    cover: "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Marca visual / tattoo y creativos",
    summary: "Sitio para mostrar trabajos, estilo y datos de contacto para negocios muy visuales o creativos.",
    angle: "La confianza entra por las piezas publicadas y un contacto claro.",
    highlights: [
      "Galeria de trabajos como pieza principal",
      "Secciones para artistas, cuidados y preguntas comunes",
      "WhatsApp como contacto principal",
    ],
    tags: ["Galeria", "Estilo", "Contacto"],
    editorDemo: true,
    editorCopy:
      "Ajusta mensaje, estilos, CTA y datos clave desde la propia demo.",
  },
];

const fallbackImplementations = [
  {
    slug: "monica-valencia",
    order: 1,
    name: "Monica Valencia H.",
    category: "psychology",
    entry: "https://monica-valencia.vercel.app/",
    templateEntry: null,
    cover: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1400&q=80&auto=format&fit=crop",
    eyebrow: "Psicologia / implementado",
    summary:
      "Sitio profesional para psicologa especializada en neuropsicopedagogia infantil, con servicios clinicos, orientacion a padres y modalidad presencial mas virtual.",
    angle:
      "Demuestra como un profesional de salud puede comunicar expertise clinico con calidez humana en una landing clara y de confianza.",
    highlights: [
      "Propuesta de valor centrada en el impacto del diagnostico en la vida del nino",
      "Estructura de evaluaciones especificas para diferentes edades y diagnosticos",
      "Llamadas a la accion enfocadas en consulta inicial",
    ],
    tags: ["Psicologia", "Neuropsicopedagogia", "Consulta"],
    statusLabel: "Implementado",
    state: "live",
  },
];

const externalLinkAttrs = 'target="_blank" rel="noopener noreferrer"';
const leadFormDefaultStatus =
  "Esto no envia datos a terceros: solo te abre WhatsApp con el mensaje ya ordenado.";

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

  if (entry.adminUrl) {
    links.push(`<a href="${escapeHtml(entry.adminUrl)}" ${externalLinkAttrs}>Admin</a>`);
  }

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

function buildLeadMessage(payload) {
  const businessLine = payload.sector
    ? `Tengo un negocio llamado ${payload.business} en el sector ${payload.sector}.`
    : `Tengo un negocio llamado ${payload.business}.`;
  const cityLine = payload.city ? `Estoy en ${payload.city}.` : "";
  const referenceLine = payload.reference
    ? `Mi referencia actual es: ${payload.reference}.`
    : "";

  return [
    `Hola Andres, soy ${payload.name}.`,
    businessLine,
    cityLine,
    `Quiero trabajar una ${payload.offer.toLowerCase()} y mi objetivo principal es ${payload.goal}.`,
    referenceLine,
    "Vi tu portafolio y me gustaria que me dijeras que demo me conviene y como arrancarias una propuesta inicial.",
  ]
    .filter(Boolean)
    .join("\n");
}

function initLeadForm() {
  const form = document.getElementById("leadForm");
  if (!form) {
    return;
  }

  const statusNode = document.getElementById("leadFormStatus");
  const offerSelect = document.getElementById("leadOffer");
  const whatsappNumber = form.dataset.whatsappNumber || "573007561667";

  document.querySelectorAll("[data-lead-offer]").forEach((link) => {
    link.addEventListener("click", () => {
      const preset = link.dataset.leadOffer;
      if (offerSelect && preset) {
        offerSelect.value = preset;
      }

      if (statusNode) {
        statusNode.textContent = `Ya deje marcada la opcion "${preset}". Completa los datos y abrimos WhatsApp con el mensaje listo.`;
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = {
      name: form.elements.name?.value.trim() || "",
      business: form.elements.business?.value.trim() || "",
      sector: form.elements.sector?.value.trim() || "",
      goal: form.elements.goal?.value.trim() || "",
      offer: form.elements.offer?.value.trim() || "propuesta inicial",
      city: form.elements.city?.value.trim() || "",
      reference: form.elements.reference?.value.trim() || "",
    };

    if (!payload.name || !payload.business || !payload.goal) {
      if (statusNode) {
        statusNode.textContent =
          "Escribe al menos tu nombre, el negocio y el objetivo principal para preparar mejor el mensaje.";
      }
      return;
    }

    if (statusNode) {
      statusNode.textContent = "Abriendo WhatsApp con un mensaje mas claro para arrancar la conversacion.";
    }

    const href = `https://wa.me/${encodeURIComponent(whatsappNumber)}?text=${encodeURIComponent(
      buildLeadMessage(payload)
    )}`;

    window.open(href, "_blank", "noopener,noreferrer");
  });

  form.addEventListener("reset", () => {
    if (statusNode) {
      statusNode.textContent = leadFormDefaultStatus;
    }
  });

  if (statusNode) {
    statusNode.textContent = leadFormDefaultStatus;
  }
}

async function renderPortfolio() {
  // Mostrar numeros reales de inmediato con los fallbacks — nunca "00"
  setNodeText("heroTemplateCount", formatCount(fallbackTemplates.length));
  setNodeText("heroImplementationCount", formatCount(fallbackImplementations.length));
  setNodeText(
    "heroEditorCount",
    formatCount(fallbackShowcase.filter((entry) => entry.editorDemo).length)
  );

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

initLeadForm();
renderPortfolio();
