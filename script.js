/** GitHub username for live stats (public API, no token). */
const GITHUB_USERNAME = 'aCm1T';

let githubStatsPromise = null;

function fetchGitHubStats(username) {
    if (githubStatsPromise) return githubStatsPromise;

    githubStatsPromise = (async () => {
        const headers = { Accept: 'application/vnd.github.v3+json' };
        try {
            const userRes = await fetch(
                `https://api.github.com/users/${encodeURIComponent(username)}`,
                { headers }
            );
            if (!userRes.ok) throw new Error('GitHub user');
            const user = await userRes.json();

            let stars = 0;
            let page = 1;
            const perPage = 100;
            while (page <= 20) {
                const reposRes = await fetch(
                    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated`,
                    { headers }
                );
                if (!reposRes.ok) break;
                const repos = await reposRes.json();
                if (!repos.length) break;
                stars += repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
                if (repos.length < perPage) break;
                page++;
            }

            return { publicRepos: user.public_repos ?? 0, stars };
        } catch (e) {
            console.warn('GitHub stats unavailable:', e);
            return null;
        }
    })();

    return githubStatsPromise;
}

function applyGitHubStatsToDOM(stats) {
    document.querySelectorAll('.stat-number[data-github]').forEach((el) => {
        const key = el.getAttribute('data-github');
        let val = 0;
        if (stats) {
            if (key === 'repos') val = stats.publicRepos;
            else if (key === 'stars') val = stats.stars;
        } else {
            val = parseInt(el.getAttribute('data-fallback'), 10);
            if (Number.isNaN(val)) val = 0;
        }
        el.setAttribute('data-target', String(val));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchGitHubStats(GITHUB_USERNAME);

    const sections = document.querySelectorAll('.section-hidden');

    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px'
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');

                if (entry.target.id === 'stats') {
                    fetchGitHubStats(GITHUB_USERNAME).then((stats) => {
                        applyGitHubStatsToDOM(stats);
                        animateCounters();
                    });
                }

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });

    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const speed = 150;

        counters.forEach((counter) => {
            const animate = () => {
                const target = +counter.getAttribute('data-target');
                const count = parseInt(counter.innerText, 10) || 0;
                const increment = Math.max(1, Math.ceil(target / speed));

                if (count < target) {
                    counter.innerText = count + increment;
                    setTimeout(animate, 20);
                } else {
                    counter.innerText = String(target);
                }
            };
            animate();
        });
    }

    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.innerText = new Date().getFullYear();
    }
});
