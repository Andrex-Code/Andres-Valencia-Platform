/**
 * AV Admin — Auth layer
 */
(function (global) {
  "use strict";

  const SESSION_PREFIX = "av-session:";
  let localConfig = {
    siteId: "default",
    username: "admin",
    passwordHash: "",
    sessionHours: 24,
  };
  let listeners = [];
  let cachedAdminSites = null;
  let cachedIsSuperAdmin = null;

  function mode() {
    return global.AVConfig?.resolvedMode() || "local";
  }

  function configure(options) {
    Object.assign(localConfig, options);
  }

  async function hashPassword(plain) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(plain));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  const localAuth = {
    sessionKey() {
      return SESSION_PREFIX + localConfig.siteId;
    },
    readSession() {
      try {
        const raw = localStorage.getItem(this.sessionKey());
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s.expiresAt || Date.now() > s.expiresAt) {
          localStorage.removeItem(this.sessionKey());
          return null;
        }
        return s;
      } catch {
        return null;
      }
    },
    async login(username, password) {
      if (!localConfig.passwordHash) {
        return { ok: false, error: "Sin credenciales configuradas en esta pagina." };
      }
      const hash = await hashPassword(password);
      const ok = username === localConfig.username && hash === localConfig.passwordHash;
      if (!ok) return { ok: false, error: "Usuario o contrasena incorrectos." };
      const expiresAt = Date.now() + localConfig.sessionHours * 60 * 60 * 1000;
      localStorage.setItem(
        this.sessionKey(),
        JSON.stringify({
          username,
          siteId: localConfig.siteId,
          createdAt: Date.now(),
          expiresAt,
        })
      );
      notifyListeners();
      return { ok: true };
    },
    async logout() {
      localStorage.removeItem(this.sessionKey());
      notifyListeners();
    },
    async isLoggedIn() {
      return this.readSession() !== null;
    },
    async currentUser() {
      const s = this.readSession();
      return s ? { email: s.username, id: s.username } : null;
    },
    async isAdminOf(siteId) {
      const s = this.readSession();
      return !!s && s.siteId === siteId;
    },
  };

  const supabaseAuth = {
    async login(email, password) {
      const sb = global.AVSupabase.client();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      cachedAdminSites = null;
      cachedIsSuperAdmin = null;
      return { ok: true };
    },
    async signup(email, password) {
      const sb = global.AVSupabase.client();
      const { error } = await sb.auth.signUp({ email, password });
      if (error) return { ok: false, error: error.message };
      return {
        ok: true,
        info: "Revisa tu correo para confirmar la cuenta si Supabase lo exige.",
      };
    },
    async logout() {
      const sb = global.AVSupabase.client();
      await sb.auth.signOut();
      cachedAdminSites = null;
      cachedIsSuperAdmin = null;
    },
    async waitForSession(maxAttempts = 6, waitMs = 180) {
      const sb = global.AVSupabase.client();
      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const { data } = await sb.auth.getSession();
        if (data?.session) {
          return data.session;
        }
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => window.setTimeout(resolve, waitMs));
        }
      }
      return null;
    },
    async isLoggedIn() {
      const session = await this.waitForSession();
      return Boolean(session);
    },
    async currentUser() {
      const sb = global.AVSupabase.client();
      const session = await this.waitForSession();
      if (!session) {
        return null;
      }
      const { data } = await sb.auth.getUser();
      const u = data?.user;
      return u ? { id: u.id, email: u.email } : null;
    },
    async isSuperAdmin() {
      if (cachedIsSuperAdmin !== null) return cachedIsSuperAdmin;
      const user = await this.currentUser();
      if (!user) {
        cachedIsSuperAdmin = false;
        return false;
      }
      const sb = global.AVSupabase.client();
      const { data, error } = await sb
        .from("super_admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) {
        console.warn("[AVAuth] isSuperAdmin check:", error.message);
        cachedIsSuperAdmin = false;
        return false;
      }
      cachedIsSuperAdmin = Boolean(data);
      return cachedIsSuperAdmin;
    },
    async isAdminOf(siteId) {
      if (await this.isSuperAdmin()) return true;
      if (cachedAdminSites) return cachedAdminSites.has(siteId);
      const user = await this.currentUser();
      if (!user) return false;
      const sb = global.AVSupabase.client();
      const { data, error } = await sb
        .from("site_admins")
        .select("site_id")
        .eq("user_id", user.id);
      if (error) {
        console.error("[AVAuth] isAdminOf error:", error);
        return false;
      }
      cachedAdminSites = new Set((data || []).map((r) => r.site_id));
      return cachedAdminSites.has(siteId);
    },
  };

  function backend() {
    return mode() === "supabase" ? supabaseAuth : localAuth;
  }

  async function login(identifier, password) {
    try {
      const result = await backend().login(identifier, password);
      if (result.ok) notifyListeners();
      return result;
    } catch (e) {
      return { ok: false, error: e.message || "Error inesperado." };
    }
  }

  async function signup(email, password) {
    if (mode() !== "supabase") {
      return { ok: false, error: "Registro solo disponible con Supabase." };
    }
    return supabaseAuth.signup(email, password);
  }

  async function logout() {
    await backend().logout();
    notifyListeners();
  }

  async function isLoggedIn() {
    return backend().isLoggedIn();
  }

  async function currentUser() {
    return backend().currentUser();
  }

  async function isAdminOf(siteId) {
    return backend().isAdminOf(siteId);
  }

  function onChange(cb) {
    listeners.push(cb);
    if (mode() === "supabase" && global.AVSupabase) {
      const sb = global.AVSupabase.client();
      sb?.auth?.onAuthStateChange(() => {
        cachedAdminSites = null;
        cachedIsSuperAdmin = null;
        notifyListeners();
      });
    }
    return () => {
      listeners = listeners.filter((fn) => fn !== cb);
    };
  }

  function notifyListeners() {
    listeners.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.error(e);
      }
    });
  }

  global.AVAuth = {
    configure,
    login,
    signup,
    logout,
    isLoggedIn,
    currentUser,
    isAdminOf,
    onChange,
    hashPassword,
  };
})(window);
