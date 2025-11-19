// ========== ULTIMATE TETRIS: OPTIMIZED ENGINE ==========
// Features: 200+ (Visuals, Physics, Meta, Network, Chaos)

// --- CONSTANTS & CONFIGURATION ---
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = {
    I: '#00f0f0', O: '#f0f000', T: '#a000f0', S: '#00f000',
    Z: '#f00000', J: '#0000f0', L: '#f0a000',
    GHOST: 'rgba(255, 255, 255, 0.3)',
    RAINBOW: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
    NEON: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#80ff00', '#ff0080'],
    FIRE: ['#ff0000', '#ff4400', '#ff8800', '#ffcc00', '#ffff00', '#ffffff', '#ffaa00'],
    ICE: ['#00ffff', '#00aaff', '#0088ff', '#0044ff', '#0000ff', '#4400ff', '#8800ff']
};

const SHAPES = {
    I: [[[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]]],
    O: [[[1, 1], [1, 1]]],
    T: [[[0, 1, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 1, 0]], [[0, 0, 0], [1, 1, 1], [0, 1, 0]], [[0, 1, 0], [1, 1, 0], [0, 1, 0]]],
    S: [[[0, 1, 1], [1, 1, 0], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 0, 1]]],
    Z: [[[1, 1, 0], [0, 1, 1], [0, 0, 0]], [[0, 0, 1], [0, 1, 1], [0, 1, 0]]],
    J: [[[1, 0, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 1], [0, 1, 0], [0, 1, 0]], [[0, 0, 0], [1, 1, 1], [0, 0, 1]], [[0, 1, 0], [0, 1, 0], [1, 1, 0]]],
    L: [[[0, 0, 1], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 0], [0, 1, 1]], [[0, 0, 0], [1, 1, 1], [1, 0, 0]], [[1, 1, 0], [0, 1, 0], [0, 1, 0]]]
};

// --- GLOBAL STATE ---
const State = {
    // Core
    board: [],
    score: 0,
    level: 1,
    lines: 0,
    combo: 0,
    maxCombo: 0,
    gameOver: false,
    isPaused: false,
    gameStartTime: 0,
    lastTime: 0,
    dropCounter: 0,
    dropInterval: 1000,

    // Pieces
    currentPiece: null,
    nextPieceQueue: [],
    holdPiece: null,
    canHold: true,
    pieceBag: [],

    // Physics (Softbody)
    softbodyMode: false,
    softbodyClusters: [],
    gravity: 0.3,
    physicsSteps: 3,

    // Visuals
    particles: [],
    screenShake: 0,
    flashEffect: 0,
    rainbowMode: false,
    trailEffect: false,
    bloomEffect: false,
    motionBlur: false,
    weatherSystem: 'clear',
    weatherParticles: [],

    // Modes & Meta
    gameMode: 'classic',
    fuckassMode: false,
    fuckassIntensity: 1.0,
    fuckassTimer: 0,
    fuckassRotation: 0,
    fuckassZoom: 1.0,
    reversedControls: false,
    chaosMode: false,
    aiAssistance: false,

    // Network (Simulated)
    network: {
        connected: false,
        latency: 0,
        socialFeed: [],
        matchmaking: { active: false }
    },

    // Stats
    stats: {
        totalPieces: 0, totalLines: 0, gamesPlayed: 0,
        singleLines: 0, doubleLines: 0, tripleLines: 0, tetrisLines: 0,
        tSpins: 0, perfectClears: 0, highScore: 0,
        totalScore: 0, playTime: 0, longestGame: 0, fastestTetris: Infinity, totalRotations: 0
    },

    // Advanced Features
    achievements: [],
    unlockedAchievements: [],
    currency: 0,
    shopItems: [],
    environmentalHazards: [],
    activePowerUps: [],
    powerUpCooldowns: {},

    // Network Manager
    networkManager: null,
    multiplayerMode: false
};

// --- DOM ELEMENTS ---
let canvas, ctx, nextCanvas, nextCtx, holdCanvas, holdCtx;
let uiElements = {};

// --- INITIALIZATION ---
function init() {
    console.log('Initializing Ultimate Tetris Engine...');

    // Setup Canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');
    holdCanvas = document.getElementById('holdCanvas');
    holdCtx = holdCanvas.getContext('2d');

    // Setup UI Refs
    uiElements = {
        score: document.getElementById('score'),
        level: document.getElementById('level'),
        lines: document.getElementById('lines'),
        combo: document.getElementById('combo'),
        scoreMobile: document.getElementById('scoreMobile'),
        levelMobile: document.getElementById('levelMobile'),
        modeIndicator: document.getElementById('modeIndicator'),
        gameOverOverlay: document.getElementById('gameOverOverlay'),
        finalScore: document.getElementById('finalScore'),
        highScoreDisplay: document.getElementById('highScoreDisplay')
    };

    // Load Settings
    loadSettings();

    // Initialize Systems
    initNetworkFeatures();
    initWeatherSystem();
    initAchievementSystem();
    initEconomySystem();
    initEnvironmentalHazards();

    // Start Game
    resetGame();

    // Input Listeners
    setupInputs();

    // Game Loop
    if (window.animationId) cancelAnimationFrame(window.animationId);
    State.lastTime = performance.now();
    gameLoop();
}

function resetGame() {
    State.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    State.score = 0;
    State.level = 1;
    State.lines = 0;
    State.combo = 0;
    State.gameOver = false;
    State.isPaused = false;
    State.dropInterval = 1000;
    State.softbodyClusters = [];
    State.particles = [];
    State.nextPieceQueue = [];
    State.holdPiece = null;
    State.canHold = true;
    State.gameStartTime = Date.now();

    // Fill Queue
    for (let i = 0; i < 6; i++) {
        State.nextPieceQueue.push(createPiece());
    }
    spawnPiece();

    updateDisplay();
    if (uiElements.gameOverOverlay) uiElements.gameOverOverlay.style.display = 'none';
}

// --- CORE GAME LOOP ---
function gameLoop(time = 0) {
    if (State.gameOver) {
        window.animationId = requestAnimationFrame(gameLoop);
        return;
    }

    if (State.isPaused) {
        drawPaused();
        window.animationId = requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = time - State.lastTime;
    State.lastTime = time;

    update(deltaTime);
    draw();

    window.animationId = requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    // Drop Logic
    State.dropCounter += deltaTime;
    if (State.dropCounter > State.dropInterval) {
        drop();
    }

    // Systems Update
    updatePhysics(deltaTime);
    updateParticles(deltaTime);
    updateNetwork(deltaTime);
    updateWeather(deltaTime);
    updateEnvironmentalHazards(deltaTime);
    updatePowerUps(deltaTime);

    if (State.fuckassMode) updateFuckassMode(deltaTime);
    if (State.aiAssistance) updateAI(deltaTime);
}

// --- INPUT HANDLING ---
function setupInputs() {
    document.removeEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);

    const restartBtn = document.getElementById('restartButton');
    if (restartBtn) restartBtn.onclick = init;

    const fuckassBtn = document.getElementById('fuckassButton');
    if (fuckassBtn) fuckassBtn.onclick = toggleFuckassMode;
}

function handleKeyDown(e) {
    if (State.gameOver) {
        if (e.key === 'Enter') init();
        return;
    }

    if (e.key === 'p' || e.key === 'P') {
        State.isPaused = !State.isPaused;
        return;
    }

    if (State.isPaused) return;

    // Controls
    const dir = State.reversedControls ? -1 : 1;
    switch (e.key) {
        case 'ArrowLeft': move(-1 * dir); break;
        case 'ArrowRight': move(1 * dir); break;
        case 'ArrowDown': drop(); State.score++; updateDisplay(); break;
        case 'ArrowUp': case 'x': case 'X': rotate(1); break;
        case 'z': case 'Z': rotate(-1); break;
        case ' ': hardDrop(); break;
        case 'c': case 'C': hold(); break;

        // Feature Toggles
        case 's': case 'S': toggleSoftbodyMode(); break;
        case 'r': case 'R': State.rainbowMode = !State.rainbowMode; break;
        case 'i': case 'I': State.invisibleMode = !State.invisibleMode; break;
        case 'g': case 'G': State.ghostPieceEnabled = !State.ghostPieceEnabled; break;
        case 't': case 'T': State.trailEffect = !State.trailEffect; break;
        case 'f': case 'F': toggleFuckassMode(); break;
        case 'b': case 'B': useBomb(); break;

        // Power-ups
        case '1': activatePowerUp('slow_time'); break;
        case '2': activatePowerUp('double_points'); break;
        case '3': activatePowerUp('invincibility'); break;
        case '4': activatePowerUp('magnet'); break;

        // Debug / Cheats
        case '5': State.aiAssistance = !State.aiAssistance; break;
        case '6': State.bloomEffect = !State.bloomEffect; break;
    }
}

// --- PIECE LOGIC ---
function createPiece() {
    if (State.pieceBag.length === 0) {
        State.pieceBag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        shuffleArray(State.pieceBag);
    }
    const type = State.pieceBag.pop();
    return {
        type,
        shape: SHAPES[type][0],
        rotation: 0,
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0][0].length / 2),
        y: 0,
        color: COLORS[type],
        special: Math.random() < 0.05 // 5% chance for special piece
    };
}

function spawnPiece() {
    State.currentPiece = State.nextPieceQueue.shift();
    State.nextPieceQueue.push(createPiece());
    State.canHold = true;
    State.stats.totalPieces++;

    if (collision(State.currentPiece.x, State.currentPiece.y, State.currentPiece.shape)) {
        endGame();
    }
}

function move(dir) {
    if (!State.currentPiece) return;
    State.currentPiece.x += dir;
    if (collision(State.currentPiece.x, State.currentPiece.y, State.currentPiece.shape)) {
        State.currentPiece.x -= dir;
    }
}

function rotate(dir) {
    if (!State.currentPiece) return;
    const piece = State.currentPiece;
    const shapes = SHAPES[piece.type];
    const oldRotation = piece.rotation;
    piece.rotation = (piece.rotation + dir + shapes.length) % shapes.length;
    const newShape = shapes[piece.rotation];

    // Wall Kicks (Simplified SRS)
    const kicks = [[0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1], [-2, 0], [2, 0]];
    for (let [kx, ky] of kicks) {
        if (!collision(piece.x + kx, piece.y + ky, newShape)) {
            piece.x += kx;
            piece.y += ky;
            piece.shape = newShape;
            return;
        }
    }
    piece.rotation = oldRotation; // Revert if failed
}

function drop() {
    if (!State.currentPiece) return;
    State.currentPiece.y++;
    if (collision(State.currentPiece.x, State.currentPiece.y, State.currentPiece.shape)) {
        State.currentPiece.y--;
        merge();
        State.dropCounter = 0;
        return true; // Landed
    }
    State.dropCounter = 0;
    return false;
}

function hardDrop() {
    if (!State.currentPiece) return;
    while (!collision(State.currentPiece.x, State.currentPiece.y + 1, State.currentPiece.shape)) {
        State.currentPiece.y++;
        State.score += 2;
    }
    merge();
    State.screenShake = 5;
    updateDisplay();
}

function hold() {
    if (!State.canHold || !State.currentPiece) return;
    State.canHold = false;

    if (State.holdPiece === null) {
        State.holdPiece = State.currentPiece.type;
        spawnPiece();
    } else {
        const temp = State.holdPiece;
        State.holdPiece = State.currentPiece.type;
        State.currentPiece = {
            type: temp,
            shape: SHAPES[temp][0],
            rotation: 0,
            x: Math.floor(COLS / 2) - 2,
            y: 0,
            color: COLORS[temp]
        };
    }
}

function collision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                if (newY >= 0 && State.board[newY][newX]) return true;
            }
        }
    }
    return false;
}

function merge() {
    const piece = State.currentPiece;
    let mergePositions = [];

    piece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                const by = piece.y + y;
                const bx = piece.x + x;
                if (by >= 0) {
                    State.board[by][bx] = piece.color;
                    mergePositions.push({ x: bx, y: by });
                }
            }
        });
    });

    createMergeParticles(mergePositions);

    if (State.softbodyMode) {
        // Convert merged blocks to physics bodies
        // Simplified for now: just clear board at those spots and spawn bodies
        // Real implementation needs cluster logic
        initSoftbodyPhysics();
    }

    clearLines();
    spawnPiece();
}

function clearLines() {
    // Check for lines
    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
        if (State.board[y].every(cell => cell !== 0)) {
            State.board.splice(y, 1);
            State.board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++; // Check same row again
        }
    }

    if (linesCleared > 0) {
        State.lines += linesCleared;
        State.score += linesCleared * 100 * State.level;
        State.combo++;

        // Multiplayer Garbage
        if (State.multiplayerMode && State.networkManager) {
            State.networkManager.sendGarbage(linesCleared);
        }

        // Level Up
        if (State.lines >= State.level * 10) {
            State.level++;
            State.dropInterval = Math.max(100, 1000 - (State.level - 1) * 100);
            // Assuming createFuckassNotification is defined elsewhere or will be added
            // createFuckassNotification(`LEVEL UP! ${State.level}`);
        }

        // Effects
        State.screenShake = linesCleared * 2;
        if (linesCleared === 4) State.flashEffect = 0.5;

        if (State.network.connected) {
            State.network.matchmaking.active = true; // Simulate activity
        }
    } else {
        State.combo = 0;
    }
    updateDisplay();
}

// --- UTILS ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function adjustColor(color, amount) {
    return color; // Placeholder for gradient logic
}

function updateDisplay() {
    if (uiElements.score) uiElements.score.textContent = State.score;
    if (uiElements.level) uiElements.level.textContent = State.level;
    if (uiElements.lines) uiElements.lines.textContent = State.lines;
    if (uiElements.combo) uiElements.combo.textContent = State.combo > 1 ? `${State.combo}x` : '';

    if (uiElements.scoreMobile) uiElements.scoreMobile.textContent = State.score;
    if (uiElements.levelMobile) uiElements.levelMobile.textContent = State.level;
}

function endGame() {
    State.gameOver = true;
    if (uiElements.gameOverOverlay) uiElements.gameOverOverlay.style.display = 'flex';

    // Multiplayer Notification
    if (State.multiplayerMode && State.networkManager) {
        State.networkManager.sendData({ type: 'GAME_OVER' });
        document.querySelector('#gameOverOverlay h2').textContent = 'GAME OVER';
        document.getElementById('restartButton').textContent = 'WAITING...';
        document.getElementById('restartButton').onclick = null; // Wait for winner to rematch
    } else {
        document.querySelector('#gameOverOverlay h2').textContent = 'GAME OVER';
        document.getElementById('restartButton').textContent = 'PLAY AGAIN';
        document.getElementById('restartButton').onclick = () => {
            resetGame();
            document.getElementById('gameOverOverlay').style.display = 'none';
        };
    }

    // Update Stats
    document.getElementById('finalScore').textContent = State.score;
    document.getElementById('finalLines').textContent = State.lines;
    document.getElementById('finalLevel').textContent = State.level;

    let isNewRecord = false;
    if (State.score > State.stats.highScore) {
        State.stats.highScore = State.score;
        isNewRecord = true;
        saveSettings();
    }

    document.getElementById('finalHighScore').textContent = State.stats.highScore;

    const badge = document.getElementById('newHighScoreBadge');
    if (badge) badge.style.display = isNewRecord ? 'inline-block' : 'none';
}

function loadSettings() {
    const saved = localStorage.getItem('tetrisUltimateSettings');
    if (saved) {
        const data = JSON.parse(saved);
        State.stats = data.stats || State.stats;
        State.softbodyMode = data.softbodyMode || false;
    }
}

function saveSettings() {
    localStorage.setItem('tetrisUltimateSettings', JSON.stringify({
        stats: State.stats,
        softbodyMode: State.softbodyMode
    }));
}

// --- PHYSICS SYSTEM (Softbody) ---
function initSoftbodyPhysics() {
    // Rebuild clusters from board state
    State.softbodyClusters = [];
    const visited = Array(ROWS).fill().map(() => Array(COLS).fill(false));

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (State.board[y][x] && !visited[y][x]) {
                // Flood fill to find cluster
                const cluster = { blocks: [], vx: 0, vy: 0, x: x, y: y, settled: false };
                const queue = [{ x, y }];
                visited[y][x] = true;

                while (queue.length) {
                    const b = queue.shift();
                    cluster.blocks.push({
                        dx: b.x - x, // Relative pos
                        dy: b.y - y,
                        color: State.board[b.y][b.x]
                    });

                    // Check neighbors
                    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
                        const nx = b.x + dx, ny = b.y + dy;
                        if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS &&
                            State.board[ny][nx] && !visited[ny][nx]) {
                            visited[ny][nx] = true;
                            queue.push({ x: nx, y: ny });
                        }
                    });
                }
                State.softbodyClusters.push(cluster);
            }
        }
    }
    // Clear board as physics takes over
    State.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

function updatePhysics(dt) {
    if (!State.softbodyMode) return;

    const steps = State.physicsSteps;
    const stepDt = (dt / 1000) / steps;

    for (let s = 0; s < steps; s++) {
        State.softbodyClusters.forEach(cluster => {
            if (cluster.settled) return;

            cluster.vy += State.gravity * stepDt * 60;
            cluster.y += cluster.vy * stepDt * 60;
            cluster.x += cluster.vx * stepDt * 60;

            // Floor collision
            let maxY = 0;
            cluster.blocks.forEach(b => maxY = Math.max(maxY, b.dy));

            if (cluster.y + maxY >= ROWS - 1) {
                cluster.y = ROWS - 1 - maxY;
                cluster.vy *= -0.5; // Bounce
                cluster.vx *= 0.9; // Friction
                if (Math.abs(cluster.vy) < 0.1) cluster.settled = true;
            }
        });
    }
}

function toggleSoftbodyMode() {
    State.softbodyMode = !State.softbodyMode;
    const ind = document.getElementById('modeIndicator');

    if (State.softbodyMode) {
        initSoftbodyPhysics();
        if (ind) ind.innerHTML = '<p class="softbody">Jelly</p>';
    } else {
        // Bake physics back to board
        State.board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        State.softbodyClusters.forEach(c => {
            c.blocks.forEach(b => {
                const bx = Math.round(c.x + b.dx);
                const by = Math.round(c.y + b.dy);
                if (bx >= 0 && bx < COLS && by >= 0 && by < ROWS) {
                    State.board[by][bx] = b.color;
                }
            });
        });
        State.softbodyClusters = [];
        if (ind) ind.innerHTML = '<p>Normal</p>';
    }
}

// --- VISUALS & PARTICLES ---
function createMergeParticles(positions) {
    positions.forEach(pos => {
        for (let i = 0; i < 5; i++) {
            State.particles.push({
                x: pos.x * BLOCK_SIZE + BLOCK_SIZE / 2,
                y: pos.y * BLOCK_SIZE + BLOCK_SIZE / 2,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5 - 2,
                life: 1.0,
                color: State.currentPiece ? State.currentPiece.color : '#fff',
                size: Math.random() * 4 + 2
            });
        }
    });
}

function updateParticles(dt) {
    State.particles = State.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity
        p.life -= 0.02;
        return p.life > 0;
    });
}

function initWeatherSystem() {
    for (let i = 0; i < 50; i++) {
        State.weatherParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 1,
            size: Math.random() * 2
        });
    }
}

function updateWeather(dt) {
    if (State.weatherSystem === 'clear') return;
    State.weatherParticles.forEach(p => {
        p.y += p.speed;
        if (p.y > canvas.height) {
            p.y = -5;
            p.x = Math.random() * canvas.width;
        }
    });
}

// --- FUCKASS MODE ---
function toggleFuckassMode() {
    State.fuckassMode = !State.fuckassMode;
    const ind = document.getElementById('modeIndicator');

    if (State.fuckassMode) {
        State.fuckassIntensity = 1.0;
        State.fuckassTimer = 0;
        State.fuckassRotation = 0;
        State.fuckassZoom = 1.0;

        document.body.classList.add('fuckass-active');
        if (ind) ind.innerHTML = '<p style="color:#ff0080; font-weight:bold; animation: fuckassTitle 0.5s infinite;">🤬 FUCKASS MODE</p>';

        alert('🤬 FUCKASS MODE ACTIVATED! 🤬\n\nThis mode is challenging but playable!\n\n• Occasional random penalties\n• Sometimes reversed controls\n• Random garbage blocks\n• Visual distortions\n• Board tricks\n• But you can win!\n\nGood luck!');

        setTimeout(() => applyRandomFuckassPenalty(), 2000);
    } else {
        State.reversedControls = false;
        State.fuckassRotation = 0;
        State.fuckassZoom = 1.0;

        document.body.classList.remove('fuckass-active');
        if (ind) ind.innerHTML = '<p>Normal</p>';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}

function updateFuckassMode(dt) {
    State.fuckassTimer += dt;
    State.fuckassIntensity = Math.min(3, 1 + State.fuckassTimer / 120000);

    // Random penalties
    if (Math.random() < 0.001 * State.fuckassIntensity) {
        applyRandomFuckassPenalty();
    }

    // Speed up drop
    if (Math.random() < 0.0003 * State.fuckassIntensity) {
        State.dropInterval = Math.max(200, State.dropInterval - 50);
    }

    // Reverse controls
    if (Math.random() < 0.0001) {
        State.reversedControls = !State.reversedControls;
        createFuckassNotification('🔄 Controls Reversed!');
    }

    // Garbage spawns
    if (Math.random() < 0.0005 * State.fuckassIntensity) {
        spawnRandomGarbageBlock();
    }

    // Mercy
    if (Math.random() < 0.001 && Math.random() < 0.5) {
        removeRandomBottomRow();
    }

    // Screen shake
    if (Math.random() < 0.003) {
        State.screenShake = 10 * State.fuckassIntensity;
        State.flashEffect = 0.3;
    }
}

function applyFuckassEffects() {
    // Rotation
    State.fuckassRotation += (Math.random() - 0.5) * 0.005;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.sin(State.fuckassTimer / 3000) * 0.03 + State.fuckassRotation);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Zoom
    State.fuckassZoom = 1 + Math.sin(State.fuckassTimer / 1500) * 0.05;
    ctx.scale(State.fuckassZoom, State.fuckassZoom);

    // Filters
    const hueShift = Math.sin(State.fuckassTimer / 800) * 60;
    const brightness = 1 + Math.sin(State.fuckassTimer / 500) * 0.1;
    ctx.filter = `hue-rotate(${hueShift}deg) saturate(1.3) contrast(1.1) brightness(${brightness})`;

    // Invert
    if (Math.random() < 0.002) {
        ctx.filter += ' invert(1)';
    }

    // Alpha
    ctx.globalAlpha = 0.95 + Math.random() * 0.05;
}

function applyRandomFuckassPenalty() {
    const penalties = [
        () => {
            // Garbage Line
            State.board.pop();
            const newLine = Array(COLS).fill(1).map(() => Math.random() < 0.3 ? Math.floor(Math.random() * 7) + 1 : 0);
            State.board.unshift(newLine);
            createFuckassNotification('💩 Garbage Line!');
            if (State.softbodyMode) initSoftbodyPhysics();
        },
        () => {
            // Shuffle Row
            const row = Math.floor(Math.random() * ROWS);
            State.board[row].sort(() => Math.random() - 0.5);
            createFuckassNotification('🎲 Row Shuffled!');
            if (State.softbodyMode) initSoftbodyPhysics();
        },
        () => {
            // Invisible Piece
            State.invisibleMode = true;
            setTimeout(() => State.invisibleMode = false, 3000);
            createFuckassNotification('👻 Invisible Piece!');
        },
        () => {
            // Rotate Piece
            if (State.currentPiece) {
                rotate(1);
            }
            createFuckassNotification('🌀 Rotation!');
        },
        () => {
            // Disable Hold
            State.canHold = false;
            setTimeout(() => State.canHold = true, 5000);
            createFuckassNotification('🚫 Hold Disabled!');
        },
        () => {
            // Speed Up
            const oldInterval = State.dropInterval;
            State.dropInterval = Math.max(300, State.dropInterval * 0.7);
            setTimeout(() => State.dropInterval = oldInterval, 5000);
            createFuckassNotification('⚡ Speed Up!');
        },
        () => {
            // Steal Points
            State.score = Math.max(0, State.score - Math.floor(Math.random() * 200));
            createFuckassNotification('💸 Points Stolen!');
            updateDisplay();
        },
        () => {
            // Shift Piece
            if (State.currentPiece) {
                State.currentPiece.x = Math.floor(Math.random() * (COLS - 4));
            }
            createFuckassNotification('🌀 Shifted!');
        },
        () => {
            // Random Blocks
            for (let i = 0; i < 5; i++) {
                const x = Math.floor(Math.random() * COLS);
                const y = Math.floor(Math.random() * ROWS);
                State.board[y][x] = Math.floor(Math.random() * 7) + 1;
            }
            createFuckassNotification('💥 Random Blocks!');
            if (State.softbodyMode) initSoftbodyPhysics();
        }
    ];

    const penalty = penalties[Math.floor(Math.random() * penalties.length)];
    penalty();

    State.screenShake = 15;
    State.flashEffect = 0.3;
}

function spawnRandomGarbageBlock() {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * (ROWS / 2));
    if (State.board[y] && State.board[y][x] === 0) {
        State.board[y][x] = Math.floor(Math.random() * 7) + 1;
    }
    if (State.softbodyMode) initSoftbodyPhysics();
}

function removeRandomBottomRow() {
    const row = Math.floor(Math.random() * 5) + (ROWS - 5);
    if (State.board[row]) {
        State.board[row] = Array(COLS).fill(0);
        createFuckassNotification('✨ Mercy!');
    }
    if (State.softbodyMode) initSoftbodyPhysics();
}

function createFuckassNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fuckass-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: ${Math.random() * 50 + 10}%;
        left: ${Math.random() * 50 + 25}%;
        background: linear-gradient(45deg, #ff0080, #8000ff, #00ff80);
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-size: 24px;
        font-weight: bold;
        font-family: 'Comic Sans MS', cursive;
        z-index: 10000;
        box-shadow: 0 0 30px rgba(255, 0, 255, 0.8);
        animation: fuckassNotif 3s ease-out forwards;
        transform: rotate(${Math.random() * 20 - 10}deg);
        text-shadow: 2px 2px 4px black;
        pointer-events: none;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// --- NETWORK SYSTEM (Advanced) ---
function initNetworkFeatures() {
    if (!State.networkManager) {
        State.networkManager = createNetworkManager();
    }
    State.networkManager.boot({ enableMultiplayer: State.multiplayerMode });
    if (typeof window !== 'undefined') {
        window.tetrisNetwork = State.networkManager;
    }
}

function updateNetwork(dt) {
    if (State.networkManager) {
        State.networkManager.tick(dt);
    }
}

function createNetworkManager() {
    const state = {
        connected: false,
        latency: 0,
        lastLatencySample: 0,
        matchmaking: { active: false, eta: 0, deadline: 0 },
        servers: [],
        socialFeed: [],
        tournaments: []
    };
    const listeners = new Map();

    function boot(options = {}) {
        if (!state.connected) connect();
        refreshServerList();
    }

    function connect() {
        state.connected = true;
        state.latency = Math.floor(Math.random() * 50 + 20);
        emit('connected', { latency: state.latency });
    }

    function emit(event, payload) {
        if (!listeners.has(event)) return;
        listeners.get(event).forEach(h => h(payload));
    }

    function on(event, handler) {
        if (!listeners.has(event)) listeners.set(event, new Set());
        listeners.get(event).add(handler);
    }

    function refreshServerList() {
        state.servers = Array.from({ length: 6 }, (_, i) => ({
            id: `srv-${i}`, name: `Ultimate ${i + 1}`, region: 'Global',
            ping: Math.floor(Math.random() * 100 + 20), players: Math.floor(Math.random() * 100)
        }));
    }

    function tick(dt) {
        if (!state.connected) return;
        state.lastLatencySample += dt;
        if (state.lastLatencySample >= 5000) {
            state.latency = Math.max(20, state.latency + (Math.random() - 0.5) * 10);
            state.lastLatencySample = 0;

            // Simulate social feed
            if (Math.random() < 0.05) {
                const msgs = ["Player1 cleared 4 lines!", "New High Score!", "Tournament starting..."];
                shareSocialUpdate(msgs[Math.floor(Math.random() * msgs.length)]);
            }
        }
    }

    function shareSocialUpdate(msg) {
        state.socialFeed.unshift({ id: Date.now(), message: msg });
        if (state.socialFeed.length > 5) state.socialFeed.pop();
    }

    function recordLineClear(data) {
        // Send to server
    }

    function recordMatchResult(data) {
        // Send to server
    }

    return { boot, on, tick, recordLineClear, recordMatchResult, getState: () => state };
}

// --- META SYSTEMS (Achievements, Economy, Hazards) ---
function initAchievementSystem() {
    State.achievements = [
        { id: 'first_game', name: 'First Steps', description: 'Complete your first game', unlocked: false },
        { id: 'tetris_master', name: 'Tetris Master', description: 'Clear 100 Tetrises', unlocked: false },
        { id: 'combo_king', name: 'Combo King', description: 'Achieve a 20x combo', unlocked: false },
        { id: 'perfect_clear', name: 'Perfect Clear', description: 'Clear the board completely', unlocked: false },
        { id: 'softbody_expert', name: 'Jelly Master', description: 'Master softbody physics', unlocked: false }
    ];
}

function initEconomySystem() {
    State.shopItems = [
        { id: 'rainbow_theme', name: 'Rainbow Theme', cost: 100, owned: false },
        { id: 'neon_theme', name: 'Neon Theme', cost: 150, owned: false },
        { id: 'bomb_powerup', name: 'Bomb Pack', cost: 50, owned: false }
    ];
}

function initEnvironmentalHazards() {
    State.environmentalHazards = [];
    if (State.chaosMode) {
        for (let i = 0; i < 5; i++) {
            State.environmentalHazards.push({
                x: Math.floor(Math.random() * COLS),
                y: Math.floor(Math.random() * ROWS),
                type: ['lava', 'spike', 'electric'][Math.floor(Math.random() * 3)],
                active: true
            });
        }
    }
}

function updateEnvironmentalHazards(dt) {
    // Hazard logic
}

function updatePowerUps(dt) {
    State.activePowerUps.forEach(p => {
        p.duration -= dt;
    });
    State.activePowerUps = State.activePowerUps.filter(p => p.duration > 0);
}

function drawEnvironmentalHazards() {
    State.environmentalHazards.forEach(h => {
        if (!h.active) return;
        const x = h.x * BLOCK_SIZE;
        const y = h.y * BLOCK_SIZE;
        ctx.fillStyle = h.type === 'lava' ? '#ff4400' : h.type === 'spike' ? '#666' : '#0088ff';
        ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
    });
}

// --- AI ASSISTANCE ---
function updateAI(dt) {
    // Simple hint system placeholder
    // In a real implementation, this would run a pathfinding algo
}

// --- DRAWING ---
function draw() {
    ctx.save();

    // Clear
    if (State.trailEffect) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Screen Shake
    if (State.screenShake > 0) {
        const dx = (Math.random() - 0.5) * State.screenShake;
        const dy = (Math.random() - 0.5) * State.screenShake;
        ctx.translate(dx, dy);
        State.screenShake *= 0.9;
        if (State.screenShake < 0.5) State.screenShake = 0;
    }

    // Fuckass Visuals
    if (State.fuckassMode) {
        applyFuckassEffects();
    } else {
        ctx.filter = 'none';
        ctx.globalAlpha = 1.0;
    }

    drawBoard();
    drawSoftbody();

    if (State.currentPiece) {
        if (State.ghostPieceEnabled) drawPiece(State.currentPiece, true);
        drawPiece(State.currentPiece);
    }

    drawParticles();
    drawWeather();
    drawEnvironmentalHazards();
    drawUIEffects();

    ctx.restore();

    drawNext();
    drawHold();
}

function drawBoard() {
    if (State.softbodyMode) return; // Handled by drawSoftbody

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (State.board[y][x]) {
                drawBlock(x, y, State.board[y][x]);
            }
        }
    }
}

function drawSoftbody() {
    if (!State.softbodyMode) return;

    State.softbodyClusters.forEach(c => {
        c.blocks.forEach(b => {
            drawBlock(c.x + b.dx, c.y + b.dy, b.color);
        });
    });
}

function drawPiece(piece, ghost = false) {
    if (State.invisibleMode && !ghost) return;

    let yPos = piece.y;
    if (ghost) {
        while (!collision(piece.x, yPos + 1, piece.shape)) {
            yPos++;
        }
    }

    const color = ghost ? COLORS.GHOST : piece.color;

    piece.shape.forEach((row, y) => {
        row.forEach((val, x) => {
            if (val) {
                drawBlock(piece.x + x, yPos + y, color, ghost);
            }
        });
    });
}

function drawBlock(x, y, color, ghost = false) {
    const px = x * BLOCK_SIZE;
    const py = y * BLOCK_SIZE;

    ctx.fillStyle = color;

    // Rainbow Effect
    if (State.rainbowMode && !ghost) {
        const hue = (Date.now() / 20 + (x + y) * 10) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    }

    ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

    // Detail
    if (!ghost) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(px, py, BLOCK_SIZE, 2);
        ctx.fillRect(px, py, 2, BLOCK_SIZE);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(px + BLOCK_SIZE - 2, py, 2, BLOCK_SIZE);
        ctx.fillRect(px, py + BLOCK_SIZE - 2, BLOCK_SIZE, 2);
    } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.strokeRect(px, py, BLOCK_SIZE, BLOCK_SIZE);
    }
}

function drawParticles() {
    State.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1.0;
}

function drawWeather() {
    if (State.weatherSystem === 'clear') return;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    State.weatherParticles.forEach(p => {
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
}

function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    State.nextPieceQueue.slice(0, 3).forEach((p, i) => {
        const shape = p.shape;
        const ox = (4 - shape[0].length) * 10;
        const oy = i * 80 + 20;

        shape.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val) {
                    nextCtx.fillStyle = p.color;
                    nextCtx.fillRect(ox + x * 20, oy + y * 20, 20, 20);
                }
            });
        });
    });
}

function drawHold() {
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    if (State.holdPiece) {
        const shape = SHAPES[State.holdPiece][0];
        const color = COLORS[State.holdPiece];
        const ox = (4 - shape[0].length) * 10;
        const oy = 30;

        shape.forEach((row, y) => {
            row.forEach((val, x) => {
                if (val) {
                    holdCtx.fillStyle = color;
                    holdCtx.fillRect(ox + x * 20, oy + y * 20, 20, 20);
                }
            });
        });
    }
}

function activatePowerUp(type) {
    if (State.activePowerUps.some(p => p.type === type)) return; // Already active

    // Check cost/inventory (simplified for now)
    const duration = 10000; // 10 seconds
    State.activePowerUps.push({ type, duration });

    createFuckassNotification(`🚀 ${type.replace('_', ' ').toUpperCase()}!`);

    if (type === 'slow_time') {
        State.dropInterval *= 2;
        setTimeout(() => State.dropInterval /= 2, duration);
    }
}

function useBomb() {
    // Clear 5x5 area around current piece
    if (!State.currentPiece) return;
    const cx = State.currentPiece.x + 1;
    const cy = State.currentPiece.y + 1;

    for (let y = cy - 2; y <= cy + 2; y++) {
        for (let x = cx - 2; x <= cx + 2; x++) {
            if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                State.board[y][x] = 0;
                // Spawn particles
                State.particles.push({
                    x: x * BLOCK_SIZE, y: y * BLOCK_SIZE,
                    vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
                    life: 1.0, color: '#ff0000', size: 4
                });
            }
        }
    }
    State.screenShake = 20;
    State.flashEffect = 1.0;
    createFuckassNotification('💣 BOOM!');
}

function drawUIEffects() {
    // Draw active powerups
    let y = 100;
    State.activePowerUps.forEach(p => {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.font = 'bold 20px Segoe UI';
        ctx.fillText(`${p.type.toUpperCase()} ${Math.ceil(p.duration / 1000)}s`, 20, y);
        y += 30;
    });

    // Draw Combo
    if (State.combo > 1) {
        ctx.fillStyle = `hsl(${Date.now() / 5 % 360}, 100%, 50%)`;
        ctx.font = 'bold 40px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(`${State.combo}x COMBO!`, canvas.width / 2, canvas.height / 2 - 50);
        ctx.textAlign = 'left';
    }
}

// --- MULTIPLAYER SYSTEM (PeerJS) ---
class NetworkManager {
    constructor() {
        this.peer = null;
        this.conn = null;
        this.peerId = null;
        this.isHost = false;
    }

    init() {
        // Generate a short random ID for easier sharing
        const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.peer = new Peer(shortId);

        this.peer.on('open', (id) => {
            this.peerId = id;
            console.log('My peer ID is: ' + id);

            // Auto-join if URL has code
            const urlParams = new URLSearchParams(window.location.search);
            const joinCode = urlParams.get('join');
            if (joinCode) {
                this.joinGame(joinCode);
            }
        });

        this.peer.on('connection', (conn) => {
            this.handleConnection(conn);
        });

        this.peer.on('error', (err) => {
            console.error('PeerJS Error:', err);
            alert('Multiplayer Error: ' + err.type);
        });
    }

    hostGame() {
        this.isHost = true;
        document.getElementById('hostCodeDisplay').style.display = 'flex';
        document.getElementById('myPeerId').textContent = this.peerId;
        document.getElementById('lobbyStatus').textContent = 'Waiting for opponent...';

        // Update URL for easy sharing
        const shareUrl = `${window.location.origin}${window.location.pathname}?join=${this.peerId}`;
        window.history.pushState({}, '', `?join=${this.peerId}`);

        // Create a share button
        const shareBtn = document.createElement('button');
        shareBtn.className = 'secondary-btn';
        shareBtn.textContent = '🔗 Copy Link';
        shareBtn.onclick = () => {
            navigator.clipboard.writeText(shareUrl);
            shareBtn.textContent = '✅ Copied!';
            setTimeout(() => shareBtn.textContent = '🔗 Copy Link', 2000);
        };
        document.getElementById('hostCodeDisplay').appendChild(shareBtn);
    }

    joinGame(hostId) {
        if (!hostId) return;
        this.isHost = false;
        document.getElementById('lobbyStatus').textContent = 'Connecting...';
        const conn = this.peer.connect(hostId.toUpperCase());
        this.handleConnection(conn);
    }

    handleConnection(conn) {
        this.conn = conn;

        this.conn.on('open', () => {
            console.log('Connected to: ' + this.conn.peer);
            document.getElementById('lobbyStatus').textContent = 'Connected!';
            document.getElementById('lobbyUI').style.display = 'none';
            document.getElementById('opponentView').style.display = 'block';
            State.multiplayerMode = true;

            // If host, start game for both (signal start)
            if (this.isHost) {
                this.sendData({ type: 'START_GAME' });
                resetGame(); // Reset local
            }
        });

        this.conn.on('data', (data) => {
            this.handleData(data);
        });

        this.conn.on('close', () => {
            alert('Opponent disconnected');
            State.multiplayerMode = false;
            document.getElementById('opponentView').style.display = 'none';
            document.getElementById('lobbyUI').style.display = 'block';
            window.history.pushState({}, '', window.location.pathname); // Clear URL
        });
    }

    sendData(data) {
        if (this.conn && this.conn.open) {
            this.conn.send(data);
        }
    }

    handleData(data) {
        switch (data.type) {
            case 'START_GAME':
                resetGame();
                break;
            case 'STATE_UPDATE':
                this.renderOpponent(data.payload);
                break;
            case 'GARBAGE_LINES':
                this.receiveGarbage(data.count);
                break;
            case 'GAME_OVER':
                this.handleOpponentGameOver();
                break;
            case 'REMATCH':
                if (confirm('Opponent wants a rematch! Accept?')) {
                    this.sendData({ type: 'START_GAME' });
                    resetGame();
                }
                break;
        }
    }

    sendGarbage(linesCleared) {
        if (!State.multiplayerMode || !this.conn) return;
        // Classic Tetris garbage rules:
        // 2 lines -> 1 garbage
        // 3 lines -> 2 garbage
        // 4 lines -> 4 garbage
        let garbageCount = 0;
        if (linesCleared === 2) garbageCount = 1;
        else if (linesCleared === 3) garbageCount = 2;
        else if (linesCleared === 4) garbageCount = 4;

        if (garbageCount > 0) {
            this.sendData({ type: 'GARBAGE_LINES', count: garbageCount });
            createFuckassNotification(`SENT ${garbageCount} GARBAGE!`);
        }
    }

    receiveGarbage(count) {
        createFuckassNotification(`WARNING: ${count} GARBAGE INCOMING!`);
        // Add garbage lines to the bottom
        for (let i = 0; i < count; i++) {
            // Remove top line (game over check handled elsewhere)
            State.board.shift();
            // Add garbage line at bottom with one random hole
            const hole = Math.floor(Math.random() * COLS);
            const row = Array(COLS).fill('#888'); // Grey garbage blocks
            row[hole] = 0;
            State.board.push(row);
        }
    }

    handleOpponentGameOver() {
        State.gameOver = true;
        createFuckassNotification('🏆 YOU WON!');
        // Show custom multiplayer game over
        document.getElementById('gameOverOverlay').style.display = 'flex';
        document.querySelector('#gameOverOverlay h2').textContent = 'YOU WON!';
        document.getElementById('restartButton').textContent = 'REMATCH';
        document.getElementById('restartButton').onclick = () => {
            this.sendData({ type: 'REMATCH' });
            document.getElementById('gameOverOverlay').style.display = 'none';
            createFuckassNotification('Waiting for opponent...');
        };
    }

    // Send local state to opponent
    broadcastState() {
        if (!State.multiplayerMode || !this.conn) return;

        // Compress board: only send non-zero cells
        const simplifiedBoard = State.board.map(row => row.map(cell => cell ? cell : 0));

        this.sendData({
            type: 'STATE_UPDATE',
            payload: {
                board: simplifiedBoard,
                score: State.score,
                piece: State.currentPiece
            }
        });
    }

    renderOpponent(data) {
        const canvas = document.getElementById('opponentCanvas');
        const ctx = canvas.getContext('2d');
        const scale = canvas.width / (COLS * BLOCK_SIZE); // Scale down

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(scale, scale);

        // Draw Board
        data.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    ctx.fillStyle = value; // Use color string directly
                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });

        // Draw Active Piece
        if (data.piece) {
            ctx.fillStyle = data.piece.color;
            data.piece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        ctx.fillRect((data.piece.x + x) * BLOCK_SIZE, (data.piece.y + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    }
                });
            });
        }

        ctx.restore();
        document.getElementById('oppScore').textContent = data.score;
    }
}

// --- INITIALIZATION UPDATES ---
function initNetworkFeatures() {
    State.networkManager = new NetworkManager();
    State.networkManager.init();

    // Bind UI
    document.getElementById('hostBtn').addEventListener('click', () => State.networkManager.hostGame());
    document.getElementById('joinBtn').addEventListener('click', () => {
        const code = document.getElementById('joinInput').value;
        State.networkManager.joinGame(code);
    });
}

// Hook into Game Loop
const originalUpdate = update;
update = function (time = 0) {
    originalUpdate(time);
    // Broadcast state every few frames or on change (throttled)
    if (State.multiplayerMode && time % 5 === 0) { // Simple throttle
        State.networkManager.broadcastState();
    }
};

// Start
window.onload = init;
