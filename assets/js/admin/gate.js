(function (global) {
  "use strict";

  function $(selector) {
    return document.querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function normalizeUrl(input, fallback) {
    try {
      const candidate = new URL(input || fallback, window.location.origin);
      if (candidate.origin !== window.location.origin) {
        return new URL(fallback, window.location.origin);
      }
      return candidate;
    } catch (_) {
      return new URL(fallback, window.location.origin);
    }
  }

  function ensureEditMode(url) {
    const next = new URL(url.toString());
    next.searchParams.set("edit", "1");
    return next;
  }

  function resolveState(config) {
    const params = new URLSearchParams(window.location.search);
    const requestedNext = params.get("next");
    const fallback = normalizeUrl(config.targetUrl, "/");
    const next = ensureEditMode(normalizeUrl(requestedNext, fallback));
    const reason = params.get("reason") || "";
    return { next, reason };
  }

  function messageForReason(reason) {
    switch (reason) {
      case "signin":
        return {
          tone: "info",
          text: "Ingresa tu correo y contrasena para abrir el editor de tu sitio.",
        };
      case "forbidden":
        return {
          tone: "danger",
          text: "Esta cuenta no tiene acceso a este sitio. Prueba con otra cuenta.",
        };
      case "error":
        return {
          tone: "danger",
          text: "Hubo un problema al verificar el acceso. Intenta entrar desde aqui.",
        };
      default:
        return {
          tone: "info",
          text: "Ingresa tu correo y contrasena para editar el sitio.",
        };
    }
  }

  function iconPencil() {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14.166 2.5a2.357 2.357 0 0 1 3.334 3.333L6.25 17.083l-4.166 1.083 1.083-4.166L14.166 2.5z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  function iconImage() {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="7" cy="7.5" r="1.5" stroke="currentColor" stroke-width="1.6"/>
      <path d="M2 13l4-4 3 3 3-3 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  function iconSave() {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 2v9m0 0-3-3m3 3 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M4 13v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`;
  }

  function render(config, state) {
    document.body.innerHTML = `
      <main class="av-gate-shell">
        <section class="av-gate-card">

          <article class="av-gate-welcome">
            <div class="av-gate-welcome-inner">
              <div class="av-gate-logo">AV</div>
              <div class="av-gate-headline">
                <h1>Tu sitio,<br>en tus manos</h1>
                <p>Desde aqui puedes cambiar textos, imagenes y colores de tu sitio. Sin ayuda tecnica.</p>
              </div>
              <ul class="av-gate-steps" role="list">
                <li class="av-gate-step">
                  <span class="av-gate-step-icon">${iconPencil()}</span>
                  <span>Haz clic en cualquier texto para editarlo al instante</span>
                </li>
                <li class="av-gate-step">
                  <span class="av-gate-step-icon">${iconImage()}</span>
                  <span>Cambia imagenes y colores con un solo clic</span>
                </li>
                <li class="av-gate-step">
                  <span class="av-gate-step-icon">${iconSave()}</span>
                  <span>Guarda los cambios cuando quieras y son tuyos</span>
                </li>
              </ul>
            </div>
          </article>

          <article class="av-gate-panel">
            <div class="av-gate-panel-inner">
              <header class="av-gate-header">
                <h2>Bienvenido de nuevo</h2>
                <p>Escribe tu correo y contrasena para entrar al editor de tu sitio.</p>
              </header>

              <div class="av-gate-status" id="avAdminGateStatus" role="status" aria-live="polite"></div>

              <form class="av-gate-form" id="avAdminGateForm" autocomplete="on" novalidate>
                <label class="av-gate-field">
                  <span class="av-gate-label">Correo electronico</span>
                  <input
                    type="email"
                    name="email"
                    inputmode="email"
                    autocomplete="email"
                    placeholder="tu@correo.com"
                    required
                  />
                </label>
                <label class="av-gate-field">
                  <span class="av-gate-label">Contrasena</span>
                  <input
                    type="password"
                    name="password"
                    autocomplete="current-password"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    minlength="6"
                    required
                  />
                </label>
                <button type="submit" class="av-gate-btn-primary" id="avAdminGateSubmit">
                  Entrar al editor
                </button>
              </form>

              <div class="av-gate-alt-actions">
                <button type="button" class="av-gate-btn-primary" id="avAdminGateContinue" hidden>
                  Continuar al editor
                </button>
                <button type="button" class="av-gate-btn-secondary" id="avAdminGateLogout" hidden>
                  Cerrar sesion
                </button>
                <a class="av-gate-back" id="avAdminGateBack" href="${escapeHtml(config.homeUrl)}">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Volver al sitio
                </a>
              </div>
            </div>
          </article>

        </section>
      </main>
    `;

    setStatus(messageForReason(state.reason));
  }

  function setStatus(status) {
    const box = $("#avAdminGateStatus");
    if (!box) return;
    box.dataset.tone = status.tone || "info";
    box.textContent = status.text;
    box.hidden = !status.text;
  }

  function setBusy(isBusy) {
    const submit = $("#avAdminGateSubmit");
    if (!submit) return;
    submit.disabled = isBusy;
    submit.textContent = isBusy ? "Verificando..." : "Entrar al editor";
  }

  async function redirectToEditor(nextUrl) {
    setStatus({
      tone: "success",
      text: "Todo listo. Abriendo tu editor...",
    });
    window.location.replace(nextUrl.toString());
  }

  async function refreshSession(config, state) {
    const loggedIn = await global.AVAuth.isLoggedIn();
    const continueButton = $("#avAdminGateContinue");
    const logoutButton = $("#avAdminGateLogout");
    const form = $("#avAdminGateForm");

    if (!loggedIn) {
      if (form) form.hidden = false;
      if (continueButton) continueButton.hidden = true;
      if (logoutButton) logoutButton.hidden = true;
      return;
    }

    const user = await global.AVAuth.currentUser();
    const authorized = await global.AVAuth.isAdminOf(config.siteId);

    if (!authorized) {
      if (form) form.hidden = true;
      if (continueButton) continueButton.hidden = true;
      if (logoutButton) logoutButton.hidden = false;
      setStatus({
        tone: "danger",
        text: `La cuenta ${user?.email || ""} no tiene acceso a este sitio.`,
      });
      return;
    }

    if (form) form.hidden = true;
    if (continueButton) continueButton.hidden = false;
    if (logoutButton) logoutButton.hidden = false;

    if (typeof config.onAuthorized === "function") {
      if (continueButton) continueButton.hidden = true;
      await config.onAuthorized({
        config,
        state,
        user,
        logout: () => global.AVAuth.logout(),
        redirectToEditor: () => redirectToEditor(state.next),
        setStatus,
      });
      return;
    }

    setStatus({
      tone: "success",
      text: `Sesion lista para ${user?.email || "tu cuenta"}. Entrando al editor...`,
    });
    setTimeout(() => {
      redirectToEditor(state.next);
    }, 180);
  }

  async function init(options) {
    const config = {
      siteId: options.siteId,
      siteLabel: options.siteLabel || options.siteId,
      title: options.title || "Edita tu sitio desde aqui",
      description: options.description || "Acceso privado para editar el sitio. Solo tu puedes entrar.",
      homeUrl: options.homeUrl || "/",
      targetUrl: options.targetUrl || "/",
      onAuthorized: typeof options.onAuthorized === "function" ? options.onAuthorized : null,
    };
    const state = resolveState(config);

    if (global.AVConfig?.resolvedMode() === "supabase") {
      global.AVSupabase?.init();
    }

    render(config, state);

    const form = $("#avAdminGateForm");
    const continueButton = $("#avAdminGateContinue");
    const logoutButton = $("#avAdminGateLogout");

    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const email = String(data.get("email") || "").trim();
      const password = String(data.get("password") || "");

      setBusy(true);
      const result = await global.AVAuth.login(email, password);
      setBusy(false);

      if (!result.ok) {
        setStatus({
          tone: "danger",
          text: "Correo o contrasena incorrectos. Intentalo de nuevo.",
        });
        return;
      }

      await refreshSession(config, state);
    });

    continueButton?.addEventListener("click", async () => {
      await redirectToEditor(state.next);
    });

    logoutButton?.addEventListener("click", async () => {
      await global.AVAuth.logout();
      form?.reset();
      setStatus({
        tone: "info",
        text: "Sesion cerrada. Puedes entrar con otra cuenta.",
      });
      await refreshSession(config, state);
    });

    global.AVAuth.onChange(async () => {
      await refreshSession(config, state);
    });

    await refreshSession(config, state);
  }

  global.AVAdminGate = { init };
})(window);
