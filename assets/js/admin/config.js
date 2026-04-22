/**
 * AV Admin — Configuración global
 * -------------------------------------------------------------
 * Define el backend (Supabase o local) y las credenciales.
 */
(function (global) {
  "use strict";

  const config = {
    supabase: {
      url: "https://yfghlhfhglyinizifrgo.supabase.co",
      anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZ2hsaGZoZ2x5aW5pemlmcmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1ODk0MzEsImV4cCI6MjA5MjE2NTQzMX0.VVsI6dKnRJpKTtDvFro9bP0hE6tX3zdoGzMuk3DYy4Q",
    },
    mode: "auto",
    sessionHours: 24,
    debug: false,
  };

  function isSupabaseConfigured() {
    return Boolean(config.supabase.url && config.supabase.anonKey);
  }

  function resolvedMode() {
    if (config.mode === "supabase") return "supabase";
    if (config.mode === "local") return "local";
    return isSupabaseConfigured() ? "supabase" : "local";
  }

  function log(...args) {
    if (config.debug) console.log("[AVAdmin]", ...args);
  }

  global.AVConfig = {
    get: () => config,
    set: (patch) => Object.assign(config, patch),
    isSupabaseConfigured,
    resolvedMode,
    log,
  };
})(window);
