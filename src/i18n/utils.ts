import { translations } from './translations';

export type Locale = 'es' | 'en' | 'pt';

/**
 * Get all translations for a specific locale
 * @param locale - The locale to get translations for
 * @returns Translation object with keys in format 'section.key'
 */
export function getTranslations(locale: Locale) {
  const trans = translations[locale];
  if (!trans) {
    console.error(`Translations not found for locale: ${locale}`);
    return translations['es']; // Fallback to Spanish
  }
  return trans;
}

/**
 * Client-side helper to get current locale from DOM
 * @returns Current locale from document.documentElement.lang
 */
export function getCurrentLocale(): Locale {
  const lang = document.documentElement.lang.split('-')[0] || 'es';
  return (lang === 'en' || lang === 'pt') ? lang : 'es';
}

/**
 * Client-side helper to get translations for current locale
 * @returns Translations object for current locale
 */
export function getClientTranslations() {
  const locale = getCurrentLocale();
  return translations[locale] || translations['es'];
}
