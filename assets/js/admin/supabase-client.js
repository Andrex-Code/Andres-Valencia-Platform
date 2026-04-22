/**
 * AV Admin — Supabase client singleton
 */
(function (global) {
  "use strict";

  let client = null;

  function init() {
    if (client) return client;
    const cfg = global.AVConfig?.get();
    if (!cfg?.supabase?.url || !cfg?.supabase?.anonKey) {
      return null;
    }
    if (typeof global.supabase?.createClient !== "function") {
      console.error("[AVSupabase] La libreria supabase-js no esta cargada.");
      return null;
    }
    client = global.supabase.createClient(cfg.supabase.url, cfg.supabase.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    global.AVConfig?.log("Supabase client initialized");
    return client;
  }

  function getClient() {
    if (!client) return init();
    return client;
  }

  global.AVSupabase = {
    init,
    client: getClient,
  };
})(window);
