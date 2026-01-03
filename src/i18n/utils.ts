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
