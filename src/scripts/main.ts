/**
 * Main initialization script
 */
import { initSmoothScrolling } from './smoothScroll';
import { initScrollAnimations } from './scrollAnimations';

document.addEventListener("DOMContentLoaded", () => {
    initSmoothScrolling();
    initScrollAnimations();
});
