declare module '*.css';

declare global {
    interface Window {
        toastTimeout?: number;
        showToast?: (message: string) => void;
        translations?: {
            [key: string]: {
                [key: string]: string;
            };
        };
    }
}
