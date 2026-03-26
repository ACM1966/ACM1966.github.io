document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const overlay = document.getElementById('gameOverlay');
    const overlayTitle = document.getElementById('overlayTitle');
    const overlayText = document.getElementById('overlayText');
    const scoreEl = document.getElementById('score');
    const bestScoreEl = document.getElementById('best-score');

    const gridSize = 20;
    const canvasSize = Math.min(400, window.innerWidth - 60);
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const tileCount = canvasSize / gridSize;

    let snake = [];
    let food = {};
    let direction = { x: 0, y: 0 };
    let nextDirection = { x: 0, y: 0 };
    let score = 0;
    let bestScore = localStorage.getItem('snakeBestScore') || 0;
    let gameRunning = false;
    let gameLoop = null;
    let speed = 120;

    bestScoreEl.textContent = bestScore;

    function initGame() {
        snake = [
            { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }
        ];
        direction = { x: 0, y: 0 };
        nextDirection = { x: 0, y: 0 };
        score = 0;
        speed = 120;
        scoreEl.textContent = score;
        placeFood();
    }

    function placeFood() {
        do {
            food = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
    }

    function draw() {
        ctx.fillStyle = 'rgba(10, 10, 26, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        const foodX = food.x * gridSize + gridSize / 2;
        const foodY = food.y * gridSize + gridSize / 2;
        const foodRadius = gridSize / 2 - 2;
        
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        snake.forEach((segment, index) => {
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;
            const size = gridSize - 2;

            if (index === 0) {
                const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
                gradient.addColorStop(0, '#4cc9f0');
                gradient.addColorStop(1, '#7209b7');
                ctx.fillStyle = gradient;
                ctx.shadowColor = '#4cc9f0';
                ctx.shadowBlur = 10;
            } else {
                const alpha = 1 - (index / snake.length) * 0.5;
                ctx.fillStyle = `rgba(76, 201, 240, ${alpha})`;
                ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, size, size, 4);
            ctx.fill();
        });
        ctx.shadowBlur = 0;
    }

    function update() {
        direction = { ...nextDirection };

        if (direction.x === 0 && direction.y === 0) {
            return;
        }

        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }

        if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreEl.textContent = score;
            placeFood();
            if (speed > 60) {
                speed -= 2;
            }
        } else {
            snake.pop();
        }
    }

    function gameOver() {
        gameRunning = false;
        clearInterval(gameLoop);

        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('snakeBestScore', bestScore);
            bestScoreEl.textContent = bestScore;
        }

        overlayTitle.textContent = 'Game Over!';
        overlayText.textContent = `Score: ${score} | Press SPACE to restart`;
        overlay.classList.remove('hidden');
    }

    function startGame() {
        if (gameRunning) return;
        
        initGame();
        gameRunning = true;
        overlay.classList.add('hidden');
        
        gameLoop = setInterval(() => {
            update();
            draw();
        }, speed);
    }

    function handleKeydown(e) {
        const key = e.key.toLowerCase();

        if (key === ' ' || key === 'enter') {
            e.preventDefault();
            if (!gameRunning) {
                startGame();
            }
            return;
        }

        if (!gameRunning) return;

        switch (key) {
            case 'arrowup':
            case 'w':
                e.preventDefault();
                if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
                break;
            case 'arrowdown':
            case 's':
                e.preventDefault();
                if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
                break;
            case 'arrowleft':
            case 'a':
                e.preventDefault();
                if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
                break;
            case 'arrowright':
            case 'd':
                e.preventDefault();
                if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
                break;
        }
    }

    document.addEventListener('keydown', handleKeydown);

    document.getElementById('btnUp').addEventListener('click', () => {
        if (!gameRunning) startGame();
        else if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
    });
    document.getElementById('btnDown').addEventListener('click', () => {
        if (!gameRunning) startGame();
        else if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
    });
    document.getElementById('btnLeft').addEventListener('click', () => {
        if (!gameRunning) startGame();
        else if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
    });
    document.getElementById('btnRight').addEventListener('click', () => {
        if (!gameRunning) startGame();
        else if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
    });

    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
        if (!gameRunning) {
            startGame();
            return;
        }

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 30 && direction.x !== -1) nextDirection = { x: 1, y: 0 };
            else if (dx < -30 && direction.x !== 1) nextDirection = { x: -1, y: 0 };
        } else {
            if (dy > 30 && direction.y !== -1) nextDirection = { x: 0, y: 1 };
            else if (dy < -30 && direction.y !== 1) nextDirection = { x: 0, y: -1 };
        }
    }, { passive: true });

    initGame();
    draw();

    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
