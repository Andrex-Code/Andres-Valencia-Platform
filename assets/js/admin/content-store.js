(function (global) {
  "use strict";

  const LOCAL_PREFIX = "av-studio-workspace::";
  const LEGACY_PAGE_PREFIX = "av-template-editor::";
  const COLLECTION_DEFINITIONS = {
    projects: {
      label: "Proyectos",
      description: "Ideal para ingenieros, arquitectos y consultores.",
      emptyTitle: "Sin proyectos todavia",
      fields: [
        ["title", "Titulo", "text"],
        ["summary", "Resumen", "textarea"],
        ["status", "Estado", "select", ["draft", "study", "execution", "completed", "featured"]],
        ["location", "Ciudad o zona", "text"],
        ["metric", "Dato clave", "text"],
        ["ctaLabel", "Texto CTA", "text"],
        ["ctaHref", "Enlace CTA", "text"],
        ["image", "URL imagen", "text"],
      ],
      create(index) {
        return {
          id: `project-${Date.now()}-${index}`,
          title: "Nuevo proyecto",
          summary: "",
          status: "draft",
          location: "",
          metric: "",
          ctaLabel: "Ver proyecto",
          ctaHref: "",
          image: "",
        };
      },
    },
    products: {
      label: "Productos",
      description: "Para inventario, menus, catalogos y vitrinas.",
      emptyTitle: "Sin productos todavia",
      fields: [
        ["title", "Nombre", "text"],
        ["summary", "Descripcion", "textarea"],
        ["status", "Estado", "select", ["draft", "available", "low-stock", "sold-out", "archived"]],
        ["price", "Precio", "text"],
        ["category", "Categoria", "text"],
        ["stock", "Stock", "text"],
        ["ctaLabel", "Texto CTA", "text"],
        ["ctaHref", "Enlace CTA", "text"],
        ["image", "URL imagen", "text"],
      ],
      create(index) {
        return {
          id: `product-${Date.now()}-${index}`,
          title: "Nuevo producto",
          summary: "",
          status: "draft",
          price: "",
          category: "",
          stock: "",
          ctaLabel: "Pedir ahora",
          ctaHref: "",
          image: "",
        };
      },
    },
    services: {
      label: "Servicios",
      description: "Para profesionales y negocios basados en oferta.",
      emptyTitle: "Sin servicios todavia",
      fields: [
        ["title", "Nombre", "text"],
        ["summary", "Descripcion", "textarea"],
        ["status", "Estado", "select", ["draft", "ready", "featured", "archived"]],
        ["modality", "Modalidad", "text"],
        ["price", "Precio orientativo", "text"],
        ["ctaLabel", "Texto CTA", "text"],
        ["ctaHref", "Enlace CTA", "text"],
      ],
      create(index) {
        return {
          id: `service-${Date.now()}-${index}`,
          title: "Nuevo servicio",
          summary: "",
          status: "draft",
          modality: "",
          price: "",
          ctaLabel: "Consultar",
          ctaHref: "",
        };
      },
    },
    testimonials: {
      label: "Testimonios",
      description: "Prueba social editable para cualquier sitio.",
      emptyTitle: "Sin testimonios todavia",
      fields: [
        ["title", "Nombre o empresa", "text"],
        ["summary", "Testimonio", "textarea"],
        ["status", "Estado", "select", ["draft", "published", "featured", "archived"]],
        ["role", "Cargo o relacion", "text"],
      ],
      create(index) {
        return {
          id: `testimonial-${Date.now()}-${index}`,
          title: "Nuevo testimonio",
          summary: "",
          status: "draft",
          role: "",
        };
      },
    },
    faq: {
      label: "Preguntas frecuentes",
      description: "Bloque rapido para dudas comunes.",
      emptyTitle: "Sin preguntas todavia",
      fields: [
        ["title", "Pregunta", "text"],
        ["summary", "Respuesta", "textarea"],
        ["status", "Estado", "select", ["draft", "published", "archived"]],
      ],
      create(index) {
        return {
          id: `faq-${Date.now()}-${index}`,
          title: "Nueva pregunta",
          summary: "",
          status: "draft",
        };
      },
    },
    gallery: {
      label: "Galeria",
      description: "Piezas visuales, trabajos o fotos destacadas.",
      emptyTitle: "Sin galeria todavia",
      fields: [
        ["title", "Titulo", "text"],
        ["summary", "Nota", "textarea"],
        ["status", "Estado", "select", ["draft", "published", "featured", "archived"]],
        ["image", "URL imagen", "text"],
        ["ctaHref", "Enlace opcional", "text"],
      ],
      create(index) {
        return {
          id: `gallery-${Date.now()}-${index}`,
          title: "Nueva pieza",
          summary: "",
          status: "draft",
          image: "",
          ctaHref: "",
        };
      },
    },
  };

  function mode() {
    return global.AVConfig?.resolvedMode?.() || "local";
  }

  function getWorkspaceTable() {
    return global.AVConfig?.get?.().workspaceTable || "editor_workspaces";
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function localKey(siteId) {
    return `${LOCAL_PREFIX}${siteId}`;
  }

  function defaultWorkspace(siteId) {
    const collections = {};
    Object.keys(COLLECTION_DEFINITIONS).forEach((key) => {
      collections[key] = [];
    });
    return {
      version: 1,
      siteId,
      updatedAt: "",
      updatedBy: "",
      settings: {
        editorMode: "pro",
      },
      pageStates: {},
      collections,
    };
  }

  function normalizePageState(value) {
    const next = {
      pageTitle: typeof value?.pageTitle === "string" ? value.pageTitle : "",
      metaDescription: typeof value?.metaDescription === "string" ? value.metaDescription : "",
      customCss: typeof value?.customCss === "string" ? value.customCss : "",
      patches: value?.patches && typeof value.patches === "object" ? clone(value.patches) : {},
      updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : "",
    };
    return next;
  }

  function normalizeCollectionItems(type, items) {
    const definition = COLLECTION_DEFINITIONS[type];
    if (!definition || !Array.isArray(items)) {
      return [];
    }

    return items.map((item, index) => {
      const base = definition.create(index);
      return { ...base, ...clone(item || {}), id: item?.id || base.id };
    });
  }

  function normalizeWorkspace(siteId, value) {
    const base = defaultWorkspace(siteId);
    const next = {
      ...base,
      ...clone(value || {}),
      siteId,
      updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : "",
      updatedBy: typeof value?.updatedBy === "string" ? value.updatedBy : "",
      settings: {
        ...base.settings,
        ...(value?.settings || {}),
      },
      pageStates: {},
      collections: {},
    };

    const rawPageStates = value?.pageStates && typeof value.pageStates === "object" ? value.pageStates : {};
    Object.entries(rawPageStates).forEach(([pageKey, pageState]) => {
      next.pageStates[pageKey] = normalizePageState(pageState);
    });

    Object.keys(COLLECTION_DEFINITIONS).forEach((type) => {
      next.collections[type] = normalizeCollectionItems(type, value?.collections?.[type]);
    });

    return next;
  }

  function readLocal(siteId) {
    try {
      const raw = localStorage.getItem(localKey(siteId));
      return normalizeWorkspace(siteId, raw ? JSON.parse(raw) : {});
    } catch (_) {
      return defaultWorkspace(siteId);
    }
  }

  function writeLocal(siteId, workspace) {
    localStorage.setItem(localKey(siteId), JSON.stringify(workspace));
  }

  async function loadRemote(siteId) {
    const sb = global.AVSupabase?.client?.();
    if (!sb) {
      return { ok: false, error: "Supabase no inicializado." };
    }
    const { data, error } = await sb
      .from(getWorkspaceTable())
      .select("site_id,payload,updated_at,updated_by")
      .eq("site_id", siteId)
      .maybeSingle();
    if (error) {
      return { ok: false, error: error.message };
    }
    if (!data) {
      return { ok: true, workspace: null };
    }
    return {
      ok: true,
      workspace: normalizeWorkspace(siteId, {
        ...(data.payload || {}),
        updatedAt: data.updated_at || data.payload?.updatedAt || "",
        updatedBy: data.updated_by || data.payload?.updatedBy || "",
      }),
    };
  }

  async function saveRemote(siteId, workspace) {
    const sb = global.AVSupabase?.client?.();
    if (!sb) {
      return { ok: false, error: "Supabase no inicializado." };
    }

    const user = await global.AVAuth?.currentUser?.();
    const payload = clone(workspace);
    payload.updatedAt = nowIso();
    payload.updatedBy = user?.id || user?.email || "";

    const { error } = await sb.from(getWorkspaceTable()).upsert(
      {
        site_id: siteId,
        payload,
        updated_at: payload.updatedAt,
        updated_by: payload.updatedBy,
      },
      { onConflict: "site_id" }
    );

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, workspace: normalizeWorkspace(siteId, payload) };
  }

  async function loadWorkspace(siteId) {
    const local = readLocal(siteId);
    if (mode() !== "supabase") {
      return { ok: true, provider: "local", workspace: local };
    }

    const remote = await loadRemote(siteId);
    if (!remote.ok) {
      return { ok: true, provider: "local", workspace: local, warning: remote.error };
    }

    if (!remote.workspace) {
      return { ok: true, provider: "local", workspace: local };
    }

    writeLocal(siteId, remote.workspace);
    return { ok: true, provider: "supabase", workspace: remote.workspace };
  }

  async function saveWorkspace(siteId, workspace) {
    const normalized = normalizeWorkspace(siteId, workspace);
    normalized.updatedAt = nowIso();
    writeLocal(siteId, normalized);

    if (mode() !== "supabase") {
      return { ok: true, provider: "local", workspace: normalized };
    }

    const remote = await saveRemote(siteId, normalized);
    if (!remote.ok) {
      writeLocal(siteId, normalized);
      return { ok: true, provider: "local", workspace: normalized, warning: remote.error };
    }

    writeLocal(siteId, remote.workspace);
    return { ok: true, provider: "supabase", workspace: remote.workspace };
  }

  function readLegacyPageState(pageKey) {
    try {
      const raw = localStorage.getItem(`${LEGACY_PAGE_PREFIX}${pageKey}`);
      return raw ? normalizePageState(JSON.parse(raw)) : null;
    } catch (_) {
      return null;
    }
  }

  async function loadPageState(siteId, pageKey) {
    const workspaceResult = await loadWorkspace(siteId);
    const workspace = workspaceResult.workspace;
    const state = workspace.pageStates[pageKey] || readLegacyPageState(pageKey) || null;
    return {
      ok: true,
      provider: workspaceResult.provider,
      warning: workspaceResult.warning,
      state,
      workspace,
    };
  }

  async function savePageState(siteId, pageKey, pageState) {
    const workspaceResult = await loadWorkspace(siteId);
    const workspace = workspaceResult.workspace;
    workspace.pageStates[pageKey] = normalizePageState({
      ...pageState,
      updatedAt: nowIso(),
    });
    const result = await saveWorkspace(siteId, workspace);
    localStorage.setItem(`${LEGACY_PAGE_PREFIX}${pageKey}`, JSON.stringify(workspace.pageStates[pageKey]));
    return result;
  }

  async function updateSetting(siteId, key, value) {
    const workspaceResult = await loadWorkspace(siteId);
    const workspace = workspaceResult.workspace;
    workspace.settings[key] = value;
    return saveWorkspace(siteId, workspace);
  }

  async function replaceCollection(siteId, type, items) {
    const workspaceResult = await loadWorkspace(siteId);
    const workspace = workspaceResult.workspace;
    workspace.collections[type] = normalizeCollectionItems(type, items);
    return saveWorkspace(siteId, workspace);
  }

  function getDefinitions() {
    return clone(COLLECTION_DEFINITIONS);
  }

  global.AVContentStore = {
    defaultWorkspace,
    getDefinitions,
    loadWorkspace,
    saveWorkspace,
    loadPageState,
    savePageState,
    updateSetting,
    replaceCollection,
    normalizeWorkspace,
  };
})(window);
