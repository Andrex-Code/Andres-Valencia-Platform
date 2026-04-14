(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("edit") !== "1") {
    return;
  }

  const slug = resolveTemplateSlug();
  const storageKey = `av-template-editor::${slug}`;
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

  const publicUrl = buildPublicUrl();
  const pickerUrl = new URL(`../../editor.html?template=${encodeURIComponent(slug)}`, window.location.href).toString();
  const basePage = {
    title: document.title,
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute("content") || "",
  };
  const state = loadState();
  let activeSelection = { mode: "element", selector: "", element: null };
  let ui = null;

  injectStyles();
  buildUi();
  document.documentElement.classList.add("av-editor-on");
  document.body.classList.add("av-editor-on");
  applyState();
  bindEvents();
  setStatus("Haz clic en cualquier bloque para editarlo aqui mismo.");

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
    return {
      pageTitle: typeof value?.pageTitle === "string" ? value.pageTitle : "",
      metaDescription: typeof value?.metaDescription === "string" ? value.metaDescription : "",
      customCss: typeof value?.customCss === "string" ? value.customCss : "",
      patches: value?.patches && typeof value.patches === "object" ? value.patches : {},
    };
  }

  function loadState() {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(storageKey) || "{}"));
    } catch (error) {
      console.warn(error);
      return normalizeState({});
    }
  }

  function persistState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function buildUi() {
    const shell = document.createElement("div");
    shell.setAttribute("data-av-editor-ui", "true");
    shell.innerHTML = `
      <div class="av-editor-toolbar" data-av-editor-ui="true">
        <div class="av-editor-brand">
          <strong>Editor visual</strong>
          <span id="avEditorStatus">Haz clic en cualquier bloque para editar.</span>
        </div>
        <div class="av-editor-actions">
          <a href="${escapeHtml(pickerUrl)}" target="_blank" rel="noopener noreferrer">Plantillas</a>
          <button type="button" data-editor-action="page">Pagina</button>
          <button type="button" data-editor-action="export">Exportar</button>
          <button type="button" data-editor-action="import">Importar</button>
          <button type="button" data-editor-action="reset">Restablecer</button>
          <a href="${escapeHtml(publicUrl)}" target="_blank" rel="noopener noreferrer">Ver demo</a>
        </div>
        <input type="file" id="avEditorImportFile" accept="application/json" hidden />
      </div>
      <div class="av-editor-bubble" id="avEditorBubble" hidden data-av-editor-ui="true"></div>
    `;

    document.body.appendChild(shell);

    ui = {
      shell,
      bubble: shell.querySelector("#avEditorBubble"),
      status: shell.querySelector("#avEditorStatus"),
      importFile: shell.querySelector("#avEditorImportFile"),
      toolbar: shell.querySelector(".av-editor-toolbar"),
    };
  }

  function bindEvents() {
    document.addEventListener("mouseover", handleHover, true);
    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("resize", refreshBubblePosition);
    window.addEventListener("scroll", refreshBubblePosition, true);
    document.addEventListener("keydown", handleKeydown);

    ui.shell.addEventListener("click", handleUiClick);
    ui.shell.addEventListener("input", handleUiInput);
    ui.shell.addEventListener("change", handleUiInput);
    ui.importFile.addEventListener("change", (event) => {
      importState(event.target.files?.[0]);
      event.target.value = "";
    });
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      closeBubble();
    }
  }

  function handleUiClick(event) {
    const action = event.target.closest("[data-editor-action]");
    if (!action) {
      return;
    }

    if (action.dataset.editorAction === "page") {
      renderPageBubble();
    }

    if (action.dataset.editorAction === "close") {
      closeBubble();
    }

    if (action.dataset.editorAction === "export") {
      exportState();
    }

    if (action.dataset.editorAction === "import") {
      ui.importFile.click();
    }

    if (action.dataset.editorAction === "reset") {
      resetState();
    }
  }

  function handleUiInput(event) {
    const field = event.target?.dataset?.editorField;
    if (!field) {
      return;
    }

    if (activeSelection.mode === "page") {
      state[field] = event.target.value;
      persistState();
      applyState();
      setStatus("Ajuste global guardado para esta plantilla.");
      return;
    }

    if (!activeSelection.selector) {
      return;
    }

    const patch = state.patches[activeSelection.selector] || {};
    patch[field] = event.target.value;
    state.patches[activeSelection.selector] = patch;
    persistState();
    applyState();
    refreshActiveElement();
    setStatus("Cambio aplicado sobre la demo.");
  }

  function handleHover(event) {
    if (event.target.closest("[data-av-editor-ui]")) {
      return;
    }

    document.querySelectorAll("[data-av-editor-hover]").forEach((node) => {
      if (!node.hasAttribute("data-av-editor-selected")) {
        node.removeAttribute("data-av-editor-hover");
      }
    });

    const element = findSelectableTarget(event.target);
    if (element && !element.hasAttribute("data-av-editor-selected")) {
      element.setAttribute("data-av-editor-hover", "true");
    }
  }

  function handleDocumentClick(event) {
    if (event.target.closest("[data-av-editor-ui]")) {
      return;
    }

    const element = findSelectableTarget(event.target);
    if (!element) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    selectElement(element);
  }

  function selectElement(element) {
    const selector = buildSelector(element);
    activeSelection = { mode: "element", selector, element };
    markSelected(element);
    renderElementBubble(element, selector);
  }

  function renderElementBubble(element, selector) {
    const fields = getElementFields(element);
    ui.bubble.innerHTML = `
      <div class="av-editor-card" data-av-editor-ui="true">
        <div class="av-editor-card-head">
          <div>
            <small>Elemento seleccionado</small>
            <strong>${escapeHtml(describeElement(element))}</strong>
          </div>
          <button type="button" data-editor-action="close">Cerrar</button>
        </div>
        <code>${escapeHtml(selector)}</code>
        <div class="av-editor-field-list">
          ${fields.map(buildField).join("") || '<p class="av-editor-empty">Este bloque no expone campos directos. Prueba otro elemento mas puntual.</p>'}
        </div>
      </div>
    `;
    ui.bubble.hidden = false;
    requestAnimationFrame(() => positionBubble(element.getBoundingClientRect()));
  }

  function renderPageBubble() {
    activeSelection = { mode: "page", selector: "", element: null };
    clearSelected();
    ui.bubble.innerHTML = `
      <div class="av-editor-card" data-av-editor-ui="true">
        <div class="av-editor-card-head">
          <div>
            <small>Ajustes de la pagina</small>
            <strong>${escapeHtml(slug)}</strong>
          </div>
          <button type="button" data-editor-action="close">Cerrar</button>
        </div>
        <div class="av-editor-field-list">
          ${buildField({ key: "pageTitle", label: "Titulo SEO", type: "text", value: state.pageTitle || basePage.title, help: "Cambia el titulo de la pestana." })}
          ${buildField({ key: "metaDescription", label: "Descripcion SEO", type: "textarea", value: state.metaDescription || basePage.metaDescription, help: "Ideal para buscadores y redes." })}
          ${buildField({ key: "customCss", label: "CSS adicional", type: "textarea", value: state.customCss || "", help: "Ajustes extra para esta plantilla sin tocar el archivo base." })}
        </div>
      </div>
    `;
    ui.bubble.hidden = false;
    requestAnimationFrame(() => positionBubble(ui.toolbar.getBoundingClientRect()));
  }

  function buildField(field) {
    if (field.type === "textarea") {
      return `<label class="av-editor-field"><span>${escapeHtml(field.label)}</span><textarea data-editor-field="${escapeHtml(field.key)}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(field.value || "")}</textarea>${field.help ? `<small>${escapeHtml(field.help)}</small>` : ""}</label>`;
    }

    if (field.type === "select") {
      return `<label class="av-editor-field"><span>${escapeHtml(field.label)}</span><select data-editor-field="${escapeHtml(field.key)}">${(field.options || []).map((option) => `<option value="${escapeHtml(option.value)}"${option.value === field.value ? " selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select>${field.help ? `<small>${escapeHtml(field.help)}</small>` : ""}</label>`;
    }

    return `<label class="av-editor-field"><span>${escapeHtml(field.label)}</span><input type="${escapeHtml(field.type || "text")}" data-editor-field="${escapeHtml(field.key)}" value="${escapeHtml(field.value || "")}" placeholder="${escapeHtml(field.placeholder || "")}" />${field.help ? `<small>${escapeHtml(field.help)}</small>` : ""}</label>`;
  }

  function getElementFields(element) {
    const tag = element.tagName.toLowerCase();
    const computed = window.getComputedStyle(element);
    const fields = [];
    const textOnly = element.children.length === 0 || textTags.has(tag);

    if (textOnly && tag !== "img" && tag !== "input" && tag !== "textarea") {
      fields.push({
        key: "textContent",
        label: "Texto visible",
        type: "textarea",
        value: element.textContent?.trim() || "",
        help: "Cambia el contenido visible del elemento.",
      });
    }

    if (tag === "a") {
      fields.push(
        { key: "href", label: "Destino del enlace", type: "text", value: element.getAttribute("href") || "", placeholder: "https://..." },
        { key: "target", label: "Apertura del enlace", type: "select", value: element.getAttribute("target") || "", options: [{ value: "", label: "Misma pestana" }, { value: "_blank", label: "Otra pestana" }] }
      );
    }

    if (tag === "img") {
      fields.push(
        { key: "src", label: "URL de la imagen", type: "text", value: element.getAttribute("src") || "", placeholder: "https://..." },
        { key: "alt", label: "Texto alternativo", type: "text", value: element.getAttribute("alt") || "", placeholder: "Descripcion breve" }
      );
    }

    if (tag === "input" || tag === "textarea") {
      fields.push(
        { key: "placeholder", label: "Placeholder", type: "text", value: element.getAttribute("placeholder") || "" },
        { key: "value", label: "Valor inicial", type: "text", value: element.value || element.getAttribute("value") || "" }
      );
    }

    fields.push(
      { key: "backgroundImage", label: "Imagen de fondo", type: "text", value: parseBackgroundImage(element.style.backgroundImage || computed.backgroundImage), placeholder: "https://... o linear-gradient(...)" },
      { key: "backgroundColor", label: "Color de fondo", type: "text", value: normalizeCssValue(element.style.backgroundColor || computed.backgroundColor), placeholder: "#111111 o rgba(...)" },
      { key: "color", label: "Color del texto", type: "text", value: normalizeCssValue(element.style.color || computed.color), placeholder: "#ffffff o rgb(...)" },
      { key: "borderRadius", label: "Borde redondeado", type: "text", value: element.style.borderRadius || computed.borderRadius || "", placeholder: "18px" }
    );

    if (textOnly && tag !== "img") {
      fields.push({ key: "fontSize", label: "Tamano de texto", type: "text", value: element.style.fontSize || computed.fontSize || "", placeholder: "clamp(2rem, 4vw, 4rem)" });
    }

    return fields;
  }

  function applyState() {
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
      if (element) {
        applyPatchToElement(element, patch);
      }
    });
  }

  function applyPatchToElement(element, patch) {
    if (Object.prototype.hasOwnProperty.call(patch, "textContent")) {
      element.textContent = patch.textContent;
    }
    if (Object.prototype.hasOwnProperty.call(patch, "href")) {
      patch.href ? element.setAttribute("href", patch.href) : element.removeAttribute("href");
    }
    if (Object.prototype.hasOwnProperty.call(patch, "target")) {
      if (patch.target) {
        element.setAttribute("target", patch.target);
        if (patch.target === "_blank") {
          element.setAttribute("rel", "noopener noreferrer");
        }
      } else {
        element.removeAttribute("target");
      }
    }
    if (Object.prototype.hasOwnProperty.call(patch, "src")) {
      patch.src ? element.setAttribute("src", patch.src) : element.removeAttribute("src");
    }
    if (Object.prototype.hasOwnProperty.call(patch, "alt")) {
      patch.alt ? element.setAttribute("alt", patch.alt) : element.removeAttribute("alt");
    }
    if (Object.prototype.hasOwnProperty.call(patch, "placeholder")) {
      patch.placeholder ? element.setAttribute("placeholder", patch.placeholder) : element.removeAttribute("placeholder");
    }
    if (Object.prototype.hasOwnProperty.call(patch, "value")) {
      element.value = patch.value;
      patch.value ? element.setAttribute("value", patch.value) : element.removeAttribute("value");
    }
    if (Object.prototype.hasOwnProperty.call(patch, "backgroundImage")) {
      element.style.backgroundImage = patch.backgroundImage ? toBackgroundImage(patch.backgroundImage) : "";
    }
    if (Object.prototype.hasOwnProperty.call(patch, "backgroundColor")) {
      element.style.backgroundColor = patch.backgroundColor || "";
    }
    if (Object.prototype.hasOwnProperty.call(patch, "color")) {
      element.style.color = patch.color || "";
    }
    if (Object.prototype.hasOwnProperty.call(patch, "borderRadius")) {
      element.style.borderRadius = patch.borderRadius || "";
    }
    if (Object.prototype.hasOwnProperty.call(patch, "fontSize")) {
      element.style.fontSize = patch.fontSize || "";
    }
  }

  function refreshActiveElement() {
    if (!activeSelection.selector) {
      return;
    }

    activeSelection.element = document.querySelector(activeSelection.selector);
    if (activeSelection.element) {
      markSelected(activeSelection.element);
      if (activeSelection.mode === "element") {
        positionBubble(activeSelection.element.getBoundingClientRect());
      }
    }
  }

  function exportState() {
    const blob = new Blob([JSON.stringify({ slug, state }, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${slug}-editor.json`;
    anchor.click();
    URL.revokeObjectURL(href);
    setStatus("JSON exportado para esta plantilla.");
  }

  async function importState(file) {
    if (!file) {
      return;
    }

    try {
      const payload = JSON.parse(await file.text());
      const imported = normalizeState(payload?.state || payload);
      state.pageTitle = imported.pageTitle;
      state.metaDescription = imported.metaDescription;
      state.customCss = imported.customCss;
      state.patches = imported.patches;
      persistState();
      applyState();
      closeBubble();
      setStatus("JSON importado y aplicado a la demo.");
    } catch (error) {
      console.error(error);
      setStatus("No se pudo importar el archivo.");
    }
  }

  function resetState() {
    if (!window.confirm("Esto borrara los cambios guardados localmente para esta plantilla. Quieres seguir?")) {
      return;
    }

    localStorage.removeItem(storageKey);
    window.location.reload();
  }

  function closeBubble() {
    activeSelection = { mode: "element", selector: "", element: null };
    clearSelected();
    ui.bubble.hidden = true;
    ui.bubble.innerHTML = "";
  }

  function positionBubble(rect) {
    if (!rect || ui.bubble.hidden) {
      return;
    }

    const bubbleRect = ui.bubble.getBoundingClientRect();
    let left = rect.right + 16;
    let top = rect.top + 8;

    if (left + bubbleRect.width > window.innerWidth - 16) {
      left = rect.left - bubbleRect.width - 16;
    }
    if (left < 16) {
      left = Math.max(16, window.innerWidth - bubbleRect.width - 16);
    }
    if (top + bubbleRect.height > window.innerHeight - 16) {
      top = window.innerHeight - bubbleRect.height - 16;
    }
    if (top < 74) {
      top = 74;
    }

    ui.bubble.style.transform = `translate(${left}px, ${top}px)`;
  }

  function refreshBubblePosition() {
    if (ui.bubble.hidden) {
      return;
    }

    if (activeSelection.mode === "page") {
      positionBubble(ui.toolbar.getBoundingClientRect());
      return;
    }

    if (activeSelection.element) {
      positionBubble(activeSelection.element.getBoundingClientRect());
    }
  }

  function findSelectableTarget(target) {
    let element = target?.nodeType === Node.ELEMENT_NODE ? target : target?.parentElement;
    const preferred = element?.closest("img, a, button, input, textarea, select");
    if (preferred && !preferred.closest("[data-av-editor-ui]")) {
      element = preferred;
    }

    while (element && element !== document.body) {
      if (isSelectable(element)) {
        return element;
      }
      element = element.parentElement;
    }

    return null;
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
      const usableClasses = [...current.classList].filter((item) => !item.startsWith("is-") && !item.startsWith("has-")).slice(0, 2);
      if (usableClasses.length) {
        segment += usableClasses.map((item) => `.${escapeSelector(item)}`).join("");
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
    document.querySelectorAll("[data-av-editor-selected]").forEach((node) => node.removeAttribute("data-av-editor-selected"));
    document.querySelectorAll("[data-av-editor-hover]").forEach((node) => node.removeAttribute("data-av-editor-hover"));
  }

  function setStatus(message) {
    ui.status.textContent = message;
  }

  function describeElement(element) {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";
    const classes = [...element.classList].slice(0, 2).map((item) => `.${item}`).join("");
    return `${tag}${id}${classes}`;
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

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .av-editor-on [data-av-editor-hover]{outline:2px dashed rgba(36,166,255,.9)!important;outline-offset:4px!important;}
      .av-editor-on [data-av-editor-selected]{outline:3px solid rgba(255,104,46,.96)!important;outline-offset:4px!important;box-shadow:0 0 0 6px rgba(255,104,46,.18)!important;}
      .av-editor-toolbar,.av-editor-bubble,.av-editor-card,.av-editor-card *{box-sizing:border-box;}
      .av-editor-toolbar{position:fixed;left:16px;right:16px;top:16px;z-index:100000;display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:14px 16px;border-radius:24px;background:rgba(12,12,12,.94);border:1px solid rgba(255,255,255,.12);box-shadow:0 28px 60px rgba(0,0,0,.28);backdrop-filter:blur(14px);}
      .av-editor-brand{display:grid;gap:4px;color:#fff;}
      .av-editor-brand strong{font-size:.95rem;letter-spacing:.04em;text-transform:uppercase;}
      .av-editor-brand span{font-size:.84rem;color:rgba(255,255,255,.72);}
      .av-editor-actions{display:flex;gap:8px;flex-wrap:wrap;}
      .av-editor-actions a,.av-editor-actions button{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;text-decoration:none;font:600 .82rem/1 inherit;cursor:pointer;}
      .av-editor-bubble{position:fixed;left:0;top:0;z-index:100001;width:min(360px,calc(100vw - 24px));}
      .av-editor-card{display:grid;gap:14px;padding:18px;border-radius:22px;background:rgba(14,14,14,.97);border:1px solid rgba(255,255,255,.12);box-shadow:0 24px 60px rgba(0,0,0,.28);color:#fff;max-height:min(78vh,720px);overflow:auto;}
      .av-editor-card-head{display:flex;align-items:start;justify-content:space-between;gap:12px;}
      .av-editor-card-head small,.av-editor-field span{display:block;margin-bottom:6px;color:rgba(255,255,255,.62);font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
      .av-editor-card-head strong{display:block;font-size:1rem;}
      .av-editor-card-head button{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:transparent;color:#fff;cursor:pointer;}
      .av-editor-card code{font-size:.76rem;color:#8fc9ff;word-break:break-all;}
      .av-editor-field-list{display:grid;gap:12px;}
      .av-editor-field{display:grid;gap:6px;}
      .av-editor-field input,.av-editor-field textarea,.av-editor-field select{width:100%;padding:11px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#fff;font:inherit;}
      .av-editor-field textarea{min-height:96px;resize:vertical;}
      .av-editor-field small,.av-editor-empty{color:rgba(255,255,255,.62);font-size:.78rem;line-height:1.45;}
      @media (max-width: 760px){.av-editor-toolbar{left:10px;right:10px;top:10px;padding:12px;}.av-editor-bubble{width:calc(100vw - 20px);} }
    `;
    document.head.appendChild(style);
  }
})();
