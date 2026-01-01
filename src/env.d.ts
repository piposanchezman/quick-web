/// <reference types="astro/client" />

interface QuickLandTranslations {
    translations: Record<string, Record<string, string>>;
    t: (key: string, lang?: string) => string;
    applyTranslations: (lang: string) => void;
}

interface Window {
    quicklandTranslations?: QuickLandTranslations;
    showToast: (message: string) => void;
    toastTimeout?: number;
}
