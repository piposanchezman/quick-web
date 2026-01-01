import { translations } from "./translations";

export type Lang = keyof typeof translations;
export type TranslationKey = keyof typeof translations.es;

export function t(key: string, lang: Lang = "es"): string {
    // @ts-ignore
    return translations[lang]?.[key] || translations["es"][key] || key;
}

export function getCurrentLang(): Lang {
    if (typeof window !== "undefined") {
        const savedLang = localStorage.getItem("quickland-lang");
        if (savedLang && ['es', 'en', 'pt'].includes(savedLang)) {
            return savedLang as Lang;
        }
    }
    return "es";
}
