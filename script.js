document.addEventListener('DOMContentLoaded', () => {
    // Reveal sections on scroll using IntersectionObserver
    const sections = document.querySelectorAll('.section-hidden');
    
    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: "0px"
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class to trigger CSS transition
                entry.target.classList.add('section-visible');
                
                // If the intersecting section is stats, trigger counter animation
                if (entry.target.id === 'stats') {
                    animateCounters();
                }
                
                // Unobserve after animating once
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Animate numbers counting up
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 150; // Lower value = faster animation

        counters.forEach(counter => {
            const animate = () => {
                const target = +counter.getAttribute('data-target');
                const count = parseInt(counter.innerText) || 0;
                
                // Calculate increment dynamically based on target and speed
                const increment = Math.max(1, Math.ceil(target / speed));

                if (count < target) {
                    counter.innerText = count + increment;
                    // Adjust timeout for smoother rendering
                    setTimeout(animate, 20);
                } else {
                    counter.innerText = target + (target >= 500 ? '+' : '');
                }
            };
            animate();
        });
    }

    // Set dynamic current year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.innerText = new Date().getFullYear();
    }
});
