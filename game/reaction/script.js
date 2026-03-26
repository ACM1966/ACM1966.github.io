document.addEventListener('DOMContentLoaded', () => {
    const box = document.getElementById('reactionBox');
    const text = document.getElementById('reactionText');
    const subtext = document.getElementById('reactionSubtext');
    const bestTimeEl = document.getElementById('best-time');
    const avgTimeEl = document.getElementById('avg-time');
    const attemptsList = document.getElementById('attemptsList');

    let state = 'idle';
    let startTime = 0;
    let timeout = null;
    let attempts = [];
    let bestTime = localStorage.getItem('reactionBestTime') || null;

    if (bestTime) {
        bestTimeEl.textContent = bestTime + 'ms';
    }

    function reset() {
        state = 'idle';
        box.className = 'reaction-box';
        text.textContent = 'Click to Start';
        subtext.textContent = 'When the box turns green, click as fast as you can!';
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    }

    function startWaiting() {
        state = 'waiting';
        box.className = 'reaction-box waiting';
        text.textContent = 'Wait for Green...';
        subtext.textContent = "Don't click yet!";

        const delay = 2000 + Math.random() * 3000;
        timeout = setTimeout(() => {
            state = 'ready';
            box.className = 'reaction-box ready';
            text.textContent = 'CLICK NOW!';
            subtext.textContent = 'Click as fast as you can!';
            startTime = performance.now();
        }, delay);
    }

    function showResult(reactionTime) {
        state = 'result';
        box.className = 'reaction-box result';
        text.textContent = reactionTime + 'ms';
        
        attempts.push(reactionTime);
        if (attempts.length > 5) attempts.shift();
        
        updateStats();
        renderAttempts();

        let message = '';
        if (reactionTime < 200) {
            message = 'Incredible! Lightning fast!';
        } else if (reactionTime < 250) {
            message = 'Great reflexes!';
        } else if (reactionTime < 300) {
            message = 'Good reaction time!';
        } else if (reactionTime < 400) {
            message = 'Average speed';
        } else {
            message = 'Keep practicing!';
        }
        subtext.textContent = message + ' Click to try again.';
    }

    function showEarly() {
        state = 'early';
        box.className = 'reaction-box early';
        text.textContent = 'Too Early!';
        subtext.textContent = 'Wait for green! Click to try again.';
    }

    function updateStats() {
        if (attempts.length === 0) return;

        const avg = Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
        avgTimeEl.textContent = avg + 'ms';

        const min = Math.min(...attempts);
        if (!bestTime || min < parseInt(bestTime)) {
            bestTime = min;
            localStorage.setItem('reactionBestTime', bestTime);
        }
        bestTimeEl.textContent = bestTime + 'ms';
    }

    function renderAttempts() {
        attemptsList.innerHTML = attempts.map(time => {
            let className = 'attempt-item';
            if (time < 250) className += ' fast';
            else if (time < 350) className += ' medium';
            else className += ' slow';
            return `<div class="${className}">${time}ms</div>`;
        }).join('');
    }

    box.addEventListener('click', () => {
        switch (state) {
            case 'idle':
            case 'result':
            case 'early':
                startWaiting();
                break;
            case 'waiting':
                showEarly();
                break;
            case 'ready':
                const reactionTime = Math.round(performance.now() - startTime);
                showResult(reactionTime);
                break;
        }
    });

    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
