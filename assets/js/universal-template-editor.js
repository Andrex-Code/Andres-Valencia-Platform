(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("edit") !== "1") {
    return;
  }

  const HISTORY_LIMIT = 50;
  const HISTORY_BURST_MS = 700;
  const blockedTags = new Set(["html", "head", "body", "meta", "link", "script", "style", "noscript"]);
  const textTags = new Set([
    "a",
    "button",
    "label",
    "small",
    "span",
    "strong",
    "em",
    "b",
    "i",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "li",
    "blockquote",
    "figcaption",
  ]);
  const containerTags = new Set(["section", "article", "header", "main", "aside", "nav", "footer", "div"]);
  const profileBySlug = {
    panaderia: {
      title: "Editor de panaderias",
      hint: "Toca cualquier bloque para cambiar textos, enlaces, imagenes y aspecto sin salir de la pagina.",
    },
    restaurant: {
      title: "Editor de restaurantes",
      hint: "Edita titulares, menu, reservas e imagenes directamente sobre la demo.",
    },
    gym: {
      title: "Editor de gimnasios",
      hint: "Ajusta promesa, stats, clases y CTA con un flujo pensado para movil.",
    },
    "tattoo-studio": {
      title: "Editor de estudios de tatuaje",
      hint: "Cambia piezas, copy y llamados a la accion sin navegar paneles complejos.",
    },
    "civil-engineer": {
      title: "Editor de ingenieria civil",
      hint: "Ajusta servicios, bloques tecnicos y cierre comercial sobre la pagina real.",
    },
  };

  const slug = resolveTemplateSlug();
  const storageKey = `av-template-editor::${slug}`;
  const publicUrl = buildPublicUrl();
  const pickerUrl = new URL(`../../editor.html?template=${encodeURIComponent(slug)}`, window.location.href).toString();
  const profile = profileBySlug[slug] || {
    title: "Editor visual",
    hint: "Toca cualquier elemento visible y editalo aqui mismo.",
  };
  const basePage = {
    title: document.title,
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
  };

  const state = normalizeState(loadState());
  const runtime = {
    selection: createSelectionState(),
    ui: null,
    profile,
    baseValues: {},
    history: {
      past: [],
      future: [],
      burstTimer: null,
      burstActive: false,
    },
    confirmAction: null,
    toastCounter: 0,
  };

  injectStyles();
  buildUi();
  document.documentElement.classList.add("av-editor-on");
  document.body.classList.add("av-editor-on");
  applyState();
  bindEvents();
  updateToolbarState();
  setStatus(profile.hint);
  showToast("Editor activado. Toca cualquier bloque para editar.", "info");

  function createSelectionState() {
    return {
      mode: "closed",
      selector: "",
      element: null,
      title: "",
      subtitle: "",
    };
  }

  function resolveTemplateSlug() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const templateIndex = parts.indexOf("templates");
    return templateIndex >= 0 ? parts[templateIndex + 1] || "demo" : "demo";
  }

  function buildPublicUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("edit");
    return url.toString();
  }

  function normalizeState(value) {
    const next = {
      pageTitle: typeof value?.pageTitle === "string" ? value.pageTitle : "",
      metaDescription: typeof value?.metaDescription === "string" ? value.metaDescription : "",
      customCss: typeof value?.customCss === "string" ? value.customCss : "",
      patches: {},
    };

    if (value?.patches && typeof value.patches === "object") {
      Object.entries(value.patches).forEach(([selector, patch]) => {
        if (!selector || !patch || typeof patch !== "object") {
          return;
        }
        next.patches[selector] = { ...patch };
      });
    }

    return next;
  }

  function cloneState(value) {
    return JSON.parse(JSON.stringify(normalizeState(value)));
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (error) {
      console.warn(error);
      return {};
    }
  }

  function persistState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function buildUi() {
    const shell = document.createElement("div");
    shell.className = "av-editor-shell";
    shell.setAttribute("data-av-editor-ui", "true");
    shell.innerHTML = `
      <div class="av-editor-toolbar" data-av-editor-ui="true">
        <div class="av-editor-toolbar-copy">
          <small>${escapeHtml(profile.title)}</small>
          <strong id="avEditorStatus">${escapeHtml(profile.hint)}</strong>
        </div>
        <div class="av-editor-toolbar-actions">
          <a href="${escapeHtml(pickerUrl)}" target="_blank" rel="noopener noreferrer">Plantillas</a>
          <button type="button" data-editor-action="page">Pagina</button>
          <button type="button" data-editor-action="undo" id="avEditorUndo">Deshacer</button>
          <button type="button" data-editor-action="redo" id="avEditorRedo">Rehacer</button>
          <button type="button" data-editor-action="export-html">Exportar HTML</button>
          <button type="button" data-editor-action="export-json">Exportar JSON</button>
          <button type="button" data-editor-action="import">Importar</button>
          <button type="button" data-editor-action="reset">Restablecer</button>
          <a href="${escapeHtml(publicUrl)}" target="_blank" rel="noopener noreferrer">Ver demo</a>
        </div>
        <input type="file" id="avEditorImportFile" accept="application/json" hidden />
      </div>

      <div class="av-editor-toast-stack" id="avEditorToasts" data-av-editor-ui="true"></div>

      <div class="av-editor-sheet" id="avEditorSheet" data-state="closed" data-av-editor-ui="true">
        <section class="av-editor-sheet-panel">
          <div class="av-editor-sheet-handle" aria-hidden="true"></div>
          <div class="av-editor-sheet-head">
            <div>
              <small id="avEditorSheetEyebrow">Sin seleccion</small>
              <strong id="avEditorSheetTitle">Toca un bloque para editarlo</strong>
              <p id="avEditorSheetSubtitle">Los cambios se guardan localmente por plantilla.</p>
            </div>
            <button type="button" data-editor-action="close-sheet" aria-label="Cerrar editor">Cerrar</button>
          </div>
          <div class="av-editor-sheet-body" id="avEditorSheetBody">
            <div class="av-editor-empty-state">
              <p>Selecciona un titular, boton, imagen o seccion para editarla aqui mismo.</p>
            </div>
          </div>
          <div class="av-editor-sheet-foot">
            <span id="avEditorSheetStatus">Listo para editar sobre la pagina.</span>
            <div class="av-editor-sheet-foot-actions">
              <button type="button" data-editor-action="close-sheet">Cerrar</button>
            </div>
          </div>
        </section>
      </div>

      <div class="av-editor-modal" id="avEditorModal" hidden data-av-editor-ui="true">
        <div class="av-editor-modal-backdrop" data-editor-action="dismiss-modal"></div>
        <div class="av-editor-modal-card">
          <small>Confirmacion</small>
          <strong id="avEditorModalTitle">Confirmar accion</strong>
          <p id="avEditorModalBody">Esta accion no se puede deshacer.</p>
          <div class="av-editor-modal-actions">
            <button type="button" data-editor-action="dismiss-modal">Cancelar</button>
            <button type="button" data-editor-action="confirm-modal" id="avEditorModalConfirm">Continuar</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(shell);

    runtime.ui = {
      shell,
      status: shell.querySelector("#avEditorStatus"),
      toasts: shell.querySelector("#avEditorToasts"),
      importFile: shell.querySelector("#avEditorImportFile"),
      toolbar: shell.querySelector(".av-editor-toolbar"),
      undoButton: shell.querySelector("#avEditorUndo"),
      redoButton: shell.querySelector("#avEditorRedo"),
      sheet: shell.querySelector("#avEditorSheet"),
      sheetEyebrow: shell.querySelector("#avEditorSheetEyebrow"),
      sheetTitle: shell.querySelector("#avEditorSheetTitle"),
      sheetSubtitle: shell.querySelector("#avEditorSheetSubtitle"),
      sheetBody: shell.querySelector("#avEditorSheetBody"),
      sheetStatus: shell.querySelector("#avEditorSheetStatus"),
      modal: shell.querySelector("#avEditorModal"),
      modalTitle: shell.querySelector("#avEditorModalTitle"),
      modalBody: shell.querySelector("#avEditorModalBody"),
      modalConfirm: shell.querySelector("#avEditorModalConfirm"),
    };
  }

  function bindEvents() {
    document.addEventListener("mouseover", handleHover, true);
    document.addEventListener("click", handleDocumentClick, true);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    runtime.ui.shell.addEventListener("click", handleUiClick);
    runtime.ui.shell.addEventListener("input", handleUiInput);
    runtime.ui.shell.addEventListener("change", handleUiInput);
    runtime.ui.importFile.addEventListener("change", (event) => {
      importState(event.target.files?.[0]);
      event.target.value = "";
    });
  }

  function handleViewportChange() {
    if (runtime.selection.mode === "element" && runtime.selection.element) {
      refreshSelectionReference();
    }
  }

  function handleKeydown(event) {
    const isMod = event.metaKey || event.ctrlKey;

    if (event.key === "Escape") {
      closeSheet();
      return;
    }

    if (isMod && !event.shiftKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undo();
      return;
    }

    if (
      (isMod && event.shiftKey && event.key.toLowerCase() === "z") ||
      (event.ctrlKey && event.key.toLowerCase() === "y")
    ) {
      event.preventDefault();
      redo();
    }
  }

  function handleUiClick(event) {
    const action = event.target.closest("[data-editor-action]");
    if (!action) {
      return;
    }

    const name = action.dataset.editorAction;

    if (name === "page") {
      event.preventDefault();
      renderPageSheet();
      return;
    }

    if (name === "undo") {
      event.preventDefault();
      undo();
      return;
    }

    if (name === "redo") {
      event.preventDefault();
      redo();
      return;
    }

    if (name === "export-html") {
      event.preventDefault();
      exportHtml();
      return;
    }

    if (name === "export-json") {
      event.preventDefault();
      exportJson();
      return;
    }

    if (name === "import") {
      event.preventDefault();
      runtime.ui.importFile.click();
      return;
    }

    if (name === "reset") {
      event.preventDefault();
      confirmAction({
        title: "Restablecer cambios",
        body: "Se borraran los cambios guardados localmente para esta plantilla y volveras a la version base.",
        confirmLabel: "Borrar cambios",
        onConfirm: resetState,
      });
      return;
    }

    if (name === "close-sheet") {
      event.preventDefault();
      closeSheet();
      return;
    }

    if (name === "dismiss-modal") {
      event.preventDefault();
      closeModal();
      return;
    }

    if (name === "confirm-modal") {
      event.preventDefault();
      const next = runtime.confirmAction;
      closeModal();
      if (typeof next === "function") {
        next();
      }
    }
  }

  function handleUiInput(event) {
    const field = event.target?.dataset?.editorField;
    if (!field) {
      return;
    }

    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;

    if (runtime.selection.mode === "page") {
      updatePageField(field, value);
      return;
    }

    if (!runtime.selection.selector) {
      return;
    }

    updateElementField(runtime.selection.selector, field, value);
  }

  function handleHover(event) {
    if (event.target.closest("[data-av-editor-ui]")) {
      return;
    }

    clearHover();
    const element = findSelectableTarget(event.target);
    if (element && element !== runtime.selection.element) {
      element.setAttribute("data-av-editor-hover", "true");
    }
  }

  function handleDocumentClick(event) {
    if (event.target.closest("[data-av-editor-ui]")) {
      return;
    }

    const element = findSelectableTarget(event.target);
    if (!element) {
      closeSheet();
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    selectElement(element);
  }

  function selectElement(element) {
    const selector = buildSelector(element);
    runtime.selection = {
      mode: "element",
      selector,
      element,
      title: getFriendlyLabel(element),
      subtitle: getSelectionContext(element),
    };
    markSelected(element);
    renderElementSheet(element, selector);
  }

  function renderElementSheet(element, selector) {
    const descriptor = describeElement(element);
    const groups = getElementFieldGroups(element);

    runtime.ui.sheet.dataset.state = "open";
    runtime.ui.sheetEyebrow.textContent = "Elemento seleccionado";
    runtime.ui.sheetTitle.textContent = runtime.selection.title;
    runtime.ui.sheetSubtitle.textContent = runtime.selection.subtitle || descriptor;
    runtime.ui.sheetStatus.textContent = "Cambios guardados localmente para esta plantilla.";
    runtime.ui.sheetBody.innerHTML = `
      <div class="av-editor-sheet-meta">
        <span>${escapeHtml(descriptor)}</span>
        <span>${escapeHtml(selector)}</span>
      </div>
      ${groups.map(buildFieldGroup).join("") || '<div class="av-editor-empty-state"><p>Este elemento no expone campos editables todavia.</p></div>'}
    `;
    refreshSelectionReference();
  }

  function renderPageSheet() {
    clearSelected();
    runtime.selection = {
      mode: "page",
      selector: "",
      element: null,
      title: "Ajustes de la pagina",
      subtitle: "Cambios globales para esta plantilla",
    };

    runtime.ui.sheet.dataset.state = "open";
    runtime.ui.sheetEyebrow.textContent = slug;
    runtime.ui.sheetTitle.textContent = "Ajustes globales";
    runtime.ui.sheetSubtitle.textContent = "Controla SEO, descripcion y CSS extra sin salir de la pagina.";
    runtime.ui.sheetStatus.textContent = "Los cambios globales tambien se guardan localmente.";
    runtime.ui.sheetBody.innerHTML = `
      ${buildFieldGroup({
        title: "Basico",
        fields: [
          {
            key: "pageTitle",
            label: "Titulo SEO",
            type: "text",
            value: state.pageTitle || basePage.title,
            help: "Es el titulo de la pestana y de muchas previsualizaciones.",
          },
          {
            key: "metaDescription",
            label: "Descripcion SEO",
            type: "textarea",
            value: state.metaDescription || basePage.metaDescription,
            help: "Texto corto para buscadores y redes.",
          },
        ],
      })}
      <details class="av-editor-advanced">
        <summary>Avanzado</summary>
        ${buildFieldGroup({
          title: "CSS adicional",
          fields: [
            {
              key: "customCss",
              label: "CSS extra",
              type: "textarea",
              value: state.customCss || "",
              help: "Ajustes extra para esta plantilla sin tocar el archivo base.",
            },
          ],
        })}
      </details>
    `;
  }

  function buildFieldGroup(group) {
    return `
      <section class="av-editor-group">
        <div class="av-editor-group-head">
          <strong>${escapeHtml(group.title)}</strong>
        </div>
        <div class="av-editor-field-list">
          ${(group.fields || []).map(buildField).join("")}
        </div>
      </section>
    `;
  }

  function buildField(field) {
    if (field.type === "textarea") {
      return `
        <label class="av-editor-field">
          <span>${escapeHtml(field.label)}</span>
          <textarea data-editor-field="${escapeHtml(field.key)}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(field.value || "")}</textarea>
          ${field.help ? `<small>${escapeHtml(field.help)}</small>` : ""}
        </label>
      `;
    }

    if (field.type === "select") {
      return `
        <label class="av-editor-field">
          <span>${escapeHtml(field.label)}</span>
          <select data-editor-field="${escapeHtml(field.key)}">
            ${(field.options || [])
              .map(
                (option) =>
                  `<option value="${escapeHtml(option.value)}"${option.value === field.value ? " selected" : ""}>${escapeHtml(option.label)}</option>`
              )
              .join("")}
          </select>
          ${field.help ? `<small>${escapeHtml(field.help)}</small>` : ""}
        </label>
      `;
    }

    return `
      <label class="av-editor-field">
        <span>${escapeHtml(field.label)}</span>
        <input type="${escapeHtml(field.type || "text")}" data-editor-field="${escapeHtml(field.key)}" value="${escapeHtml(field.value ?? "")}" placeholder="${escapeHtml(field.placeholder || "")}" />
        ${field.help ? `<small>${escapeHtml(field.help)}</small>` : ""}
      </label>
    `;
  }

  function getElementFieldGroups(element) {
    const tag = element.tagName.toLowerCase();
    const computed = window.getComputedStyle(element);
    const groups = [];
    const contentFields = [];
    const appearanceFields = [];
    const linkFields = [];
    const mediaFields = [];
    const isTextElement = textTags.has(tag) || (element.children.length === 0 && tag !== "img" && tag !== "input" && tag !== "textarea");

    if (isTextElement && tag !== "img" && tag !== "input" && tag !== "textarea" && tag !== "select") {
      contentFields.push({
        key: "textContent",
        label: "Texto visible",
        type: element.textContent?.trim().length > 100 ? "textarea" : "text",
        value: element.textContent?.trim() || "",
        help: "Cambia el mensaje visible del bloque.",
      });
    }

    if (tag === "a" || tag === "button") {
      contentFields.push({
        key: "ariaLabel",
        label: "Etiqueta accesible",
        type: "text",
        value: element.getAttribute("aria-label") || "",
        help: "Ayuda a lectores de pantalla y mejora accesibilidad en botones iconicos.",
      });
    }

    if (tag === "a") {
      linkFields.push(
        {
          key: "href",
          label: "Destino del enlace",
          type: "text",
          value: element.getAttribute("href") || "",
          placeholder: "https://... o #seccion",
        },
        {
          key: "target",
          label: "Como abrir el enlace",
          type: "select",
          value: element.getAttribute("target") || "",
          options: [
            { value: "", label: "Misma pestana" },
            { value: "_blank", label: "Otra pestana" },
          ],
        }
      );
    }

    if (tag === "img") {
      mediaFields.push(
        {
          key: "src",
          label: "URL de la imagen",
          type: "text",
          value: element.getAttribute("src") || "",
          placeholder: "https://...",
        },
        {
          key: "alt",
          label: "Texto alternativo",
          type: "text",
          value: element.getAttribute("alt") || "",
          placeholder: "Descripcion breve",
        }
      );
    }

    if (tag === "input" || tag === "textarea") {
      contentFields.push(
        {
          key: "placeholder",
          label: "Placeholder",
          type: "text",
          value: element.getAttribute("placeholder") || "",
        },
        {
          key: "value",
          label: "Valor inicial",
          type: "text",
          value: element.value || element.getAttribute("value") || "",
        }
      );
    }

    if (tag === "select") {
      contentFields.push({
        key: "value",
        label: "Valor actual",
        type: "text",
        value: element.value || "",
        help: "Solo cambia la opcion activa; no edita el listado de opciones.",
      });
    }

    mediaFields.push({
      key: "backgroundImage",
      label: "Imagen de fondo",
      type: "text",
      value: parseBackgroundImage(element.style.backgroundImage || computed.backgroundImage),
      placeholder: "https://... o linear-gradient(...)",
    });

    appearanceFields.push(
      {
        key: "backgroundColor",
        label: "Color de fondo",
        type: "text",
        value: normalizeCssValue(element.style.backgroundColor || computed.backgroundColor),
        placeholder: "#111111 o rgba(...)",
      },
      {
        key: "color",
        label: "Color del texto",
        type: "text",
        value: normalizeCssValue(element.style.color || computed.color),
        placeholder: "#ffffff o rgb(...)",
      },
      {
        key: "borderRadius",
        label: "Borde redondeado",
        type: "text",
        value: element.style.borderRadius || computed.borderRadius || "",
        placeholder: "18px",
      }
    );

    if (isTextElement && tag !== "img") {
      appearanceFields.push({
        key: "fontSize",
        label: "Tamano de texto",
        type: "text",
        value: element.style.fontSize || computed.fontSize || "",
        placeholder: "clamp(2rem, 4vw, 4rem)",
      });
    }

    if (contentFields.length) groups.push({ title: "Contenido", fields: contentFields });
    if (linkFields.length) groups.push({ title: "Enlace", fields: linkFields });
    if (mediaFields.length) groups.push({ title: "Imagen y fondo", fields: mediaFields });
    if (appearanceFields.length) groups.push({ title: "Apariencia", fields: appearanceFields });

    return groups;
  }

  function captureHistoryCheckpoint() {
    if (runtime.history.burstActive) {
      return;
    }

    runtime.history.past.push(cloneState(state));
    if (runtime.history.past.length > HISTORY_LIMIT) {
      runtime.history.past.shift();
    }
    runtime.history.future.length = 0;
    runtime.history.burstActive = true;
    clearTimeout(runtime.history.burstTimer);
    runtime.history.burstTimer = window.setTimeout(() => {
      runtime.history.burstActive = false;
    }, HISTORY_BURST_MS);
    updateToolbarState();
  }

  function resetHistoryBurst() {
    clearTimeout(runtime.history.burstTimer);
    runtime.history.burstActive = false;
  }

  function updatePageField(field, value) {
    captureHistoryCheckpoint();
    state[field] = typeof value === "string" ? value : "";
    persistState();
    applyState();
    setStatus("Cambio global guardado para esta plantilla.");
  }

  function updateElementField(selector, field, value) {
    const patch = { ...(state.patches[selector] || {}) };
    captureHistoryCheckpoint();
    patch[field] = value;
    state.patches[selector] = patch;
    persistState();
    applyState();
    refreshSelectionReference();
    setStatus("Cambio aplicado sobre la pagina.");
  }

  function undo() {
    if (!runtime.history.past.length) {
      showToast("No hay nada para deshacer todavia.", "muted");
      return;
    }

    resetHistoryBurst();
    runtime.history.future.push(cloneState(state));
    const previous = runtime.history.past.pop();
    replaceState(previous);
    setStatus("Cambio deshecho.");
    showToast("Se deshizo el ultimo cambio.", "info");
  }

  function redo() {
    if (!runtime.history.future.length) {
      showToast("No hay nada para rehacer.", "muted");
      return;
    }

    resetHistoryBurst();
    runtime.history.past.push(cloneState(state));
    const next = runtime.history.future.pop();
    replaceState(next);
    setStatus("Cambio rehecho.");
    showToast("Se recupero el cambio deshecho.", "info");
  }

  function replaceState(nextState) {
    const normalized = normalizeState(nextState);
    state.pageTitle = normalized.pageTitle;
    state.metaDescription = normalized.metaDescription;
    state.customCss = normalized.customCss;
    state.patches = normalized.patches;
    persistState();
    applyState();
    updateToolbarState();
    rerenderActiveSheet();
  }

  function updateToolbarState() {
    if (runtime.ui.undoButton) {
      runtime.ui.undoButton.disabled = !runtime.history.past.length;
    }
    if (runtime.ui.redoButton) {
      runtime.ui.redoButton.disabled = !runtime.history.future.length;
    }
  }

  function applyState() {
    restoreKnownBaseValues();

    document.title = state.pageTitle || basePage.title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", state.metaDescription || basePage.metaDescription);
    }

    let customStyle = document.getElementById("av-editor-custom-style");
    if (!customStyle) {
      customStyle = document.createElement("style");
      customStyle.id = "av-editor-custom-style";
      document.head.appendChild(customStyle);
    }
    customStyle.textContent = state.customCss || "";

    Object.entries(state.patches).forEach(([selector, patch]) => {
      const element = document.querySelector(selector);
      if (!element) {
        return;
      }

      Object.keys(patch).forEach((field) => {
        ensureBaseValue(selector, element, field);
        applyFieldPatch(element, field, patch[field]);
      });
    });
  }

  function ensureBaseValue(selector, element, field) {
    if (!runtime.baseValues[selector]) {
      runtime.baseValues[selector] = {};
    }

    if (Object.prototype.hasOwnProperty.call(runtime.baseValues[selector], field)) {
      return;
    }

    runtime.baseValues[selector][field] = readCurrentFieldValue(element, field);
  }

  function restoreKnownBaseValues() {
    Object.entries(runtime.baseValues).forEach(([selector, fields]) => {
      const element = document.querySelector(selector);
      if (!element) {
        return;
      }

      Object.entries(fields).forEach(([field, value]) => {
        restoreFieldValue(element, field, value);
      });
    });
  }

  function readCurrentFieldValue(element, field) {
    switch (field) {
      case "textContent":
        return element.textContent || "";
      case "href":
      case "src":
      case "alt":
      case "placeholder":
      case "target":
      case "ariaLabel":
        return element.getAttribute(attributeName(field)) || "";
      case "value":
        return element.value ?? (element.getAttribute("value") || "");
      case "backgroundImage":
        return element.style.backgroundImage || "";
      case "backgroundColor":
        return element.style.backgroundColor || "";
      case "color":
        return element.style.color || "";
      case "borderRadius":
        return element.style.borderRadius || "";
      case "fontSize":
        return element.style.fontSize || "";
      default:
        return "";
    }
  }

  function restoreFieldValue(element, field, value) {
    switch (field) {
      case "textContent":
        element.textContent = value || "";
        break;
      case "href":
      case "src":
      case "alt":
      case "placeholder":
      case "target":
      case "ariaLabel":
        if (value) {
          element.setAttribute(attributeName(field), value);
          if (field === "target" && value === "_blank") {
            element.setAttribute("rel", "noopener noreferrer");
          }
        } else {
          element.removeAttribute(attributeName(field));
          if (field === "target") {
            element.removeAttribute("rel");
          }
        }
        break;
      case "value":
        if ("value" in element) {
          element.value = value || "";
        }
        if (value) {
          element.setAttribute("value", value);
        } else {
          element.removeAttribute("value");
        }
        break;
      case "backgroundImage":
      case "backgroundColor":
      case "color":
      case "borderRadius":
      case "fontSize":
        element.style[field] = value || "";
        break;
      default:
        break;
    }
  }

  function applyFieldPatch(element, field, value) {
    switch (field) {
      case "textContent":
        element.textContent = value || "";
        break;
      case "href":
      case "src":
      case "alt":
      case "placeholder":
      case "ariaLabel":
        if (value) {
          element.setAttribute(attributeName(field), value);
        } else {
          element.removeAttribute(attributeName(field));
        }
        break;
      case "target":
        if (value) {
          element.setAttribute("target", value);
          if (value === "_blank") {
            element.setAttribute("rel", "noopener noreferrer");
          }
        } else {
          element.removeAttribute("target");
          element.removeAttribute("rel");
        }
        break;
      case "value":
        if ("value" in element) {
          element.value = value || "";
        }
        if (value) {
          element.setAttribute("value", value);
        } else {
          element.removeAttribute("value");
        }
        break;
      case "backgroundImage":
        element.style.backgroundImage = value ? toBackgroundImage(value) : "";
        break;
      case "backgroundColor":
      case "color":
      case "borderRadius":
      case "fontSize":
        element.style[field] = value || "";
        break;
      default:
        break;
    }
  }

  function attributeName(field) {
    if (field === "ariaLabel") {
      return "aria-label";
    }
    return field;
  }

  function exportJson() {
    downloadBlob(new Blob([JSON.stringify({ slug, state }, null, 2)], { type: "application/json" }), `${slug}-editor.json`);
    setStatus("JSON exportado.");
    showToast("Se descargo el JSON de esta plantilla.", "success");
  }

  function exportHtml() {
    const clone = document.documentElement.cloneNode(true);
    clone.classList.remove("av-editor-on");
    clone.querySelectorAll("[data-av-editor-ui]").forEach((node) => node.remove());
    clone.querySelectorAll("[data-av-editor-hover],[data-av-editor-selected]").forEach((node) => {
      node.removeAttribute("data-av-editor-hover");
      node.removeAttribute("data-av-editor-selected");
    });
    clone.querySelectorAll('script[src*="universal-template-editor.js"]').forEach((node) => node.remove());
    clone.querySelectorAll("#av-editor-runtime-style").forEach((node) => node.remove());

    const html = `<!DOCTYPE html>\n${clone.outerHTML}`;
    downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }), `${slug}.html`);
    setStatus("HTML final exportado.");
    showToast("Se descargo una version HTML lista para revisar.", "success");
  }

  async function importState(file) {
    if (!file) {
      return;
    }

    try {
      const payload = JSON.parse(await file.text());
      captureHistoryCheckpoint();
      replaceState(payload?.state || payload);
      closeSheet();
      setStatus("JSON importado y aplicado.");
      showToast("Importacion completada.", "success");
    } catch (error) {
      console.error(error);
      setStatus("No se pudo importar el archivo.");
      showToast("No pude importar ese archivo.", "danger");
    }
  }

  function resetState() {
    localStorage.removeItem(storageKey);
    runtime.history.past.length = 0;
    runtime.history.future.length = 0;
    runtime.baseValues = {};
    replaceState({});
    closeSheet();
    setStatus("La plantilla volvio a su estado base.");
    showToast("Se borraron los cambios guardados.", "success");
  }

  function downloadBlob(blob, filename) {
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  function closeSheet() {
    runtime.selection = createSelectionState();
    clearSelected();
    runtime.ui.sheet.dataset.state = "closed";
    runtime.ui.sheetEyebrow.textContent = "Sin seleccion";
    runtime.ui.sheetTitle.textContent = "Toca un bloque para editarlo";
    runtime.ui.sheetSubtitle.textContent = "Los cambios se guardan localmente por plantilla.";
    runtime.ui.sheetBody.innerHTML = '<div class="av-editor-empty-state"><p>Selecciona un titular, boton, imagen o seccion para editarla aqui mismo.</p></div>';
    runtime.ui.sheetStatus.textContent = "Listo para editar sobre la pagina.";
  }

  function refreshSelectionReference() {
    if (!runtime.selection.selector) {
      return;
    }

    runtime.selection.element = document.querySelector(runtime.selection.selector);
    if (runtime.selection.element) {
      markSelected(runtime.selection.element);
    }
  }

  function rerenderActiveSheet() {
    if (runtime.selection.mode === "page") {
      renderPageSheet();
      return;
    }

    if (runtime.selection.mode === "element" && runtime.selection.selector) {
      const element = document.querySelector(runtime.selection.selector);
      if (element) {
        runtime.selection.element = element;
        runtime.selection.title = getFriendlyLabel(element);
        runtime.selection.subtitle = getSelectionContext(element);
        renderElementSheet(element, runtime.selection.selector);
        return;
      }
    }

    closeSheet();
  }

  function confirmAction(config) {
    runtime.confirmAction = config.onConfirm;
    runtime.ui.modalTitle.textContent = config.title;
    runtime.ui.modalBody.textContent = config.body;
    runtime.ui.modalConfirm.textContent = config.confirmLabel || "Continuar";
    runtime.ui.modal.hidden = false;
  }

  function closeModal() {
    runtime.confirmAction = null;
    runtime.ui.modal.hidden = true;
  }

  function showToast(message, tone) {
    const toast = document.createElement("div");
    toast.className = `av-editor-toast av-editor-toast-${tone || "info"}`;
    toast.textContent = message;
    runtime.ui.toasts.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.add("is-leaving");
      window.setTimeout(() => toast.remove(), 220);
    }, 2600);
  }

  function findSelectableTarget(target) {
    let current = target?.nodeType === Node.ELEMENT_NODE ? target : target?.parentElement;

    while (current && current !== document.body) {
      if (current.closest("[data-av-editor-ui]")) {
        return null;
      }

      if (isExplicitEditable(current)) {
        return current;
      }

      if (isPreferredLeaf(current)) {
        return current;
      }

      current = current.parentElement;
    }

    current = target?.nodeType === Node.ELEMENT_NODE ? target : target?.parentElement;
    while (current && current !== document.body) {
      if (isSelectableContainer(current)) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  function isExplicitEditable(element) {
    return element?.hasAttribute("data-av-edit-label") || element?.hasAttribute("data-av-editor-key") || element?.hasAttribute("data-editor-section");
  }

  function isPreferredLeaf(element) {
    if (!isSelectable(element)) {
      return false;
    }

    const tag = element.tagName.toLowerCase();
    if (tag === "img" || tag === "input" || tag === "textarea" || tag === "select") {
      return true;
    }
    if (tag === "a" || tag === "button") {
      return true;
    }
    if (textTags.has(tag)) {
      return element.textContent?.trim().length > 0;
    }
    return false;
  }

  function isSelectableContainer(element) {
    if (!isSelectable(element)) {
      return false;
    }

    const tag = element.tagName.toLowerCase();
    if (!containerTags.has(tag)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const hasBackground = Boolean(parseBackgroundImage(element.style.backgroundImage || window.getComputedStyle(element).backgroundImage));
    return rect.width > 60 && rect.height > 40 && (hasBackground || element.id || element.classList.length > 0);
  }

  function isSelectable(element) {
    if (!element || element.closest("[data-av-editor-ui]")) {
      return false;
    }

    const tag = element.tagName.toLowerCase();
    if (blockedTags.has(tag)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 8 && rect.height > 8;
  }

  function buildSelector(element) {
    if (element.hasAttribute("data-av-editor-key")) {
      const key = element.getAttribute("data-av-editor-key");
      const selector = `[data-av-editor-key="${escapeSelectorValue(key)}"]`;
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }

    if (element.id) {
      const byId = `#${escapeSelector(element.id)}`;
      if (document.querySelectorAll(byId).length === 1) {
        return byId;
      }
    }

    const parts = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      let segment = current.tagName.toLowerCase();

      if (current.hasAttribute("data-editor-section")) {
        segment += `[data-editor-section="${escapeSelectorValue(current.getAttribute("data-editor-section"))}"]`;
      }
      if (current.hasAttribute("data-editor-item-index")) {
        segment += `[data-editor-item-index="${escapeSelectorValue(current.getAttribute("data-editor-item-index"))}"]`;
      }
      if (current.hasAttribute("data-editor-gallery-index")) {
        segment += `[data-editor-gallery-index="${escapeSelectorValue(current.getAttribute("data-editor-gallery-index"))}"]`;
      }

      if (!segment.includes("[data-")) {
        const usableClasses = [...current.classList].filter((item) => !item.startsWith("is-") && !item.startsWith("has-")).slice(0, 2);
        if (usableClasses.length) {
          segment += usableClasses.map((item) => `.${escapeSelector(item)}`).join("");
        }
      }

      if (current.parentElement) {
        const siblings = [...current.parentElement.children].filter((item) => item.tagName === current.tagName);
        if (siblings.length > 1) {
          segment += `:nth-of-type(${siblings.indexOf(current) + 1})`;
        }
      }

      parts.unshift(segment);
      const selector = parts.join(" > ");
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
      current = current.parentElement;
    }

    return parts.join(" > ");
  }

  function markSelected(element) {
    clearSelected();
    element.setAttribute("data-av-editor-selected", "true");
  }

  function clearSelected() {
    document.querySelectorAll("[data-av-editor-selected],[data-av-editor-hover]").forEach((node) => {
      node.removeAttribute("data-av-editor-selected");
      node.removeAttribute("data-av-editor-hover");
    });
  }

  function clearHover() {
    document.querySelectorAll("[data-av-editor-hover]").forEach((node) => {
      if (!node.hasAttribute("data-av-editor-selected")) {
        node.removeAttribute("data-av-editor-hover");
      }
    });
  }

  function setStatus(message) {
    runtime.ui.status.textContent = message;
    runtime.ui.sheetStatus.textContent = message;
  }

  function getFriendlyLabel(element) {
    if (element.getAttribute("data-av-edit-label")) {
      return element.getAttribute("data-av-edit-label");
    }
    if (element.getAttribute("data-editor-section")) {
      return `Seccion ${humanizeToken(element.getAttribute("data-editor-section"))}`;
    }

    const tag = element.tagName.toLowerCase();
    if (tag === "h1") return "Titular principal";
    if (tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") return "Titular";
    if (tag === "p" || tag === "blockquote" || tag === "li") return "Texto";
    if (tag === "a") return "Boton o enlace";
    if (tag === "button") return "Boton";
    if (tag === "img") return "Imagen";
    if (tag === "input" || tag === "textarea" || tag === "select") return "Campo de formulario";
    if (tag === "section" || tag === "article" || tag === "header" || tag === "main") {
      return `Bloque ${humanizeToken(element.id || element.classList[0] || "principal")}`;
    }

    return humanizeToken(element.classList[0] || tag);
  }

  function getSelectionContext(element) {
    const sectionOwner = element.closest("[data-editor-section], section[id], header[id], main, section, article");
    if (!sectionOwner || sectionOwner === element) {
      return "Cambia contenido y apariencia sobre la pagina real.";
    }

    if (sectionOwner.getAttribute("data-editor-section")) {
      return `Dentro de ${humanizeToken(sectionOwner.getAttribute("data-editor-section"))}`;
    }

    if (sectionOwner.id) {
      return `Dentro de ${humanizeToken(sectionOwner.id)}`;
    }

    return `Dentro de ${humanizeToken(sectionOwner.classList[0] || sectionOwner.tagName.toLowerCase())}`;
  }

  function describeElement(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const classes = [...element.classList].slice(0, 2).map((item) => `.${item}`).join("");
    return `${tag}${id}${classes}`;
  }

  function humanizeToken(value) {
    return String(value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (match) => match.toUpperCase()) || "Elemento";
  }

  function parseBackgroundImage(value) {
    if (!value || value === "none") {
      return "";
    }
    const match = value.match(/url\((['"]?)(.*?)\1\)/i);
    return match ? match[2] : value;
  }

  function toBackgroundImage(value) {
    const trimmed = String(value || "").trim();
    if (!trimmed) {
      return "";
    }
    if (trimmed.startsWith("url(") || trimmed.startsWith("linear-gradient(")) {
      return trimmed;
    }
    return `url("${trimmed.replace(/"/g, '\\"')}")`;
  }

  function normalizeCssValue(value) {
    return value && value !== "rgba(0, 0, 0, 0)" ? value : "";
  }

  function escapeSelector(value) {
    return window.CSS?.escape ? window.CSS.escape(value) : String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function escapeSelectorValue(value) {
    return String(value ?? "").replace(/"/g, '\\"');
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.id = "av-editor-runtime-style";
    style.textContent = `
      .av-editor-on [data-av-editor-hover]{outline:2px dashed rgba(77,173,255,.95)!important;outline-offset:4px!important;}
      .av-editor-on [data-av-editor-selected]{outline:3px solid rgba(255,110,57,.98)!important;outline-offset:4px!important;box-shadow:0 0 0 6px rgba(255,110,57,.18)!important;}
      .av-editor-shell,.av-editor-shell *{box-sizing:border-box;}
      .av-editor-shell{position:fixed;inset:0;z-index:100000;pointer-events:none;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
      .av-editor-toolbar,.av-editor-toast-stack,.av-editor-sheet-panel,.av-editor-modal{pointer-events:auto;}
      .av-editor-toolbar{position:fixed;top:14px;left:14px;right:14px;display:grid;gap:12px;padding:14px;border-radius:22px;background:rgba(12,12,12,.94);border:1px solid rgba(255,255,255,.12);box-shadow:0 26px 60px rgba(0,0,0,.28);backdrop-filter:blur(14px);}
      .av-editor-toolbar-copy{display:grid;gap:4px;min-width:0;}
      .av-editor-toolbar-copy small{margin:0;color:rgba(255,255,255,.58);font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
      .av-editor-toolbar-copy strong{color:#fff;font-size:.96rem;line-height:1.35;}
      .av-editor-toolbar-actions{display:flex;gap:8px;overflow:auto;padding-bottom:2px;}
      .av-editor-toolbar-actions::-webkit-scrollbar{height:0;}
      .av-editor-toolbar-actions a,.av-editor-toolbar-actions button,.av-editor-sheet-head button,.av-editor-sheet-foot button,.av-editor-modal-actions button{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 13px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;text-decoration:none;font:600 .82rem/1 inherit;cursor:pointer;white-space:nowrap;}
      .av-editor-toolbar-actions button:disabled{opacity:.42;cursor:not-allowed;}
      .av-editor-toast-stack{position:fixed;top:112px;right:14px;width:min(360px,calc(100vw - 28px));display:grid;gap:10px;}
      .av-editor-toast{padding:12px 14px;border-radius:16px;border:1px solid rgba(255,255,255,.12);color:#fff;font-size:.84rem;line-height:1.4;background:rgba(15,15,15,.95);box-shadow:0 20px 40px rgba(0,0,0,.24);transition:opacity .2s ease,transform .2s ease;}
      .av-editor-toast-success{border-color:rgba(91,201,132,.34);}
      .av-editor-toast-danger{border-color:rgba(241,99,99,.34);}
      .av-editor-toast-muted{border-color:rgba(255,255,255,.08);}
      .av-editor-toast.is-leaving{opacity:0;transform:translateY(-6px);}
      .av-editor-sheet{position:fixed;left:14px;right:14px;bottom:14px;display:flex;justify-content:flex-end;}
      .av-editor-sheet[data-state="closed"]{pointer-events:none;}
      .av-editor-sheet-panel{width:min(460px,calc(100vw - 28px));max-height:min(72vh,780px);display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;border-radius:24px;background:rgba(14,14,14,.97);border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 70px rgba(0,0,0,.34);overflow:hidden;transform:translateY(18px);opacity:0;transition:transform .22s ease,opacity .22s ease;}
      .av-editor-sheet[data-state="open"] .av-editor-sheet-panel{transform:translateY(0);opacity:1;}
      .av-editor-sheet-handle{width:54px;height:6px;margin:10px auto 0;border-radius:999px;background:rgba(255,255,255,.16);}
      .av-editor-sheet-head,.av-editor-sheet-foot{padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);}
      .av-editor-sheet-foot{border-top:1px solid rgba(255,255,255,.08);border-bottom:0;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
      .av-editor-sheet-head{display:flex;align-items:start;justify-content:space-between;gap:14px;}
      .av-editor-sheet-head small,.av-editor-group-head strong,.av-editor-field span,.av-editor-modal small{display:block;color:rgba(255,255,255,.58);font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
      .av-editor-sheet-head strong,.av-editor-modal strong{display:block;color:#fff;font-size:1.06rem;line-height:1.25;}
      .av-editor-sheet-head p,.av-editor-sheet-foot span,.av-editor-empty-state p,.av-editor-field small,.av-editor-modal p{margin:8px 0 0;color:rgba(255,255,255,.66);font-size:.86rem;line-height:1.45;}
      .av-editor-sheet-body{padding:0 18px 18px;overflow:auto;display:grid;gap:14px;}
      .av-editor-sheet-meta{display:flex;flex-wrap:wrap;gap:8px;padding-top:2px;}
      .av-editor-sheet-meta span{display:inline-flex;align-items:center;min-height:28px;padding:0 10px;border-radius:999px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.68);font-size:.74rem;line-height:1;}
      .av-editor-group{display:grid;gap:10px;padding:14px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);}
      .av-editor-field-list{display:grid;gap:12px;}
      .av-editor-field{display:grid;gap:6px;}
      .av-editor-field input,.av-editor-field textarea,.av-editor-field select{width:100%;padding:12px 13px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#fff;font:inherit;}
      .av-editor-field textarea{min-height:108px;resize:vertical;}
      .av-editor-advanced{padding:14px;border-radius:18px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);}
      .av-editor-advanced summary{cursor:pointer;color:#fff;font-size:.86rem;font-weight:600;}
      .av-editor-modal{position:fixed;inset:0;}
      .av-editor-modal-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.54);}
      .av-editor-modal-card{position:absolute;left:50%;top:50%;width:min(420px,calc(100vw - 28px));padding:18px;border-radius:22px;background:rgba(16,16,16,.98);border:1px solid rgba(255,255,255,.12);box-shadow:0 28px 60px rgba(0,0,0,.34);transform:translate(-50%,-50%);}
      .av-editor-modal-actions,.av-editor-sheet-foot-actions{display:flex;gap:8px;flex-wrap:wrap;}
      @media (max-width: 760px){
        .av-editor-toolbar{top:10px;left:10px;right:10px;padding:12px;border-radius:18px;}
        .av-editor-toast-stack{top:104px;right:10px;width:calc(100vw - 20px);}
        .av-editor-sheet{left:8px;right:8px;bottom:8px;}
        .av-editor-sheet-panel{width:100%;max-height:78vh;border-radius:22px;}
        .av-editor-sheet-head,.av-editor-sheet-foot,.av-editor-sheet-body{padding-left:14px;padding-right:14px;}
      }
    `;
    document.head.appendChild(style);
  }
})();
