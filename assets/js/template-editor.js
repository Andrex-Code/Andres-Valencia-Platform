(function () {
  const path = window.location.pathname.replace(/\\/g, "/");
  const templateKey = path.includes("/templates/gym/")
    ? "gym"
    : path.includes("/templates/restaurant/")
      ? "restaurant"
      : path.includes("/templates/tattoo-studio/")
        ? "tattoo"
        : null;

  if (!templateKey) {
    return;
  }

  const configs = {
    gym: {
      name: "IRONFORM Gym",
      fields: [
        { id: "heroEyebrow", label: "Hero · etiqueta", type: "text", input: "text", selectors: [".hero__eyebrow .eyebrow"] },
        { id: "heroTitle", label: "Hero · titulo", type: "html", input: "textarea", selectors: [".hero__title"], help: "Puedes usar <br> y <em>." },
        { id: "heroSub", label: "Hero · descripcion", type: "text", input: "textarea", selectors: [".hero__sub"] },
        { id: "heroPrimaryText", label: "Hero · CTA principal", type: "text", input: "text", selectors: [".hero__actions .btn-primary span"] },
        { id: "heroPrimaryHref", label: "Hero · link CTA principal", type: "attr", attr: "href", input: "text", selectors: [".hero__actions .btn-primary"] },
        { id: "aboutTitle", label: "Nosotros · titulo", type: "html", input: "textarea", selectors: [".about__title"], help: "Puedes usar <br> y <em>." },
        { id: "aboutText1", label: "Nosotros · parrafo 1", type: "text", input: "textarea", selectors: [".about__content .about__text:nth-of-type(1)"] },
        { id: "aboutText2", label: "Nosotros · parrafo 2", type: "text", input: "textarea", selectors: [".about__content .about__text:nth-of-type(2)"] },
        { id: "classesTitle", label: "Clases · titulo", type: "html", input: "textarea", selectors: [".classes__title"], help: "Puedes usar <br> y <span>." },
        { id: "pricingTitle", label: "Planes · titulo", type: "html", input: "textarea", selectors: [".pricing__title"], help: "Puedes usar <br>." },
        { id: "pricingSubtitle", label: "Planes · subtitulo", type: "text", input: "textarea", selectors: [".pricing__subtitle"] },
        { id: "contactTitle", label: "Contacto · titulo", type: "html", input: "textarea", selectors: [".contact__title"], help: "Puedes usar <br>." },
        { id: "contactText", label: "Contacto · descripcion", type: "text", input: "textarea", selectors: [".contact__text"] },
        { id: "contactLocation", label: "Contacto · ubicacion", type: "html", input: "textarea", selectors: [".contact__detail:nth-child(1) .contact__detail-value"], help: "Puedes usar <br>." },
        { id: "contactHours", label: "Contacto · horario", type: "html", input: "textarea", selectors: [".contact__detail:nth-child(2) .contact__detail-value"], help: "Puedes usar <br>." },
        { id: "contactPhone", label: "Contacto · telefono", type: "text", input: "text", selectors: [".contact__detail:nth-child(3) .contact__detail-value"] },
        { id: "contactEmail", label: "Contacto · email", type: "text", input: "text", selectors: [".contact__detail:nth-child(4) .contact__detail-value"] }
      ]
    },
    restaurant: {
      name: "Aubergine Restaurant",
      fields: [
        { id: "heroEyebrow", label: "Hero · etiqueta", type: "text", input: "text", selectors: [".hero__eyebrow .label"] },
        { id: "heroTitle", label: "Hero · titulo", type: "html", input: "textarea", selectors: [".hero__title"], help: "Puedes usar <br> y <em>." },
        { id: "heroDesc", label: "Hero · descripcion", type: "text", input: "textarea", selectors: [".hero__desc"] },
        { id: "heroPrimaryText", label: "Hero · CTA principal", type: "text", input: "text", selectors: [".btn-reserve span"] },
        { id: "heroPrimaryHref", label: "Hero · link CTA principal", type: "attr", attr: "href", input: "text", selectors: [".btn-reserve"] },
        { id: "heroCaption", label: "Hero · caption imagen", type: "text", input: "text", selectors: [".hero__img-caption"] },
        { id: "manifestoQuote", label: "Manifiesto · cita", type: "text", input: "textarea", selectors: [".manifesto__quote"] },
        { id: "manifestoAuthor", label: "Manifiesto · autor", type: "text", input: "text", selectors: [".manifesto__author"] },
        { id: "storyTitle1", label: "Historia 1 · titulo", type: "html", input: "textarea", selectors: [".story__block:nth-of-type(1) .story__heading"], help: "Puedes usar <br> y <em>." },
        { id: "storyBody11", label: "Historia 1 · parrafo 1", type: "text", input: "textarea", selectors: [".story__block:nth-of-type(1) .story__body:nth-of-type(1)"] },
        { id: "storyBody12", label: "Historia 1 · parrafo 2", type: "text", input: "textarea", selectors: [".story__block:nth-of-type(1) .story__body:nth-of-type(2)"] },
        { id: "storyTitle2", label: "Historia 2 · titulo", type: "html", input: "textarea", selectors: [".story__block:nth-of-type(2) .story__heading"], help: "Puedes usar <br> y <em>." },
        { id: "storyBody21", label: "Historia 2 · parrafo 1", type: "text", input: "textarea", selectors: [".story__block:nth-of-type(2) .story__body:nth-of-type(1)"] },
        { id: "storyBody22", label: "Historia 2 · parrafo 2", type: "text", input: "textarea", selectors: [".story__block:nth-of-type(2) .story__body:nth-of-type(2)"] },
        { id: "menuTitle", label: "Menu · titulo", type: "html", input: "textarea", selectors: [".menu__title"], help: "Puedes usar <br> y <em>." },
        { id: "menuIntro", label: "Menu · introduccion", type: "text", input: "textarea", selectors: [".menu__intro"] },
        { id: "reservationTitle", label: "Reserva · titulo", type: "html", input: "textarea", selectors: [".reservation__title"], help: "Puedes usar <br> y <em>." },
        { id: "reservationDesc", label: "Reserva · descripcion", type: "text", input: "textarea", selectors: [".reservation__desc"] },
        { id: "reservationService", label: "Reserva · servicio", type: "text", input: "text", selectors: [".reservation__detail:nth-child(1) .reservation__detail-value"] },
        { id: "reservationLocation", label: "Reserva · ubicacion", type: "text", input: "text", selectors: [".reservation__detail:nth-child(2) .reservation__detail-value"] }
      ]
    },
    tattoo: {
      name: "Sombra Ink",
      fields: [
        { id: "heroBadge", label: "Hero · etiqueta", type: "text", input: "text", selectors: [".hero-badge"] },
        { id: "heroTitle", label: "Hero · titulo", type: "html", input: "textarea", selectors: [".hero h1"], help: "Puedes usar <br> y <span>." },
        { id: "heroDesc", label: "Hero · descripcion", type: "text", input: "textarea", selectors: [".hero p"] },
        { id: "heroPrimaryHref", label: "Hero · link WhatsApp", type: "attr", attr: "href", input: "text", selectors: [".hero-btns .btn-primary", ".whatsapp-float a"] },
        { id: "heroSecondaryText", label: "Hero · CTA secundaria", type: "text", input: "text", selectors: [".hero-btns .btn-outline"] },
        { id: "heroSecondaryHref", label: "Hero · link CTA secundaria", type: "attr", attr: "href", input: "text", selectors: [".hero-btns .btn-outline"] },
        { id: "aboutTitle", label: "Nosotros · titulo", type: "html", input: "textarea", selectors: [".about .section-title"], help: "Puedes usar <br>." },
        { id: "aboutText1", label: "Nosotros · parrafo 1", type: "text", input: "textarea", selectors: [".about-text p:nth-of-type(1)"] },
        { id: "aboutText2", label: "Nosotros · parrafo 2", type: "text", input: "textarea", selectors: [".about-text p:nth-of-type(2)"] },
        { id: "aboutCtaText", label: "Nosotros · CTA", type: "text", input: "text", selectors: [".about-text .btn-primary"] },
        { id: "aboutCtaHref", label: "Nosotros · link CTA", type: "attr", attr: "href", input: "text", selectors: [".about-text .btn-primary"] },
        { id: "servicesTitle", label: "Servicios · titulo", type: "text", input: "text", selectors: [".services .section-title"] },
        { id: "servicesIntro", label: "Servicios · descripcion", type: "text", input: "textarea", selectors: [".services-header p"] },
        { id: "contactTitle", label: "Contacto · titulo", type: "html", input: "textarea", selectors: [".contact .section-title"], help: "Puedes usar <br>." },
        { id: "contactIntro", label: "Contacto · descripcion", type: "text", input: "textarea", selectors: [".contact-info > p"] },
        { id: "contactAddress", label: "Contacto · direccion", type: "html", input: "textarea", selectors: [".contact-item:nth-child(1) .contact-item-text span"], help: "Puedes usar <br>." },
        { id: "contactWhatsappText", label: "Contacto · WhatsApp visible", type: "text", input: "text", selectors: [".contact-item:nth-child(2) .contact-item-text a"] },
        { id: "contactWhatsappHref", label: "Contacto · link WhatsApp", type: "attr", attr: "href", input: "text", selectors: [".contact-item:nth-child(2) .contact-item-text a", ".footer-brand .social-link[aria-label=\"WhatsApp\"]", ".whatsapp-float a", ".hero-btns .btn-primary", ".about-text .btn-primary"] },
        { id: "contactHours", label: "Contacto · horario", type: "html", input: "textarea", selectors: [".contact-item:nth-child(3) .contact-item-text span"], help: "Puedes usar <br>." },
        { id: "contactInstagramHref", label: "Contacto · Instagram link", type: "attr", attr: "href", input: "text", selectors: [".contact-item:nth-child(4) .contact-item-text a", ".gallery-cta .btn-outline", ".footer-brand .social-link[aria-label=\"Instagram\"]"] }
      ]
    }
  };

  const config = configs[templateKey];
  const storageKey = `av-template-editor:${templateKey}`;
  const params = new URLSearchParams(window.location.search);
  const isEditMode = params.get("edit") === "1";
  const closeUrl = new URL(window.location.href);

  closeUrl.searchParams.delete("edit");
  injectStyles();

  const defaults = readDefaults(config.fields);
  let state = { ...defaults, ...(loadState() || {}) };

  applyState(state);
  renderLaunchButton();

  if (!isEditMode) {
    return;
  }

  const ui = renderEditorUi();
  bindEditor(ui);

  function readDefaults(fields) {
    const result = {};
    fields.forEach((field) => {
      const element = document.querySelector(field.selectors[0]);
      if (!element) {
        result[field.id] = "";
        return;
      }
      if (field.type === "attr") {
        result[field.id] = element.getAttribute(field.attr || "href") || "";
      } else if (field.type === "html") {
        result[field.id] = element.innerHTML.trim();
      } else {
        result[field.id] = element.textContent.trim();
      }
    });
    return result;
  }

  function applyState(nextState) {
    config.fields.forEach((field) => {
      const value = nextState[field.id] ?? "";
      field.selectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          if (field.type === "attr") {
            element.setAttribute(field.attr || "href", value);
          } else if (field.type === "html") {
            element.innerHTML = value;
          } else {
            element.textContent = value;
          }
        });
      });
    });
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveState(nextState) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextState));
    } catch (error) {
      return;
    }
  }

  function clearState() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch (error) {
      return;
    }
  }

  function renderLaunchButton() {
    const anchor = document.createElement("a");
    const launchUrl = new URL(window.location.href);
    launchUrl.searchParams.set("edit", "1");
    anchor.href = launchUrl.toString();
    anchor.className = "template-editor-launch";
    anchor.textContent = isEditMode ? "Editor activo" : "Abrir editor";
    if (isEditMode) {
      anchor.style.display = "none";
    }
    document.body.appendChild(anchor);
  }

  function renderEditorUi() {
    const wrap = document.createElement("div");
    wrap.className = "template-editor-shell";
    wrap.innerHTML = `
      <div class="template-editor-bar">
        <div class="template-editor-bar-copy">
          <strong>Editor de contenido</strong>
          <span>${escapeHtml(config.name)} · cambios guardados en este navegador</span>
        </div>
        <div class="template-editor-bar-actions">
          <button type="button" data-editor-action="save">Guardar</button>
          <button type="button" data-editor-action="export">Exportar JSON</button>
          <button type="button" data-editor-action="import">Importar JSON</button>
          <button type="button" data-editor-action="reset">Restablecer</button>
          <a href="${escapeHtml(closeUrl.toString())}">Ver demo</a>
        </div>
      </div>
      <aside class="template-editor-panel">
        <div class="template-editor-head">
          <h2>Mensajes, CTA y datos clave</h2>
          <p>Haz cambios en vivo, guarda, exporta o vuelve al estado base cuando quieras.</p>
          <span class="template-editor-status" data-editor-status>Listo para editar.</span>
        </div>
        <div class="template-editor-fields">
          ${config.fields.map(renderField).join("")}
        </div>
      </aside>
      <input type="file" accept="application/json" hidden data-editor-import-file />
    `;
    document.body.appendChild(wrap);

    return {
      status: wrap.querySelector("[data-editor-status]"),
      save: wrap.querySelector('[data-editor-action="save"]'),
      exportBtn: wrap.querySelector('[data-editor-action="export"]'),
      importBtn: wrap.querySelector('[data-editor-action="import"]'),
      resetBtn: wrap.querySelector('[data-editor-action="reset"]'),
      importFile: wrap.querySelector("[data-editor-import-file]"),
      fields: wrap.querySelectorAll("[data-editor-field]")
    };
  }

  function renderField(field) {
    const value = state[field.id] ?? "";
    const input = field.input === "textarea"
      ? `<textarea data-editor-field="${escapeHtml(field.id)}">${escapeHtml(value)}</textarea>`
      : `<input type="text" data-editor-field="${escapeHtml(field.id)}" value="${escapeHtml(value)}" />`;

    return `
      <label class="template-editor-field">
        <span>${escapeHtml(field.label)}</span>
        ${input}
        ${field.help ? `<small>${escapeHtml(field.help)}</small>` : ""}
      </label>
    `;
  }

  function bindEditor(ui) {
    ui.fields.forEach((input) => {
      input.addEventListener("input", () => {
        state = { ...state, [input.dataset.editorField]: input.value };
        applyState(state);
        setStatus(ui, "Cambios en borrador.");
      });
    });

    ui.save.addEventListener("click", () => {
      saveState(state);
      setStatus(ui, "Cambios guardados en este navegador.");
    });

    ui.exportBtn.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${templateKey}-editor.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus(ui, "Archivo JSON exportado.");
    });

    ui.importBtn.addEventListener("click", () => {
      ui.importFile.click();
    });

    ui.importFile.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || "{}"));
          state = { ...defaults, ...parsed };
          applyState(state);
          saveState(state);
          syncInputs(ui);
          setStatus(ui, "Archivo importado correctamente.");
        } catch (error) {
          setStatus(ui, "No se pudo importar ese JSON.");
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    });

    ui.resetBtn.addEventListener("click", () => {
      state = { ...defaults };
      clearState();
      applyState(state);
      syncInputs(ui);
      setStatus(ui, "Volviste a la version base.");
    });
  }

  function syncInputs(ui) {
    ui.fields.forEach((input) => {
      input.value = state[input.dataset.editorField] ?? "";
    });
  }

  function setStatus(ui, message) {
    if (ui.status) {
      ui.status.textContent = message;
    }
  }

  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .template-editor-launch {
        position: fixed;
        left: 18px;
        bottom: 18px;
        z-index: 9998;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 46px;
        padding: 0 18px;
        border-radius: 999px;
        background: #ffffff;
        color: #111111;
        font: 700 14px/1.1 Arial, sans-serif;
        text-decoration: none;
        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.24);
      }
      .template-editor-shell {
        position: fixed;
        inset: 0 auto 0 0;
        z-index: 9999;
        width: min(430px, 100vw);
        background: rgba(11, 11, 11, 0.96);
        color: #f3efe7;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 20px 0 50px rgba(0, 0, 0, 0.3);
        overflow: auto;
        font-family: Arial, sans-serif;
      }
      .template-editor-bar {
        position: sticky;
        top: 0;
        display: grid;
        gap: 12px;
        padding: 18px;
        background: rgba(8, 8, 8, 0.98);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .template-editor-bar-copy strong,
      .template-editor-head h2 {
        display: block;
        margin: 0;
        color: #ffffff;
      }
      .template-editor-bar-copy span,
      .template-editor-head p,
      .template-editor-field small,
      .template-editor-status {
        color: rgba(243, 239, 231, 0.72);
      }
      .template-editor-bar-actions,
      .template-editor-fields {
        display: grid;
        gap: 10px;
      }
      .template-editor-bar-actions button,
      .template-editor-bar-actions a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 42px;
        padding: 0 14px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.04);
        color: #f3efe7;
        text-decoration: none;
        font: 700 13px/1.1 Arial, sans-serif;
        cursor: pointer;
      }
      .template-editor-panel {
        padding: 18px;
      }
      .template-editor-head {
        display: grid;
        gap: 8px;
        margin-bottom: 18px;
      }
      .template-editor-field {
        display: grid;
        gap: 8px;
      }
      .template-editor-field span {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #d9cfbf;
      }
      .template-editor-field input,
      .template-editor-field textarea {
        width: 100%;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.04);
        color: #ffffff;
        padding: 12px 14px;
        font: 400 14px/1.45 Arial, sans-serif;
      }
      .template-editor-field textarea {
        min-height: 96px;
        resize: vertical;
      }
      @media (max-width: 900px) {
        .template-editor-shell {
          width: 100vw;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
