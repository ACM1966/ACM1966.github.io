document.addEventListener('DOMContentLoaded', () => {
    const textDisplay = document.getElementById('textDisplay');
    const inputField = document.getElementById('inputField');
    const wpmEl = document.getElementById('wpm');
    const accuracyEl = document.getElementById('accuracy');
    const timerEl = document.getElementById('timer');
    const restartBtn = document.getElementById('restartBtn');
    const timeBtns = document.querySelectorAll('.time-btn');
    const resultPanel = document.getElementById('resultPanel');
    const finalWpm = document.getElementById('finalWpm');
    const finalAccuracy = document.getElementById('finalAccuracy');
    const finalChars = document.getElementById('finalChars');

    const words = [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
        'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
        'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
        'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
        'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
        'code', 'function', 'variable', 'string', 'number', 'array', 'object', 'loop', 'if', 'else',
        'return', 'const', 'let', 'class', 'import', 'export', 'async', 'await', 'try', 'catch',
        'developer', 'software', 'programming', 'javascript', 'python', 'react', 'node', 'database', 'server', 'client'
    ];

    let text = '';
    let charIndex = 0;
    let correctChars = 0;
    let incorrectChars = 0;
    let isStarted = false;
    let isFinished = false;
    let timer = null;
    let timeLeft = 60;
    let selectedTime = 60;
    let startTime = 0;

    function generateText() {
        const wordCount = 50;
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        text = shuffled.slice(0, wordCount).join(' ');
        renderText();
    }

    function renderText() {
        textDisplay.innerHTML = text.split('').map((char, i) => {
            let className = 'char';
            if (i === charIndex) className += ' current';
            return `<span class="${className}">${char}</span>`;
        }).join('');
    }

    function updateText() {
        const chars = textDisplay.querySelectorAll('.char');
        chars.forEach((char, i) => {
            char.classList.remove('current', 'correct', 'incorrect');
            if (i < charIndex) {
                if (char.textContent === inputField.value[i]) {
                    char.classList.add('correct');
                } else {
                    char.classList.add('incorrect');
                }
            } else if (i === charIndex) {
                char.classList.add('current');
            }
        });
    }

    function startTimer() {
        startTime = Date.now();
        timer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft + 's';
            
            updateWpm();
            
            if (timeLeft <= 0) {
                finishGame();
            }
        }, 1000);
    }

    function updateWpm() {
        const timeElapsed = (Date.now() - startTime) / 1000 / 60;
        const wpm = Math.round((correctChars / 5) / timeElapsed) || 0;
        wpmEl.textContent = wpm;
    }

    function updateAccuracy() {
        const total = correctChars + incorrectChars;
        const accuracy = total > 0 ? Math.round((correctChars / total) * 100) : 100;
        accuracyEl.textContent = accuracy + '%';
    }

    function finishGame() {
        isFinished = true;
        clearInterval(timer);
        inputField.disabled = true;

        const timeElapsed = (Date.now() - startTime) / 1000 / 60;
        const wpm = Math.round((correctChars / 5) / timeElapsed) || 0;
        const total = correctChars + incorrectChars;
        const accuracy = total > 0 ? Math.round((correctChars / total) * 100) : 100;

        finalWpm.textContent = wpm;
        finalAccuracy.textContent = accuracy + '%';
        finalChars.textContent = correctChars;
        resultPanel.classList.remove('hidden');
    }

    function reset() {
        clearInterval(timer);
        charIndex = 0;
        correctChars = 0;
        incorrectChars = 0;
        isStarted = false;
        isFinished = false;
        timeLeft = selectedTime;
        
        inputField.value = '';
        inputField.disabled = false;
        inputField.focus();
        
        wpmEl.textContent = '0';
        accuracyEl.textContent = '100%';
        timerEl.textContent = selectedTime + 's';
        
        resultPanel.classList.add('hidden');
        
        generateText();
    }

    inputField.addEventListener('input', (e) => {
        if (isFinished) return;

        if (!isStarted) {
            isStarted = true;
            startTimer();
        }

        const inputValue = e.target.value;
        const currentChar = text[charIndex];

        if (inputValue.length > charIndex) {
            if (inputValue[charIndex] === currentChar) {
                correctChars++;
            } else {
                incorrectChars++;
            }
            charIndex++;
            updateAccuracy();

            if (charIndex >= text.length) {
                finishGame();
            }
        }

        updateText();
    });

    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && charIndex > 0) {
            charIndex--;
            const prevChar = inputField.value[charIndex];
            if (prevChar === text[charIndex]) {
                correctChars--;
            } else {
                incorrectChars--;
            }
            updateAccuracy();
        }
    });

    restartBtn.addEventListener('click', reset);

    timeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTime = parseInt(btn.dataset.time);
            reset();
        });
    });

    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    generateText();
    inputField.focus();
});
