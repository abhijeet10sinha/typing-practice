const ROWS = [
    ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift '],
    ['Space']
];

let selectedKeys = new Set(['a', 's', 'd', 'f', 'j', 'k', 'l', ';']);
let fullText = "";
let charIdx = 0;
let startTime = null;
let errors = 0;
let totalTyped = 0;
let audioCtx = null;
let isMusicOn = false;
let isBuzzerOn = true;

function initKeyboard() {
    const container = document.getElementById('kb-container');

    ROWS.forEach(row => {
        const div = document.createElement('div');
        div.className = 'key-row';

        row.forEach(key => {
            const btn = document.createElement('button');

            btn.className = 'kb-key';

            if (['Backspace', 'Tab', 'Enter', 'Shift', 'Shift '].includes(key)) {
                btn.classList.add('k-wide');
            }

            if (key === 'Space') {
                btn.classList.add('k-space');
            }

            if (selectedKeys.has(key)) {
                btn.classList.add('selected');
            }

            btn.innerText = key;

            btn.onclick = () => {
                if (selectedKeys.has(key)) {
                    selectedKeys.delete(key);
                    btn.classList.remove('selected');
                } else {
                    selectedKeys.add(key);
                    btn.classList.add('selected');
                }
            };

            div.appendChild(btn);
        });

        container.appendChild(div);
    });
}

function selectAll() {
    ROWS.flat().forEach(k => selectedKeys.add(k));

    document.querySelectorAll('.kb-key').forEach(b => {
        b.classList.add('selected');
    });
}

function clearAll() {
    selectedKeys.clear();

    document.querySelectorAll('.kb-key').forEach(b => {
        b.classList.remove('selected');
    });
}

function generateText() {
    const pool = Array.from(selectedKeys).map(k => k === 'Space' ? ' ' : k);

    let str = "";

    for (let i = 0; i < 60; i++) {
        let chunkLen = Math.floor(Math.random() * 4) + 2;

        for (let j = 0; j < chunkLen; j++) {
            str += pool[Math.floor(Math.random() * pool.length)];
        }

        str += " ";
    }

    fullText = str.replace(/\s\s+/g, ' ').trim();
}

function startPractice() {
    if (selectedKeys.size < 2) {
        return alert("Select at least 2 keys!");
    }

    document.getElementById('setup-view').classList.add('hidden');

    document.getElementById('practice-view').classList.remove('hidden');

    generateText();
    render();
    focusInput();
}

function toggleMusic() {
    isMusicOn = !isMusicOn;

    const m = document.getElementById('bg-music');
    const btn = document.getElementById('btn-music');

    if (isMusicOn) {
        m.play();
        btn.innerText = "🎵 Music: On";
    } else {
        m.pause();
        btn.innerText = "🎵 Music: Off";
    }
}

function toggleBuzzer() {
    isBuzzerOn = !isBuzzerOn;

    document.getElementById('btn-buzzer').innerText =
        isBuzzerOn ? "🔔 Buzzer: On" : "🔔 Buzzer: Off";
}

function playBuzzer() {
    if (!isBuzzerOn) return;

    if (!audioCtx) {
        audioCtx = new AudioContext();
    }

    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 85;

    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);

    osc.connect(g);
    g.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

function render() {
    const display = document.getElementById('text-display');

    display.innerHTML = fullText.split('').map((c, i) => {

        let state =
            i < charIdx
                ? 'correct'
                : (i === charIdx ? 'current' : '');

        return `<span class="char ${state}">${c === ' ' ? '&nbsp;' : c}</span>`;

    }).join('');
}

function focusInput() {
    document.getElementById('hidden-input').focus();
}

document.getElementById('hidden-input').addEventListener('input', (e) => {

    if (!startTime) {
        startTime = Date.now();
        setInterval(updateStats, 200);
    }

    const char = e.target.value.slice(-1);

    totalTyped++;

    if (char === fullText[charIdx]) {
        charIdx++;
    } else {
        errors++;
        playBuzzer();
    }

    e.target.value = "";

    render();
});

function updateStats() {
    const elapsed = (Date.now() - startTime) / 1000;

    document.getElementById('wpm').innerText =
        Math.round((charIdx / 5) / (elapsed / 60)) || 0;

    document.getElementById('acc').innerText =
        Math.round(((totalTyped - errors) / totalTyped) * 100) + "%";

    document.getElementById('timer').innerText =
        Math.floor(elapsed) + "s";

    document.getElementById('prog').innerText =
        Math.round((charIdx / fullText.length) * 100) + "%";
}

initKeyboard();