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

  function configDefaultMessage() {
    return "Acceso privado para administradores del sitio. La sesion se valida con Supabase.";
  }

  function messageForReason(reason) {
    switch (reason) {
      case "signin":
        return {
          tone: "info",
          text: "Inicia sesion con tu cuenta admin para abrir el editor de esta pagina.",
        };
      case "forbidden":
        return {
          tone: "danger",
          text: "Tu sesion existe, pero esta cuenta no tiene permisos para este sitio.",
        };
      case "error":
        return {
          tone: "danger",
          text: "No se pudo validar el acceso desde la pagina. Entra desde aqui para continuar.",
        };
      default:
        return {
          tone: "info",
          text: configDefaultMessage(),
        };
    }
  }

  function render(config, state) {
    document.body.innerHTML = `
      <main class="av-admin-gate-shell">
        <section class="av-admin-gate-card">
          <article class="av-admin-gate-brand">
            <div class="av-admin-gate-brand-top">
              <span class="av-admin-gate-kicker">Admin privado</span>
              <h1>${escapeHtml(config.title)}</h1>
              <p>${escapeHtml(config.description)}</p>
            </div>

            <div class="av-admin-gate-brand-bottom">
              <div class="av-admin-gate-points">
                <div class="av-admin-gate-point">
                  <strong>Sesion real</strong>
                  <span>El acceso se valida con Supabase antes de abrir el editor.</span>
                </div>
                <div class="av-admin-gate-point">
                  <strong>Control por sitio</strong>
                  <span>Solo los usuarios autorizados en este dominio pueden continuar.</span>
                </div>
                <div class="av-admin-gate-point">
                  <strong>Entrada limpia</strong>
                  <span>El editor se abre despues del login, no sobre una pantalla publica.</span>
                </div>
                <div class="av-admin-gate-point">
                  <strong>Listo en movil</strong>
                  <span>El acceso cabe bien en pantalla pequena y evita overlays torpes.</span>
                </div>
              </div>
            </div>
          </article>

          <article class="av-admin-gate-panel">
            <header class="av-admin-gate-header">
              <small>${escapeHtml(config.eyebrow)}</small>
              <h2>${escapeHtml(config.panelTitle)}</h2>
              <p>${escapeHtml(config.panelText)}</p>
            </header>

            <div class="av-admin-gate-status" id="avAdminGateStatus"></div>

            <form class="av-admin-gate-form" id="avAdminGateForm" autocomplete="on">
              <label class="av-admin-gate-field">
                <span>Correo admin</span>
                <input type="email" name="email" inputmode="email" autocomplete="email" required />
              </label>
              <label class="av-admin-gate-field">
                <span>Contrasena</span>
                <input type="password" name="password" autocomplete="current-password" minlength="6" required />
              </label>
              <button type="submit" class="av-admin-gate-submit" id="avAdminGateSubmit">Entrar al editor</button>
            </form>

            <div class="av-admin-gate-actions">
              <button type="button" class="av-admin-gate-secondary" id="avAdminGateContinue" hidden>Continuar al editor</button>
              <button type="button" class="av-admin-gate-ghost" id="avAdminGateLogout" hidden>Cerrar sesion</button>
              <a class="av-admin-gate-ghost" id="avAdminGateBack" href="${escapeHtml(config.homeUrl)}">Volver al sitio</a>
            </div>

            <div class="av-admin-gate-meta">
              <div class="av-admin-gate-meta-row">
                <span>Sitio</span>
                <strong>${escapeHtml(config.siteLabel)}</strong>
              </div>
              <div class="av-admin-gate-meta-row">
                <span>Site ID</span>
                <strong>${escapeHtml(config.siteId)}</strong>
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
  }

  function setBusy(isBusy) {
    const submit = $("#avAdminGateSubmit");
    if (!submit) return;
    submit.disabled = isBusy;
    submit.textContent = isBusy ? "Validando..." : "Entrar al editor";
  }

  async function redirectToEditor(nextUrl) {
    setStatus({
      tone: "success",
      text: "Sesion validada. Abriendo el editor...",
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
        text: `La cuenta ${user?.email || ""} no administra este sitio.`,
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
      text: `Sesion lista para ${user?.email || "tu cuenta admin"}. Puedes entrar al editor.`,
    });
    setTimeout(() => {
      redirectToEditor(state.next);
    }, 180);
  }

  async function init(options) {
    const config = {
      siteId: options.siteId,
      siteLabel: options.siteLabel || options.siteId,
      title: options.title || "Admin seguro para editar tu pagina",
      description:
        options.description || "Acceso reservado para administradores. Desde aqui abres el editor real sin exponerlo al publico.",
      eyebrow: options.eyebrow || "Acceso protegido",
      panelTitle: options.panelTitle || "Inicia sesion",
      panelText:
        options.panelText || "Usa tu cuenta admin asignada en Supabase para entrar al editor de este sitio.",
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
          text: result.error || "No fue posible iniciar sesion.",
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
        text: "Sesion cerrada. Puedes entrar con otra cuenta admin.",
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
