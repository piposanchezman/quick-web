/**
 * Smooth scrolling functionality for anchor links
 */
export function initSmoothScrolling(): void {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e: Event) {
            e.preventDefault();
            const href = (e.currentTarget as HTMLAnchorElement).getAttribute("href");
            
            if (href) {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
                }
            }
        });
    });
}
