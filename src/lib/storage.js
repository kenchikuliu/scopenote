import { emptyWorkspace, validateWorkspace } from "./domain.js";

export const STORAGE_KEY = "scopenote.workspace.v1";
const LOCALE_KEY = "scopenote.locale";

export function loadWorkspace() {
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: emptyWorkspace(), issue: null, raw: null };
    const result = validateWorkspace(JSON.parse(raw));
    if (!result.ok)
      return { data: emptyWorkspace(), issue: "corruptStorage", raw };
    return { data: result.data, issue: null, raw: null };
  } catch {
    return {
      data: emptyWorkspace(),
      issue: raw === null ? "saveFailure" : "corruptStorage",
      raw,
    };
  }
}

export function saveWorkspace(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function loadLocale() {
  try {
    return localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

export function saveLocale(locale) {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    /* Language changes still work in the current session. */
  }
}
