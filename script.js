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
let timerInterval = null;
let errors = 0;
let totalTyped = 0;
let audioCtx = null;
let isMusicOn = false;
let isBuzzerOn = true;
let isKeyboardSoundOn = true;

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

const WORD_BANK = [
    // Home row / small combinations
    "a", "as", "ask", "asks", "sad", "dad", "lad", "lass", "fall", "falls",
    "flask", "salad", "all", "add", "adds", "ads", "afar", "alas",

    // Common short words
    "am", "an", "and", "any", "are", "arm", "art", "at", "ate", "bad",
    "bag", "bar", "bat", "be", "bed", "bee", "big", "bin", "bit", "boy",
    "bus", "but", "buy", "by", "can", "cap", "car", "cat", "cow", "cry",
    "cup", "cut", "day", "did", "die", "dig", "dog", "dry", "ear", "eat",
    "egg", "end", "far", "fat", "few", "fit", "fix", "fly", "for", "fox",
    "fun", "get", "go", "got", "gun", "had", "has", "hat", "he", "her",
    "him", "his", "hit", "hot", "how", "ice", "if", "in", "is", "it",
    "job", "joy", "key", "kid", "lab", "law", "lay", "leg", "let", "lie",
    "log", "lot", "low", "mad", "man", "map", "may", "men", "mix", "mom",
    "mud", "net", "new", "no", "not", "now", "off", "old", "on", "one",
    "or", "our", "out", "own", "pay", "pen", "pet", "put", "red", "run",
    "sad", "say", "sea", "see", "set", "she", "sit", "six", "sky", "son",
    "sun", "ten", "the", "too", "top", "toy", "try", "two", "use", "war",
    "was", "way", "we", "wet", "who", "why", "win", "yes", "yet", "you",

    // Common medium words
    "able", "about", "above", "after", "again", "air", "also", "always",
    "animal", "answer", "apple", "area", "around", "baby", "back", "ball",
    "bank", "base", "bear", "beat", "best", "bird", "blue", "boat", "body",
    "book", "born", "both", "bring", "build", "cake", "call", "came",
    "card", "care", "case", "city", "class", "clean", "clear", "close",
    "cold", "come", "cook", "cool", "copy", "cost", "data", "date",
    "deep", "desk", "done", "door", "down", "draw", "dream", "drink",
    "drive", "each", "early", "easy", "else", "even", "ever", "every",
    "face", "fact", "fair", "fall", "family", "fast", "feel", "file",
    "fill", "find", "fine", "fire", "first", "fish", "five", "food",
    "foot", "form", "free", "friend", "full", "game", "gave", "girl",
    "give", "glass", "goes", "gold", "good", "great", "green", "group",
    "grow", "hand", "hard", "have", "head", "hear", "heart", "help",
    "here", "high", "home", "hope", "hour", "house", "idea", "keep",
    "kind", "king", "know", "land", "large", "last", "late", "learn",
    "left", "less", "life", "light", "like", "line", "list", "live",
    "long", "look", "lost", "love", "made", "main", "make", "many",
    "mark", "mean", "mind", "miss", "money", "month", "moon", "more",
    "morning", "most", "move", "much", "must", "name", "near", "need",
    "never", "next", "nice", "night", "note", "open", "page", "park",
    "part", "pass", "past", "path", "place", "plan", "play", "point",
    "power", "price", "problem", "pull", "push", "rain", "read", "real",
    "right", "ring", "rise", "road", "room", "rule", "same", "save",
    "school", "second", "seem", "self", "sell", "send", "short", "show",
    "side", "simple", "sing", "slow", "small", "snow", "soft", "some",
    "soon", "sound", "space", "stand", "start", "stay", "step", "still",
    "stop", "story", "study", "sure", "table", "take", "talk", "team",
    "tell", "than", "thank", "that", "their", "them", "then", "there",
    "these", "thing", "think", "this", "those", "three", "time", "today",
    "together", "took", "tree", "true", "turn", "type", "under", "until",
    "upon", "very", "voice", "wait", "walk", "wall", "want", "warm",
    "watch", "water", "week", "well", "went", "were", "what", "when",
    "where", "white", "will", "wind", "word", "work", "world", "write",
    "wrong", "year", "young",

    // Typing / keyboard words
    "type", "typing", "practice", "speed", "accuracy", "keyboard", "key",
    "keys", "finger", "fingers", "press", "space", "shift", "enter",
    "input", "text", "letter", "letters", "word", "words", "line",
    "correct", "wrong", "mistake", "focus", "timer", "score",

    // Data / coding / career words
    "code", "coding", "script", "javascript", "html", "css", "python",
    "data", "science", "analyst", "analysis", "table", "chart", "graph",
    "query", "sql", "power", "powerbi", "dashboard", "report", "project",
    "file", "folder", "github", "portfolio", "price", "area", "sales",
    "profit", "revenue", "market", "business", "client", "email", "call",
    "chat", "support", "career", "resume", "skill", "skills",

    // Longer common words
    "beautiful", "because", "between", "business", "children", "complete",
    "computer", "country", "different", "important", "interest", "language",
    "learning", "machine", "morning", "personal", "possible", "practice",
    "question", "remember", "sentence", "something", "together", "training",
    "understand", "website", "without", "working",

    "a", "as", "ask", "asks", "sad", "dad", "lad", "lass", "fall", "falls",

    // Semicolon practice
    "ask;", "sad;", "dad;", "lad;", "fall;", "falls;", "class;", "glass;",
    "all;", "add;", "data;", "code;", "type;", "word;", "line;", "file;",
    "if;", "else;", "for;", "while;", "return;", "print;", "input;",

    "the", "there", "their", "then", "this", "that"
];

function canTypeWord(word, allowedKeys) {
    return word.split('').every(char => allowedKeys.has(char));
}

function generateText() {
    const allowedKeys = new Set(
        Array.from(selectedKeys)
            .map(k => k.toLowerCase())
            .filter(k => k.length === 1)
    );

    let availableWords = WORD_BANK.filter(word => canTypeWord(word, allowedKeys));

    if (availableWords.length < 5) {
        alert("Not enough meaningful words found for selected keys. Please select more alphabets.");
        return;
    }

    let words = [];

    for (let i = 0; i < 60; i++) {
        const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
        words.push(randomWord);
    }

    fullText = words.join(" ");
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

function playKeyboardSound() {
    if (!isKeyboardSoundOn) return;

    const clickSound = new Audio("sound/single-key-press.mp3");
    clickSound.volume = 0.35;
    clickSound.currentTime = 0;
    clickSound.play();
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
        timerInterval = setInterval(updateStats, 200);
    }

    const char = e.target.value.slice(-1);

    playKeyboardSound();

    totalTyped++;

    if (char === fullText[charIdx]) {
        charIdx++;

        if (charIdx >= fullText.length) {
            clearInterval(timerInterval);
            updateStats();
            document.getElementById('hidden-input').blur();
            alert("Typing completed!");
        }

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