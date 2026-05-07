import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { api } from "./api";

const STORAGE_KEY = "ventagamer.lang";

i18n.use(initReactI18next).init({
  fallbackLng: "es",
  lng: localStorage.getItem(STORAGE_KEY) ?? "es",
  resources: {},
  interpolation: { escapeValue: false },
  returnNull: false,
});

export async function loadLanguage(code: string) {
  if (i18n.hasResourceBundle(code, "translation")) {
    await i18n.changeLanguage(code);
    localStorage.setItem(STORAGE_KEY, code);
    return;
  }
  try {
    const { data } = await api.get<Record<string, string>>(`/i18n/translations/${code}`);
    i18n.addResourceBundle(code, "translation", data, true, true);
    await i18n.changeLanguage(code);
    localStorage.setItem(STORAGE_KEY, code);
  } catch (e) {
    console.error("No se pudo cargar idioma", code, e);
  }
}

export type LanguageOption = { code: string; name: string };

export async function fetchLanguages(): Promise<LanguageOption[]> {
  const { data } = await api.get<LanguageOption[]>("/i18n/languages");
  return data;
}

export default i18n;
