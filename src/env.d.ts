/// <reference types="astro/client" />

interface Window {
    showToast: (message: string) => void;
    toastTimeout?: number;
}
