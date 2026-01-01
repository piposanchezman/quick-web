declare module '*.css';

declare global {
    interface Window {
        toastTimeout?: number;
        quicklandTranslations?: {
            translations: any;
            t: (key: string, lang?: string) => string;
            applyTranslations: (lang: string) => void;
        };
        showToast?: (message: string) => void;
    }
}
