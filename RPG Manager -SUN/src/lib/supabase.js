import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

const sessionPreference = "rpg-manager:remember-session";
let rememberSession = localStorage.getItem(sessionPreference) !== "false";

export function getRememberSession() {
  return rememberSession;
}

export function setRememberSession(remember) {
  rememberSession = remember;
  localStorage.setItem(sessionPreference, String(remember));
}

const sessionStorageAdapter = {
  getItem(key) {
    return (rememberSession ? localStorage : sessionStorage).getItem(key);
  },
  setItem(key, value) {
    const storage = rememberSession ? localStorage : sessionStorage;
    (rememberSession ? sessionStorage : localStorage).removeItem(key);
    storage.setItem(key, value);
  },
  removeItem(key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

export const supabaseConfigurado = Boolean(supabaseUrl && supabaseKey);

export const supabase = supabaseConfigurado
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: sessionStorageAdapter
      }
    })
  : null;
