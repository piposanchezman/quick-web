/**
 * Intersection Observer for scroll animations
 */
export function initScrollAnimations(): void {
    const observerOptions: IntersectionObserverInit = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Trigger animation for elements with animation classes
                entry.target.querySelectorAll(".animate-fade-in-up").forEach((el) => {
                    (el as HTMLElement).style.animationPlayState = "running";
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections for scroll animations
    document.querySelectorAll("section").forEach((section) => {
        // Skip the header section which should animate immediately
        if (section.id !== "inicio" && !section.querySelector("h1")) {
            section.querySelectorAll(".animate-fade-in-up").forEach((el) => {
                (el as HTMLElement).style.animationPlayState = "paused";
            });
            observer.observe(section);
        }
    });
}
