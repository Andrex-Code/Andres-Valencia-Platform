(function (global) {
  "use strict";

  const fallbackTemplates = [
    { slug: "health-consultation", name: "Health Consultation", category: "health", family: "salud-consulta", entry: "templates/health-consultation/index.html", status: "ready", order: 1 },
    { slug: "panaderia", name: "Casa Horno", category: "food-local", family: "comida-local", entry: "templates/panaderia/index.html", status: "ready", order: 2 },
    { slug: "professional-services", name: "Professional Services", category: "professional-services", family: "servicios-profesionales", entry: "templates/professional-services/index.html", status: "ready", order: 3 },
    { slug: "restaurant", name: "Aubergine", category: "food-local", family: "comida-local", entry: "templates/restaurant/index.html", status: "ready", order: 4 },
    { slug: "gym", name: "IRONFORM Gym", category: "fitness", family: "bienestar", entry: "templates/gym/index.html", status: "ready", order: 5 },
    { slug: "tattoo-studio", name: "Sombra Ink", category: "creative", family: "marca-visual", entry: "templates/tattoo-studio/index.html", status: "ready", order: 6 },
  ];

  const fallbackImplementations = [
    { slug: "monica-valencia", name: "Monica Valencia H.", category: "psychology", entry: "https://monica-valencia.vercel.app/", statusLabel: "Implementado", state: "live", order: 1 },
    { slug: "mario-valencia", name: "Mario Valencia", category: "engineering", entry: "https://mario-valencia.vercel.app/", adminUrl: "https://mario-valencia.vercel.app/admin/", statusLabel: "En implementacion", state: "progress", order: 2 },
    { slug: "panaderia-la-chiquita", name: "Panaderia La Chiquita", category: "bakery", entry: "https://la-chiquita.vercel.app/", adminUrl: "https://la-chiquita.vercel.app/admin/", statusLabel: "Implementado", state: "live", order: 3 },
  ];

  const fallbackShowcase = [
    { slug: "health-consultation", eyebrow: "Salud / psicologia y consulta", summary: "Base para psicologia, salud y bienestar con una landing calmada, confiable y lista para contacto.", tags: ["Salud", "Consulta", "Confianza"] },
    { slug: "panaderia", eyebrow: "Comida local / panaderia y catalogo", summary: "Plantilla para panaderias, cafes y negocios de comida local con productos, horarios y pedidos.", tags: ["Comida local", "Catalogo", "WhatsApp"] },
    { slug: "professional-services", eyebrow: "Servicios profesionales / consultoria", summary: "Base premium para ingenieros, consultores y servicios profesionales.", tags: ["Servicios", "Consultoria", "Confianza"] },
    { slug: "restaurant", eyebrow: "Comida local / restaurante", summary: "Pagina para restaurantes, cafes y propuestas gastronomicas que muestran experiencia y reservas.", tags: ["Restaurante", "Cafe", "Reservas"] },
    { slug: "gym", eyebrow: "Bienestar / gimnasio", summary: "Pagina comercial para mostrar planes, clases y datos clave de bienestar.", tags: ["Fitness", "Planes", "Contacto"] },
    { slug: "tattoo-studio", eyebrow: "Marca visual / tattoo", summary: "Sitio para mostrar trabajos, estilo y datos de contacto con enfoque visual.", tags: ["Galeria", "Estilo", "Contacto"] },
  ];

  const runtime = {
    ctx: null,
    sites: [],
    selectedSiteId: "portfolio-home",
    selectedCollection: "projects",
    selectedItemId: "",
    providerBySite: new Map(),
    warningBySite: new Map(),
    workspaces: new Map(),
    saveTimers: new Map(),
    saveState: new Map(),
    handlersBound: false,
  };

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
      if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
      return await response.json();
    } catch (error) {
      console.warn("[AVAdminStudio]", error.message);
      return fallback;
    }
  }

  function statusTone(state) {
    switch (state) {
      case "live":
      case "ready":
      case "supabase":
      case "saved":
        return "success";
      case "progress":
      case "warning":
      case "pending":
        return "warning";
      case "paused":
      case "local":
      case "idle":
        return "muted";
      default:
        return "info";
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

  function definitions() {
    return global.AVContentStore.getDefinitions();
  }

  function activeSite() {
    return runtime.sites.find((item) => item.siteId === runtime.selectedSiteId) || runtime.sites[0];
  }

  function activeWorkspace() {
    const site = activeSite();
    if (!site) return global.AVContentStore.defaultWorkspace("portfolio-home");
    return runtime.workspaces.get(site.siteId) || global.AVContentStore.defaultWorkspace(site.siteId);
  }

  function activeCollectionItems() {
    const workspace = activeWorkspace();
    return workspace.collections?.[runtime.selectedCollection] || [];
  }

  function activeItem() {
    return activeCollectionItems().find((item) => item.id === runtime.selectedItemId) || null;
  }

  function siteTypeLabel(type) {
    switch (type) {
      case "home": return "Portafolio";
      case "template": return "Plantilla base";
      case "implementation": return "Sitio activo";
      default: return "Sitio";
    }
  }

  function buildSites(templates, implementations, showcase) {
    const showcaseBySlug = new Map(showcase.map((item) => [item.slug, item]));
    const sites = [
      {
        siteId: "portfolio-home",
        type: "home",
        name: "Portafolio principal",
        eyebrow: "Pagina de inicio y portafolio",
        summary: "Entrada principal del portafolio y capa de venta del sistema.",
        previewUrl: "/",
        editUrl: "/?edit=1",
        adminUrl: "/admin/",
        order: 0,
        tags: ["Home", "Oferta", "Portafolio"],
      },
    ];

    templates
      .sort((a, b) => (a.order || 99) - (b.order || 99))
      .forEach((template) => {
        const meta = showcaseBySlug.get(template.slug) || {};
        sites.push({
          siteId: template.slug,
          type: "template",
          name: template.name,
          eyebrow: meta.eyebrow || template.category || "Plantilla",
          summary: meta.summary || "Base reutilizable lista para editar.",
          previewUrl: normalizeUrl(template.entry, "/"),
          editUrl: toEditUrl(template.entry),
          adminUrl: "/admin/",
          order: 10 + (template.order || 99),
          tags: meta.tags || [],
          state: template.status || "ready",
          family: template.family || "",
        });
      });

    implementations
      .sort((a, b) => (a.order || 99) - (b.order || 99))
      .forEach((implementation) => {
        sites.push({
          siteId: implementation.slug,
          type: "implementation",
          name: implementation.name,
          eyebrow: implementation.eyebrow || implementation.category || "Sitio activo",
          summary: implementation.summary || "Caso real derivado de una plantilla base.",
          previewUrl: normalizeUrl(implementation.entry, "/"),
          editUrl: implementation.adminUrl || toEditUrl(implementation.entry),
          adminUrl: implementation.adminUrl || "",
          order: 100 + (implementation.order || 99),
          tags: implementation.tags || [],
          state: implementation.state || "live",
        });
      });

    return sites.sort((a, b) => (a.order || 99) - (b.order || 99));
  }

  async function ensureWorkspace(siteId) {
    if (runtime.workspaces.has(siteId)) return runtime.workspaces.get(siteId);
    const result = await global.AVContentStore.loadWorkspace(siteId);
    runtime.workspaces.set(siteId, result.workspace);
    runtime.providerBySite.set(siteId, result.provider || "local");
    runtime.warningBySite.set(siteId, result.warning || "");
    return result.workspace;
  }

  function saveStateLabel(siteId) {
    const state = runtime.saveState.get(siteId) || "idle";
    switch (state) {
      case "saving": return "Guardando...";
      case "saved": return "Guardado";
      case "error": return "Problema al guardar";
      default: return "Todo guardado";
    }
  }

  function saveStateTone(siteId) {
    return statusTone(runtime.saveState.get(siteId) || "idle");
  }

  function storageLabel(siteId) {
    const provider = runtime.providerBySite.get(siteId) || "local";
    return provider === "supabase" ? "Guardado en la nube" : "Guardado en este dispositivo";
  }

  function buildSidebar() {
    return `
      <aside class="av-studio-sidebar">
        <div class="av-studio-sidebar-brand">
          <div class="av-studio-sidebar-logo">AV</div>
          <strong>Panel de edicion</strong>
          <p>Elige el sitio que quieres editar.</p>
        </div>
        <nav class="av-studio-sidebar-list" aria-label="Sitios">
          ${runtime.sites
            .map((site) => {
              const active = site.siteId === runtime.selectedSiteId;
              return `
                <button type="button" class="av-studio-site-item${active ? " is-active" : ""}" data-site-select="${escapeHtml(site.siteId)}" title="${escapeHtml(site.name)}">
                  <small>${escapeHtml(siteTypeLabel(site.type))}</small>
                  <strong>${escapeHtml(site.name)}</strong>
                  <span>${escapeHtml(site.eyebrow || "")}</span>
                </button>
              `;
            })
            .join("")}
        </nav>
        <button type="button" class="av-studio-sidebar-logout" id="avStudioLogout">Cerrar sesion</button>
      </aside>
    `;
  }

  function buildModeCards(workspace) {
    const currentMode = workspace.settings?.editorMode || "pro";
    return `
      <div class="av-studio-mode-grid">
        <button type="button" class="av-studio-mode-card${currentMode === "client" ? " is-active" : ""}" data-editor-mode="client">
          <small>Modo simple</small>
          <strong>Para el cliente</strong>
          <p>Muestra solo lo necesario: textos, imagenes e inventario. Sin opciones tecnicas.</p>
        </button>
        <button type="button" class="av-studio-mode-card${currentMode === "pro" ? " is-active" : ""}" data-editor-mode="pro">
          <small>Modo avanzado</small>
          <strong>Para el editor</strong>
          <p>Acceso completo a SEO, CSS, estructura de modulos y colecciones.</p>
        </button>
      </div>
    `;
  }

  function buildCollectionTabs() {
    return `
      <div class="av-studio-collection-tabs" role="tablist">
        ${Object.entries(definitions())
          .map(([key, definition]) => {
            const active = key === runtime.selectedCollection;
            return `
              <button type="button" class="av-studio-collection-tab${active ? " is-active" : ""}" data-collection-tab="${escapeHtml(key)}" role="tab" aria-selected="${active}">
                ${escapeHtml(definition.label)}
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function buildCollectionList(items, definition) {
    if (!items.length) {
      return `
        <article class="av-studio-empty-card">
          <small>${escapeHtml(definition.label)}</small>
          <strong>${escapeHtml(definition.emptyTitle)}</strong>
          <p>${escapeHtml(definition.description)}</p>
        </article>
      `;
    }

    return items
      .map((item, index) => {
        const active = item.id === runtime.selectedItemId;
        const stateLabel = item.status === "published" ? "Publicado" : item.status === "draft" ? "Borrador" : item.status || "Borrador";
        return `
          <article class="av-studio-collection-card${active ? " is-active" : ""}" data-item-select="${escapeHtml(item.id)}">
            <div class="av-studio-collection-card-head">
              <div>
                <small>#${String(index + 1).padStart(2, "0")}</small>
                <strong>${escapeHtml(item.title || "Sin titulo")}</strong>
              </div>
              <span class="av-studio-pill" data-tone="${escapeHtml(statusTone(item.status || "draft"))}">${escapeHtml(stateLabel)}</span>
            </div>
            <p>${escapeHtml(item.summary || "Sin descripcion todavia.")}</p>
          </article>
        `;
      })
      .join("");
  }

  function buildField(fieldDef, item) {
    const [key, label, type, options] = fieldDef;
    const value = item?.[key] ?? "";

    if (type === "textarea") {
      return `
        <label class="av-studio-field">
          <span>${escapeHtml(label)}</span>
          <textarea data-item-field="${escapeHtml(key)}">${escapeHtml(value)}</textarea>
        </label>
      `;
    }

    if (type === "select") {
      return `
        <label class="av-studio-field">
          <span>${escapeHtml(label)}</span>
          <select data-item-field="${escapeHtml(key)}">
            ${options.map((option) => {
              const optLabel = option === "published" ? "Publicado" : option === "draft" ? "Borrador" : option;
              return `<option value="${escapeHtml(option)}"${option === value ? " selected" : ""}>${escapeHtml(optLabel)}</option>`;
            }).join("")}
          </select>
        </label>
      `;
    }

    return `
      <label class="av-studio-field">
        <span>${escapeHtml(label)}</span>
        <input type="text" value="${escapeHtml(value)}" data-item-field="${escapeHtml(key)}" />
      </label>
    `;
  }

  function buildCollectionEditor(items, definition) {
    const item = activeItem();
    return `
      <section class="av-studio-workspace-grid">
        <article class="av-studio-panel-card av-studio-panel-tall">
          <div class="av-studio-panel-head">
            <div>
              <small>Tu contenido</small>
              <h2>${escapeHtml(definition.label)}</h2>
            </div>
          </div>
          <p>${escapeHtml(definition.description)}</p>
          ${buildCollectionTabs()}
          <div class="av-studio-card-actions">
            <button type="button" data-collection-add="${escapeHtml(runtime.selectedCollection)}">+ Agregar nuevo</button>
          </div>
          <div class="av-studio-collection-list">
            ${buildCollectionList(items, definition)}
          </div>
        </article>

        <article class="av-studio-panel-card av-studio-panel-tall">
          <div class="av-studio-panel-head">
            <div>
              <small>Detalle</small>
              <h2>${escapeHtml(item?.title || "Elige uno de la lista")}</h2>
            </div>
          </div>
          ${
            item
              ? `
                <div class="av-studio-field-grid">
                  ${definition.fields.map((field) => buildField(field, item)).join("")}
                </div>
                <div class="av-studio-card-actions">
                  <button type="button" data-item-move="up">Subir</button>
                  <button type="button" data-item-move="down">Bajar</button>
                  <button type="button" data-item-duplicate="true">Duplicar</button>
                  <button type="button" data-item-delete="true">Eliminar</button>
                </div>
              `
              : `
                <article class="av-studio-empty-card">
                  <small>Detalle</small>
                  <strong>Selecciona una entrada</strong>
                  <p>Haz clic en cualquier elemento de la lista para ver y editar sus datos.</p>
                </article>
              `
          }
        </article>
      </section>
    `;
  }

  function render() {
    const site = activeSite();
    const workspace = activeWorkspace();
    const defs = definitions();
    const definition = defs[runtime.selectedCollection];
    const items = activeCollectionItems();
    const warning = runtime.warningBySite.get(site.siteId) || "";
    const pageState = workspace.pageStates?.[site.siteId] || null;
    const patchCount = Object.keys(pageState?.patches || {}).length;
    const saveLabel = saveStateLabel(site.siteId);
    const saveTone = saveStateTone(site.siteId);

    document.body.innerHTML = `
      <main class="av-studio-app">
        ${buildSidebar()}

        <section class="av-studio-main">

          <!-- Hero del sitio seleccionado -->
          <section class="av-studio-hero">
            <div class="av-studio-hero-copy">
              <span class="av-studio-kicker">${escapeHtml(site.eyebrow || siteTypeLabel(site.type))}</span>
              <h1>${escapeHtml(site.name)}</h1>
              <p>${escapeHtml(site.summary || "")}</p>
              <div class="av-studio-hero-actions">
                <a href="${escapeHtml(site.editUrl)}" target="_blank" rel="noopener noreferrer">
                  Editar sitio
                </a>
                <a href="${escapeHtml(site.previewUrl)}" target="_blank" rel="noopener noreferrer" data-ghost="true">
                  Ver sitio
                </a>
              </div>
            </div>
            <aside class="av-studio-hero-aside">
              <div class="av-studio-stat-grid">
                <article class="av-studio-stat-card">
                  <small>Tipo de sitio</small>
                  <strong>${escapeHtml(siteTypeLabel(site.type))}</strong>
                  <p>categoria de este sitio</p>
                </article>
                <article class="av-studio-stat-card" data-tone="${escapeHtml(saveTone)}">
                  <small>Guardado</small>
                  <strong>${escapeHtml(saveLabel)}</strong>
                  <p>${escapeHtml(storageLabel(site.siteId))}</p>
                </article>
                <article class="av-studio-stat-card">
                  <small>Secciones</small>
                  <strong>${String(Object.keys(defs).length).padStart(2, "0")}</strong>
                  <p>tipos de contenido activos</p>
                </article>
                <article class="av-studio-stat-card">
                  <small>Cambios</small>
                  <strong>${String(patchCount).padStart(2, "0")}</strong>
                  <p>${patchCount === 1 ? "ajuste guardado en pagina" : "ajustes guardados en pagina"}</p>
                </article>
              </div>
            </aside>
          </section>

          <!-- Paneles de configuracion -->
          <section class="av-studio-panel-grid av-studio-panel-grid-wide">
            <article class="av-studio-panel-card">
              <div class="av-studio-panel-head">
                <div>
                  <small>Experiencia de edicion</small>
                  <h2>Como quieres trabajar</h2>
                </div>
              </div>
              <p>Elige si prefieres ver solo lo esencial o tener acceso a todas las opciones.</p>
              ${buildModeCards(workspace)}
            </article>

            <article class="av-studio-panel-card">
              <div class="av-studio-panel-head">
                <div>
                  <small>Guardado automatico</small>
                  <h2>${escapeHtml(storageLabel(site.siteId))}</h2>
                </div>
              </div>
              <p>
                ${warning
                  ? "Los cambios se estan guardando en este navegador. Para habilitar el guardado en la nube, contacta al administrador."
                  : "Los cambios se guardan automaticamente. Tambien puedes forzar el guardado o recargar si algo no se ve actualizado."}
              </p>
              <div class="av-studio-card-actions">
                <button type="button" data-workspace-save="true">Guardar ahora</button>
                <button type="button" data-workspace-reload="true">Recargar</button>
              </div>
            </article>

            <article class="av-studio-panel-card">
              <div class="av-studio-panel-head">
                <div>
                  <small>Estado del sitio</small>
                  <h2>${patchCount ? "Con cambios guardados" : "Sin cambios pendientes"}</h2>
                </div>
              </div>
              <p>
                ${patchCount
                  ? `Hay ${patchCount} ${patchCount === 1 ? "ajuste guardado" : "ajustes guardados"} en esta pagina. Abre el editor para verlos o modificarlos.`
                  : "Todavia no hay cambios de diseno guardados para este sitio. Abre el editor y haz clic en cualquier elemento para empezar."}
              </p>
              <div class="av-studio-card-actions">
                <a href="${escapeHtml(site.editUrl)}" target="_blank" rel="noopener noreferrer">Abrir editor</a>
              </div>
            </article>
          </section>

          <!-- Editor de contenido -->
          ${buildCollectionEditor(items, definition)}

        </section>
      </main>
    `;

    document.getElementById("avStudioLogout")?.addEventListener("click", async () => {
      await runtime.ctx.logout();
      window.location.replace("/admin/?reason=signin");
    });
  }

  function scheduleSave(siteId) {
    window.clearTimeout(runtime.saveTimers.get(siteId));
    runtime.saveState.set(siteId, "saving");
    render();
    const timer = window.setTimeout(async () => {
      const workspace = runtime.workspaces.get(siteId) || global.AVContentStore.defaultWorkspace(siteId);
      const result = await global.AVContentStore.saveWorkspace(siteId, workspace);
      runtime.workspaces.set(siteId, result.workspace);
      runtime.providerBySite.set(siteId, result.provider || "local");
      runtime.warningBySite.set(siteId, result.warning || "");
      runtime.saveState.set(siteId, result.warning ? "error" : "saved");
      render();
      window.setTimeout(() => {
        runtime.saveState.set(siteId, "idle");
        render();
      }, 1800);
    }, 520);
    runtime.saveTimers.set(siteId, timer);
  }

  function updateSelectedItemFallback() {
    const items = activeCollectionItems();
    if (!items.length) {
      runtime.selectedItemId = "";
      return;
    }
    if (!items.some((item) => item.id === runtime.selectedItemId)) {
      runtime.selectedItemId = items[0].id;
    }
  }

  async function selectSite(siteId) {
    runtime.selectedSiteId = siteId;
    await ensureWorkspace(siteId);
    updateSelectedItemFallback();
    render();
  }

  function setCollection(type) {
    runtime.selectedCollection = type;
    updateSelectedItemFallback();
    render();
  }

  function mutateItems(mutator) {
    const workspace = activeWorkspace();
    const items = workspace.collections[runtime.selectedCollection];
    mutator(items);
    workspace.collections[runtime.selectedCollection] = items;
    runtime.workspaces.set(activeSite().siteId, workspace);
    updateSelectedItemFallback();
    scheduleSave(activeSite().siteId);
  }

  function addItem() {
    const definition = definitions()[runtime.selectedCollection];
    mutateItems((items) => {
      const item = definition.create(items.length);
      items.push(item);
      runtime.selectedItemId = item.id;
    });
    render();
  }

  function moveSelected(direction) {
    mutateItems((items) => {
      const index = items.findIndex((item) => item.id === runtime.selectedItemId);
      if (index < 0) return;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= items.length) return;
      const [item] = items.splice(index, 1);
      items.splice(nextIndex, 0, item);
    });
    render();
  }

  function duplicateSelected() {
    mutateItems((items) => {
      const index = items.findIndex((item) => item.id === runtime.selectedItemId);
      if (index < 0) return;
      const cloned = {
        ...items[index],
        id: `${items[index].id}-copy-${Date.now()}`,
        title: `${items[index].title} (copia)`,
      };
      items.splice(index + 1, 0, cloned);
      runtime.selectedItemId = cloned.id;
    });
    render();
  }

  function deleteSelected() {
    if (!runtime.selectedItemId) return;
    if (!window.confirm("Se eliminara este elemento del contenido. Esta accion no se puede deshacer. Deseas continuar?")) return;
    mutateItems((items) => {
      const index = items.findIndex((item) => item.id === runtime.selectedItemId);
      if (index >= 0) items.splice(index, 1);
    });
    render();
  }

  function updateSelectedField(field, value) {
    const item = activeItem();
    if (!item) return;
    item[field] = value;
    scheduleSave(activeSite().siteId);
  }

  async function setEditorMode(mode) {
    const workspace = activeWorkspace();
    workspace.settings.editorMode = mode;
    runtime.workspaces.set(activeSite().siteId, workspace);
    scheduleSave(activeSite().siteId);
    render();
  }

  async function saveNow() {
    runtime.saveState.set(activeSite().siteId, "saving");
    render();
    const result = await global.AVContentStore.saveWorkspace(activeSite().siteId, activeWorkspace());
    runtime.workspaces.set(activeSite().siteId, result.workspace);
    runtime.providerBySite.set(activeSite().siteId, result.provider || "local");
    runtime.warningBySite.set(activeSite().siteId, result.warning || "");
    runtime.saveState.set(activeSite().siteId, result.warning ? "error" : "saved");
    render();
  }

  async function reloadWorkspace() {
    runtime.workspaces.delete(activeSite().siteId);
    await ensureWorkspace(activeSite().siteId);
    updateSelectedItemFallback();
    render();
  }

  function bindHandlers() {
    if (runtime.handlersBound) return;
    runtime.handlersBound = true;

    document.body.addEventListener("click", async (event) => {
      const siteButton = event.target.closest("[data-site-select]");
      if (siteButton) {
        await selectSite(siteButton.dataset.siteSelect);
        return;
      }

      const tab = event.target.closest("[data-collection-tab]");
      if (tab) {
        setCollection(tab.dataset.collectionTab);
        return;
      }

      const itemCard = event.target.closest("[data-item-select]");
      if (itemCard) {
        runtime.selectedItemId = itemCard.dataset.itemSelect;
        render();
        return;
      }

      if (event.target.closest("[data-collection-add]")) {
        addItem();
        return;
      }

      const moveButton = event.target.closest("[data-item-move]");
      if (moveButton) {
        moveSelected(moveButton.dataset.itemMove);
        return;
      }

      if (event.target.closest("[data-item-duplicate]")) {
        duplicateSelected();
        return;
      }

      if (event.target.closest("[data-item-delete]")) {
        deleteSelected();
        return;
      }

      const modeButton = event.target.closest("[data-editor-mode]");
      if (modeButton) {
        await setEditorMode(modeButton.dataset.editorMode);
        return;
      }

      if (event.target.closest("[data-workspace-save]")) {
        await saveNow();
        return;
      }

      if (event.target.closest("[data-workspace-reload]")) {
        await reloadWorkspace();
      }
    });

    document.body.addEventListener("input", (event) => {
      const field = event.target.closest("[data-item-field]");
      if (!field) return;
      updateSelectedField(field.dataset.itemField, field.value);
    });
  }

  async function mount(ctx) {
    runtime.ctx = ctx;
    const [templates, implementations, showcase] = await Promise.all([
      fetchJson("/catalog/templates.json", fallbackTemplates),
      fetchJson("/catalog/implementations.json", fallbackImplementations),
      fetchJson("/catalog/showcase.json", fallbackShowcase),
    ]);

    runtime.sites = buildSites(templates, implementations, showcase);
    await ensureWorkspace(runtime.selectedSiteId);
    updateSelectedItemFallback();
    bindHandlers();
    render();

    ctx.setStatus?.({
      tone: "success",
      text: "Sesion activa. Panel listo para editar.",
    });
  }

  global.AVAdminStudio = { mount };
})(window);
