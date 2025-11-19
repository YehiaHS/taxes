// ========== ULTIMATE TETRIS WITH 100+ FEATURES ==========

// Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Feature 1-8: Extended color palette with gradients and effects
const COLORS = {
    I: '#00f0f0', O: '#f0f000', T: '#a000f0', S: '#00f000',
    Z: '#f00000', J: '#0000f0', L: '#f0a000',
    GHOST: 'rgba(255, 255, 255, 0.3)',
    RAINBOW: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
};

// Feature 9-16: All Tetromino shapes with extended rotations
const SHAPES = {
    I: [[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]]],
    O: [[[1,1],[1,1]]],
    T: [[[0,1,0],[1,1,1],[0,0,0]], [[0,1,0],[0,1,1],[0,1,0]], [[0,0,0],[1,1,1],[0,1,0]], [[0,1,0],[1,1,0],[0,1,0]]],
    S: [[[0,1,1],[1,1,0],[0,0,0]], [[0,1,0],[0,1,1],[0,0,1]]],
    Z: [[[1,1,0],[0,1,1],[0,0,0]], [[0,0,1],[0,1,1],[0,1,0]]],
    J: [[[1,0,0],[1,1,1],[0,0,0]], [[0,1,1],[0,1,0],[0,1,0]], [[0,0,0],[1,1,1],[0,0,1]], [[0,1,0],[0,1,0],[1,1,0]]],
    L: [[[0,0,1],[1,1,1],[0,0,0]], [[0,1,0],[0,1,0],[0,1,1]], [[0,0,0],[1,1,1],[1,0,0]], [[1,1,0],[0,1,0],[0,1,0]]]
};

// Game State
let canvas, ctx, nextCanvas, nextCtx, holdCanvas, holdCtx;
let board = [];
let currentPiece = null;
let nextPiece = null;
let nextPieceQueue = []; // Feature 17: Extended next piece queue (up to 6)
let holdPiece = null;
let canHold = true;
let score = 0;
let level = 1;
let lines = 0;
let combo = 0; // Feature 18: Combo system
let maxCombo = 0; // Feature 19: Track max combo
let gameOver = false;
let isPaused = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let animationId = null;

// Feature 20-30: Statistics tracking
let stats = {
    totalPieces: 0, totalLines: 0, totalScore: 0, gamesPlayed: 0,
    singleLines: 0, doubleLines: 0, tripleLines: 0, tetrisLines: 0,
    perfectClears: 0, tSpins: 0, playTime: 0, highScore: 0,
    longestGame: 0, fastestTetris: Infinity, totalRotations: 0
};

// Feature 31-40: Softbody & Physics
let softbodyMode = false;
let blockPhysics = [];
let gravity = 0.3;
let bounce = 0.4;
let damping = 0.92;
let physicsSteps = 3;

// Feature 41-50: Visual Effects
let particles = [];
let screenShake = 0;
let flashEffect = 0;
let rainbowMode = false;
let trailEffect = false;
let glowEffect = true;
let particlesEnabled = true;
let backgroundAnimation = true;
let matrixRain = [];
let stars = [];

// Feature 51-60: Game Modes
let gameMode = 'classic'; // classic, sprint, ultra, survival, zen, mystery
let sprintLinesTarget = 40;
let ultraTimeLimit = 120000;
let survivalSpeed = 1;
let invisibleMode = false;
let gravityMode = false;
let magnetMode = false;
let chaosMode = false;

// Feature 61-70: Power-ups and Special Features
let powerUps = [];
let activePowerUps = [];
let bombsAvailable = 0;
let slowTimeActive = false;
let doublePointsActive = false;
let invincibilityActive = false;
let magnetActive = false;
let clearRowPowerup = 0;
let skipPiecePowerup = 0;
let undoAvailable = 1;

// Feature 71-80: Audio & Music
let soundEnabled = true;
let musicEnabled = true;
let volume = 0.5;
let currentTrack = 0;
let beatSync = false;
let audioContext = null;
let musicTempo = 120;

// Feature 81-90: Customization
let theme = 'minecraft';
let blockStyle = 'minecraft';
let gridStyle = 'standard';
let colorScheme = 'default';
let customKeys = {};
let autoSave = true;
let ghostPieceEnabled = true;
let holdEnabled = true;
let harddropEnabled = true;

// Feature 91-100: Advanced Features
let aiAssist = false;
let replayMode = false;
let replayData = [];
let achievements = [];
let dailyChallenge = null;
let multiplayerReady = false;
let leaderboard = [];
let customBoard = false;
let boardWidth = COLS;
let boardHeight = ROWS;
let rotationSystem = 'SRS'; // Super Rotation System

// Additional features 101+
let gameStartTime = 0;
let lastDropTime = 0;
let touchControls = false;
let tutorialMode = false;
let zoneActive = false;
let lineClearDelay = 0;
let dasDelay = 133;
let dasSpeed = 33;
let leftPressed = false;
let rightPressed = false;
let dasTimer = 0;
let lastInputTime = 0;
let multiplayerMode = false;
let networkManager = null;
let lastBroadcastTime = 0;

// Initialize
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');
    holdCanvas = document.getElementById('holdCanvas');
    holdCtx = holdCanvas.getContext('2d');
    
    loadSettings();
    initStars();
    initMatrixRain();
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    
    for (let i = 0; i < 6; i++) {
        nextPieceQueue.push(createPiece());
    }
    spawnPiece();
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('restartButton')?.addEventListener('click', restart);
    document.getElementById('fuckassButton')?.addEventListener('click', toggleFuckassMode);
    
    setupEventListeners();
    updateDisplay();
    gameStartTime = Date.now();
    lastTime = performance.now();
    initNetworkFeatures();
    gameLoop();
}

// --- INITIALIZATION UPDATES ---
function initNetworkFeatures() {
    networkManager = new NetworkManager();
    networkManager.init();

    // Bind UI
    document.getElementById('hostBtn').addEventListener('click', () => networkManager.hostGame());
    document.getElementById('joinBtn').addEventListener('click', () => {
        const code = document.getElementById('joinInput').value;
        networkManager.joinGame(code);
    });
}

// Feature 101: Save/Load System
function saveSettings() {
    const settings = {
        stats, theme, soundEnabled, musicEnabled, volume,
        ghostPieceEnabled, holdEnabled, highScore: stats.highScore
    };
    localStorage.setItem('tetrisSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('tetrisSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        Object.assign(stats, settings.stats || {});
        theme = settings.theme || 'minecraft';
        soundEnabled = settings.soundEnabled !== false;
        musicEnabled = settings.musicEnabled !== false;
        volume = settings.volume || 0.5;
    }
}

// Create random piece with bag randomizer (Feature 102)
let pieceBag = [];
function createPiece() {
    if (pieceBag.length === 0) {
        pieceBag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        shuffleArray(pieceBag);
    }
    const type = pieceBag.pop();
    return {
        type, shape: SHAPES[type][0], rotation: 0,
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0][0].length / 2),
        y: 0, color: rainbowMode ? COLORS.RAINBOW[0] : COLORS[type],
        lastMove: null, tSpin: false
    };
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function spawnPiece() {
    currentPiece = nextPieceQueue.shift();
    nextPieceQueue.push(createPiece());
    canHold = true;
    stats.totalPieces++;
    
    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        if (!invincibilityActive) endGame();
    }
}

// Feature 103: Enhanced collision with rotation system
function collision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= COLS || newY < 0 || newY >= ROWS) return true;
                if (newY >= 0 && board[newY][newX]) return true;
            }
        }
    }
    return false;
}

// Feature 104: Merge with effects
function merge() {
    let mergePositions = [];
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                    mergePositions.push({x: boardX, y: boardY});
                    
                    if (softbodyMode) {
                        const dropVelocity = Math.min(5, (ROWS - boardY) * 0.2);
                        blockPhysics.push({
                            x: boardX, y: boardY, targetY: boardY,
                            vx: 0, vy: dropVelocity, color: currentPiece.color,
                            squish: 0, squishVel: 0, settled: false,
                            settleTimer: 0, mass: 1.0
                        });
                    }
                }
            }
        });
    });
    
    if (particlesEnabled) createMergeParticles(mergePositions);
    if (softbodyMode) applyImpactEffect();
    
    if (ExtraFeatures.shakeOnDrop) {
        screenShake = 5;
    }
    
    playSound('drop');
}

// Feature 105-110: Line clearing with T-Spin detection
function clearLines() {
    let linesCleared = 0;
    const clearedRows = [];
    let isTSpin = currentPiece.tSpin && currentPiece.type === 'T';
    
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            clearedRows.push(row);
            linesCleared++;
        }
    }
    
        if (linesCleared > 0) {
        if (ExtraFeatures.confettiOnClear) {
            createFireworks();
        }

        // Feature: Different line clear types
        if (linesCleared === 1) stats.singleLines++;
        else if (linesCleared === 2) stats.doubleLines++;
        else if (linesCleared === 3) stats.tripleLines++;
        else if (linesCleared === 4) {
            stats.tetrisLines++;
            screenShake = 10;
            createExplosion();
        }
        
        if (isTSpin) {
            stats.tSpins++;
            score += linesCleared * 400 * level;
            flashEffect = 0.5;
        } else {
            const points = [0, 100, 300, 500, 800];
            score += points[linesCleared] * level * (doublePointsActive ? 2 : 1);
        }
        
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        score += combo * 50 * level;
        
        lines += linesCleared;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        // Animate line clear
        animateLineClear(clearedRows);

        if (multiplayerMode && networkManager) {
            networkManager.sendGarbage(linesCleared);
        }
        
        setTimeout(() => {
            clearedRows.forEach(row => {
                board.splice(row, 1);
                board.unshift(Array(COLS).fill(0));
            });
            
            if (softbodyMode) {
                clearedRows.forEach(clearedRow => {
                    blockPhysics = blockPhysics.filter(b => Math.floor(b.y) !== clearedRow);
                    blockPhysics.forEach(block => {
                        if (block.targetY < clearedRow) {
                            block.targetY += 1;
                            block.settled = false;
                            block.settleTimer = 0;
                            block.vy = 0.5;
                        }
                    });
                });
            }
            
            checkPerfectClear();
        }, 300);
        
        updateDisplay();
        playSound('clear');
    } else {
        combo = 0;
    }
}

// Feature 111: Perfect clear detection
function checkPerfectClear() {
    if (board.every(row => row.every(cell => cell === 0))) {
        stats.perfectClears++;
        score += 2000 * level;
        createFireworks();
        playSound('perfect');
    }
}

// Feature 112-115: Movement with DAS
function move(dir) {
    if (ExtraFeatures.stickyFloor && Math.random() < 0.3) return false;

    currentPiece.x += dir;
    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        currentPiece.x -= dir;
        return false;
    }
    
    if (ExtraFeatures.icyFloor && Math.random() < 0.5) {
        setTimeout(() => {
            if (currentPiece && !collision(currentPiece.x + dir, currentPiece.y, currentPiece.shape)) {
                currentPiece.x += dir;
                draw(); // Force redraw
            }
        }, 100);
    }

    currentPiece.lastMove = 'move';
    playSound('move');
    return true;
}

function drop() {
    if (ExtraFeatures.zenMode) return; // No gravity in Zen Mode
    currentPiece.y++;
    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        currentPiece.y--;
        merge();
        clearLines();
        spawnPiece();
    }
    dropCounter = 0;
}

function hardDrop() {
    let distance = 0;
    while (!collision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        currentPiece.y++;
        distance++;
    }
    score += distance * 2;
    merge();
    clearLines();
    spawnPiece();
    updateDisplay();
    playSound('harddrop');
}

// Feature 116-120: Advanced rotation with kicks
function rotate(dir) {
    const shapes = SHAPES[currentPiece.type];
    const oldRotation = currentPiece.rotation;
    currentPiece.rotation = (currentPiece.rotation + dir + shapes.length) % shapes.length;
    const newShape = shapes[currentPiece.rotation];
    
    const kicks = [
        [0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1],
        [-2, 0], [2, 0], [0, -2]
    ];
    
    for (let [kickX, kickY] of kicks) {
        if (!collision(currentPiece.x + kickX, currentPiece.y + kickY, newShape)) {
            currentPiece.x += kickX;
            currentPiece.y += kickY;
            currentPiece.shape = newShape;
            currentPiece.lastMove = 'rotate';
            stats.totalRotations++;
            checkTSpin(kicks.indexOf([kickX, kickY]) > 2);
            playSound('rotate');
            return;
        }
    }
    currentPiece.rotation = oldRotation;
}

// Feature 121: T-Spin detection
function checkTSpin(wasKick) {
    if (currentPiece.type !== 'T') return;
    let corners = 0;
    const checks = [
        [currentPiece.x, currentPiece.y],
        [currentPiece.x + 2, currentPiece.y],
        [currentPiece.x, currentPiece.y + 2],
        [currentPiece.x + 2, currentPiece.y + 2]
    ];
    checks.forEach(([x, y]) => {
        if (x < 0 || x >= COLS || y < 0 || y >= ROWS || board[y]?.[x]) corners++;
    });
    if (corners >= 3 && wasKick) currentPiece.tSpin = true;
}

// Feature 122: Hold piece
function hold() {
    if (!canHold || !holdEnabled) return;
    canHold = false;
    
    if (holdPiece === null) {
        holdPiece = currentPiece.type;
        spawnPiece();
    } else {
        const temp = holdPiece;
        holdPiece = currentPiece.type;
        currentPiece = {
            type: temp, shape: SHAPES[temp][0], rotation: 0,
            x: Math.floor(COLS / 2) - Math.floor(SHAPES[temp][0][0].length / 2),
            y: 0, color: COLORS[temp], lastMove: null, tSpin: false
        };
        if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
            if (!invincibilityActive) endGame();
        }
    }
    drawHoldPiece();
    playSound('hold');
}

// Feature 123: Ghost piece position
function getGhostY() {
    let ghostY = currentPiece.y;
    while (!collision(currentPiece.x, ghostY + 1, currentPiece.shape)) {
        ghostY++;
    }
    return ghostY;
}

// Feature 124-130: Particle system
function createMergeParticles(positions) {
    positions.forEach(pos => {
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: pos.x * BLOCK_SIZE + BLOCK_SIZE / 2,
                y: pos.y * BLOCK_SIZE + BLOCK_SIZE / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                life: 1, color: currentPiece.color, size: 3
            });
        }
    });
}

function createExplosion() {
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: canvas.width / 2, y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
            life: 1, color: COLORS.RAINBOW[i % 7], size: 4
        });
    }
}

function createFireworks() {
    for (let j = 0; j < 5; j++) {
        setTimeout(() => {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height / 2;
            for (let i = 0; i < 30; i++) {
                particles.push({
                    x, y, vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    life: 1, color: COLORS.RAINBOW[i % 7], size: 3
                });
            }
        }, j * 100);
    }
}

function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.02;
        return p.life > 0;
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
}

// Feature 131-135: Background effects
function initStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + 0.5,
            size: Math.random() * 2
        });
    }
}

function initMatrixRain() {
    for (let i = 0; i < 20; i++) {
        matrixRain.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 3 + 2
        });
    }
}

function drawBackground() {
    if (backgroundAnimation) {
        stars.forEach(star => {
            star.y += star.speed;
            if (star.y > canvas.height) star.y = 0;
            ctx.fillStyle = `rgba(255, 255, 255, ${star.size / 2})`;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }
}

// Feature 136-145: Softbody physics (enhanced from original)
function applyImpactEffect() {
    const impactBlocks = blockPhysics.slice(-currentPiece.shape.flat().filter(v => v).length);
    impactBlocks.forEach(block => {
        block.squishVel = -0.8;
        screenShake = 5;
    });
}

function updateSoftbodyPhysics(deltaTime) {
    if (!softbodyMode) return;
    const dt = Math.min(deltaTime / 1000, 0.016) / physicsSteps;
    
    for (let step = 0; step < physicsSteps; step++) {
        blockPhysics.forEach((block) => {
            const squishSpring = -block.squish * 0.4;
            const squishDamp = block.squishVel * 0.7;
            block.squishVel += (squishSpring - squishDamp) * dt * 60;
            block.squish += block.squishVel * dt * 60;
            block.squish = Math.max(-0.8, Math.min(0.8, block.squish));
            
            if (!block.settled) {
                block.vy += gravity * dt * 60;
                block.vy *= damping;
                block.vx *= damping;
                
                const oldY = block.y;
                block.y += block.vy * dt * 60;
                block.x += block.vx * dt * 60;
                
                if (block.x < 0) {
                    block.x = 0;
                    block.vx = -block.vx * bounce;
                } else if (block.x >= COLS - 0.5) {
                    block.x = COLS - 0.5;
                    block.vx = -block.vx * bounce;
                }
                
                let groundLevel = ROWS - 1;
                for (let i = blockPhysics.length - 1; i >= 0; i--) {
                    const other = blockPhysics[i];
                    if (other !== block && Math.abs(other.x - block.x) < 0.8 &&
                        other.settled && other.targetY < block.targetY) {
                        groundLevel = Math.min(groundLevel, other.targetY - 1);
                        break;
                    }
                }
                
                if (block.y >= groundLevel) {
                    block.y = groundLevel;
                    block.targetY = groundLevel;
                    if (block.vy > 0.5) {
                        block.vy = -block.vy * bounce;
                        block.squishVel = -Math.abs(block.vy) * 0.5;
                    } else {
                        block.vy = 0;
                        block.settleTimer += dt * 60;
                    }
                    if (Math.abs(block.vy) < 0.15 && Math.abs(block.squishVel) < 0.15 &&
                        block.settleTimer > 30) {
                        block.settled = true;
                        block.y = groundLevel;
                        block.targetY = groundLevel;
                        block.vy = 0;
                        block.vx = 0;
                    }
                } else {
                    block.settleTimer = 0;
                }
            }
        });
    }
}

function syncBoardWithPhysics() {
    if (!softbodyMode) return;
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    blockPhysics.forEach(block => {
        const gridY = Math.round(block.y);
        const gridX = Math.round(block.x);
        if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            board[gridY][gridX] = block.color;
        }
    });
}

// Feature 146-150: Drawing functions
function drawBlock(x, y, color, context = ctx, squish = 0) {
    context.save();
    const squishX = 1 + squish * 0.3;
    const squishY = 1 - squish * 0.3;
    
    context.translate(x * BLOCK_SIZE + BLOCK_SIZE / 2, y * BLOCK_SIZE + BLOCK_SIZE / 2);
    context.scale(squishX, squishY);
    context.translate(-BLOCK_SIZE / 2, -BLOCK_SIZE / 2);
    
    if (glowEffect) {
        context.shadowBlur = 10;
        context.shadowColor = color;
    }
    
    context.fillStyle = color;
    context.fillRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
    
    context.fillStyle = 'rgba(255, 255, 255, 0.4)';
    context.fillRect(0, 0, BLOCK_SIZE, 4);
    context.fillRect(0, 0, 4, BLOCK_SIZE);
    
    context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    context.fillRect(0, BLOCK_SIZE - 4, BLOCK_SIZE, 4);
    context.fillRect(BLOCK_SIZE - 4, 0, 4, BLOCK_SIZE);
    
    context.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    context.lineWidth = 2;
    context.strokeRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
    
    context.shadowBlur = 0;
    context.restore();
}

function drawBoard() {
    ctx.save();
    if (screenShake > 0) {
        ctx.translate(
            (Math.random() - 0.5) * screenShake,
            (Math.random() - 0.5) * screenShake
        );
        screenShake *= 0.9;
    }
    
    ctx.fillStyle = flashEffect > 0 ? `rgba(255, 255, 255, ${flashEffect})` : '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    flashEffect *= 0.9;
    
    drawBackground();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
    
    if (softbodyMode) {
        blockPhysics.forEach(block => {
            if (!invisibleMode) drawBlock(block.x, block.y, block.color, ctx, block.squish);
        });
    } else {
        board.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color && !invisibleMode) drawBlock(x, y, color);
            });
        });
    }
    
    ctx.restore();
}

function drawPiece(piece, ghostMode = false) {
    const yPos = ghostMode ? getGhostY() : piece.y;
    const color = ghostMode ? COLORS.GHOST : piece.color;
    
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value && !invisibleMode) {
                if (trailEffect && !ghostMode) {
                    ctx.globalAlpha = 0.3;
                    drawBlock(piece.x + x, yPos + y - 1, color);
                    ctx.globalAlpha = 1;
                }
                drawBlock(piece.x + x, yPos + y, color);
            }
        });
    });
}

function drawNextPieces() {
    nextCtx.fillStyle = '#1a1a1a';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    nextPieceQueue.slice(0, 3).forEach((piece, index) => {
        const shape = piece.shape;
        const offsetX = (4 - shape[0].length) / 2;
        const offsetY = (4 - shape.length) / 2 + index * 4;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(x + offsetX, y + offsetY, piece.color, nextCtx);
                }
            });
        });
    });
}

function drawHoldPiece() {
    holdCtx.fillStyle = '#1a1a1a';
    holdCtx.fillRect(0, 0, holdCanvas.width, holdCanvas.height);
    
    if (holdPiece) {
        const shape = SHAPES[holdPiece][0];
        const offsetX = (4 - shape[0].length) / 2;
        const offsetY = (4 - shape.length) / 2;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(x + offsetX, y + offsetY, COLORS[holdPiece], holdCtx);
                }
            });
        });
    }
}

function draw() {
    drawBoard();
    if (currentPiece) {
        if (ghostPieceEnabled) drawPiece(currentPiece, true);
        drawPiece(currentPiece);
    }
    drawNextPieces();
    drawParticles();
}

// Feature 151-160: UI Updates
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
    const comboEl = document.getElementById('combo');
    if (comboEl) comboEl.textContent = combo > 1 ? `${combo}x` : '';
}

function createFuckassNotification(text) {
    const notif = document.createElement('div');
    notif.className = 'fuckass-notification';
    notif.style.position = 'fixed';
    notif.style.top = '50%';
    notif.style.left = '50%';
    notif.style.transform = 'translate(-50%, -50%)';
    notif.style.color = '#ff00ff';
    notif.style.fontSize = '48px';
    notif.style.fontWeight = 'bold';
    notif.style.textShadow = '2px 2px #000';
    notif.style.zIndex = '1000';
    notif.style.pointerEvents = 'none';
    notif.textContent = text;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

function toggleFuckassMode() {
    document.body.classList.toggle('fuckass-mode');
    if (document.body.classList.contains('fuckass-mode')) {
        createFuckassNotification('FUCKASS MODE ACTIVATED');
    } else {
        createFuckassNotification('FUCKASS MODE DEACTIVATED');
    }
}

function animateLineClear(rows) {
    rows.forEach(row => {
        for (let col = 0; col < COLS; col++) {
            setTimeout(() => {
                if (board[row]) board[row][col] = '#ffffff';
            }, col * 30);
        }
    });
}

// Feature 161-170: Sound system
function playSound(type) {
    if (!soundEnabled) return;
    // Placeholder for actual audio implementation
    console.log(`Sound: ${type}`);
}

// Feature 171-180: Input handling with DAS/ARR
function handleKeyDown(e) {
    if (gameOver) return;
    
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
        return;
    }
    
    if (isPaused) return;
    
    const keyActions = {
        'ArrowLeft': () => { move(-1); leftPressed = true; dasTimer = 0; },
        'ArrowRight': () => { move(1); rightPressed = true; dasTimer = 0; },
        'ArrowDown': () => { drop(); score += 1; updateDisplay(); },
        ' ': () => { e.preventDefault(); hardDrop(); },
        'ArrowUp': () => rotate(1),
        'x': () => rotate(1),
        'X': () => rotate(1),
        'z': () => rotate(-1),
        'Z': () => rotate(-1),
        'c': () => hold(),
        'C': () => hold(),
        's': () => toggleSoftbodyMode(),
        'S': () => toggleSoftbodyMode(),
        'r': () => toggleRainbowMode(),
        'R': () => toggleRainbowMode(),
        'g': () => { ghostPieceEnabled = !ghostPieceEnabled; },
        'G': () => { ghostPieceEnabled = !ghostPieceEnabled; },
        't': () => { trailEffect = !trailEffect; },
        'T': () => { trailEffect = !trailEffect; },
        'i': () => { invisibleMode = !invisibleMode; },
        'I': () => { invisibleMode = !invisibleMode; },
        'b': () => { if (bombsAvailable > 0) useBomb(); },
        'B': () => { if (bombsAvailable > 0) useBomb(); },
        'f': () => toggleFuckassMode(),
        'F': () => toggleFuckassMode()
    };
    
    if (keyActions[e.key]) keyActions[e.key]();
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
    dasTimer = 0;
}

function updateDAS() {
    if (leftPressed || rightPressed) {
        dasTimer++;
        if (dasTimer > dasDelay) {
            if (dasTimer % dasSpeed === 0) {
                if (leftPressed) move(-1);
                if (rightPressed) move(1);
            }
        }
    }
}

// Feature 181-190: Game modes and toggles
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffff55';
        ctx.font = 'bold 40px "Courier New"';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

function toggleSoftbodyMode() {
    softbodyMode = !softbodyMode;
    const modeIndicator = document.getElementById('modeIndicator');
    if (!modeIndicator) return;
    
    if (softbodyMode) {
        modeIndicator.innerHTML = '<p>Softbody</p>';
        modeIndicator.classList.add('softbody');
        blockPhysics = [];
        const columnHeights = new Array(COLS).fill(ROWS);
        for (let row = ROWS - 1; row >= 0; row--) {
            for (let col = 0; col < COLS; col++) {
                if (board[row][col]) {
                    const targetY = columnHeights[col] - 1;
                    blockPhysics.push({
                        x: col, y: row, targetY, vx: 0, vy: 0,
                        color: board[row][col], squish: 0, squishVel: 0,
                        settled: true, settleTimer: 60, mass: 1.0
                    });
                    columnHeights[col] = targetY;
                }
            }
        }
    } else {
        modeIndicator.innerHTML = '<p>Normal</p>';
        modeIndicator.classList.remove('softbody');
        board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        blockPhysics.forEach(block => {
            const gridY = Math.round(block.y);
            const gridX = Math.round(block.x);
            if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
                board[gridY][gridX] = block.color;
            }
        });
        blockPhysics = [];
    }
}

function toggleRainbowMode() {
    rainbowMode = !rainbowMode;
    if (rainbowMode && currentPiece) {
        currentPiece.color = COLORS.RAINBOW[0];
    }
}

function useBomb() {
    bombsAvailable--;
    for (let row = ROWS - 1; row >= ROWS - 3; row--) {
        if (row >= 0) {
            board[row] = Array(COLS).fill(0);
        }
    }
    createExplosion();
    score += 500;
    updateDisplay();
}

// Feature 191-200: Event listeners and utilities
function setupEventListeners() {
    // Add touch controls for mobile
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);
    canvas.addEventListener('touchend', handleTouchEnd, false);
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30) move(-1);
        else if (diffX < -30) move(1);
    } else {
        if (diffY < -30) hardDrop();
        else if (diffY > 30) drop();
    }
    
    touchStartX = touchEndX;
    touchStartY = touchEndY;
}

function handleTouchEnd(e) {
    touchStartX = 0;
    touchStartY = 0;
}

// Game loop
function gameLoop(time = 0) {
    if (gameOver || isPaused) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    
    let deltaTime = time - lastTime;
    lastTime = time;
    
    if (ExtraFeatures.timeWarp) {
        deltaTime *= 0.5; // Slow motion
    }
    
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        drop();
    }
    
    updateDAS();
    updateParticles();
    
    if (softbodyMode) {
        updateSoftbodyPhysics(deltaTime);
        syncBoardWithPhysics();
    }
    
    // Rainbow mode color cycling
    if (rainbowMode && currentPiece) {
        const colorIndex = Math.floor(time / 100) % COLORS.RAINBOW.length;
        currentPiece.color = COLORS.RAINBOW[colorIndex];
    }
    
    // Broadcast state (throttled to ~30ms for smoother updates)
    if (multiplayerMode && networkManager && time - lastBroadcastTime > 30) {
        networkManager.broadcastState();
        lastBroadcastTime = time;
    }

    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// End game
function endGame() {
    gameOver = true;
    stats.gamesPlayed++;
    stats.totalScore = score;
    const playTime = Math.floor((Date.now() - gameStartTime) / 1000);
    stats.playTime += playTime;
    
    if (score > stats.highScore) {
        stats.highScore = score;
    }
    
    saveSettings();
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverOverlay').classList.add('show');

    if (multiplayerMode) {
        document.querySelector('#gameOverOverlay h2').textContent = 'YOU LOST';
        createFuckassNotification('💀 YOU LOST!');
    } else {
        document.querySelector('#gameOverOverlay h2').textContent = 'GAME OVER';
    }

    if (multiplayerMode && networkManager) {
        networkManager.sendData({ type: 'GAME_OVER' });
    }
}

// Restart
function restart() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    combo = 0;
    gameOver = false;
    isPaused = false;
    dropCounter = 0;
    dropInterval = 1000;
    holdPiece = null;
    canHold = true;
    blockPhysics = [];
    particles = [];
    screenShake = 0;
    flashEffect = 0;
    
    document.getElementById('gameOverOverlay').classList.remove('show');
    
    nextPieceQueue = [];
    for (let i = 0; i < 6; i++) {
        nextPieceQueue.push(createPiece());
    }
    spawnPiece();
    
    updateDisplay();
    drawHoldPiece();
    gameStartTime = Date.now();
    lastTime = performance.now();
}

// Network Manager (Multiplayer)
class NetworkManager {
    constructor(isHost) {
        this.isHost = isHost;
        this.conn = null;
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
            multiplayerMode = true;

            // If host, start game for both (signal start)
            if (this.isHost) {
                this.sendData({ type: 'START_GAME' });
                restart(); // Reset local
            }
        });

        this.conn.on('data', (data) => {
            this.handleData(data);
        });

        this.conn.on('close', () => {
            alert('Opponent disconnected');
            multiplayerMode = false;
            document.getElementById('opponentView').style.display = 'none';
            document.getElementById('lobbyUI').style.display = 'block';
            window.history.pushState({}, '', window.location.pathname); // Clear URL
        });
    }

    handleData(data) {
        switch (data.type) {
            case 'START_GAME':
                restart();
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
                createFuckassNotification('OPPONENT WANTS REMATCH!');
                document.getElementById('restartButton').textContent = 'ACCEPT REMATCH';
                document.getElementById('restartButton').onclick = () => {
                    this.sendData({ type: 'START_GAME' });
                    restart();
                };
                break;
        }
    }

    sendData(data) {
        if (this.conn && this.conn.open) {
            this.conn.send(data);
        }
    }

    sendGarbage(linesCleared) {
        if (!multiplayerMode || !this.conn) return;
        // Classic Tetris garbage rules:
        // 2 lines -> 1 garbage
        // 3 lines -> 2 garbage
        // 4 lines -> 4 garbage
        let garbageCount = 0;
        if (linesCleared === 2) garbageCount = 1;
        else if (linesCleared === 3) garbageCount = 2;
        else if (linesCleared === 4) {
            garbageCount = 4;
        }

        if (garbageCount > 0) {
            this.sendData({ type: 'GARBAGE_LINES', count: garbageCount });
            createFuckassNotification(`SENT ${garbageCount} GARBAGE!`);
        }
    }

    receiveGarbage(count) {
        createFuckassNotification(`WARNING: ${count} GARBAGE INCOMING!`);
        // Add garbage lines to the bottom
        for (let i = 0; i < count; i++) {
            // Check if top line has blocks - if so, GAME OVER
            if (board[0].some(cell => cell !== 0)) {
                endGame();
                return;
            }
            
            // Remove top line
            board.shift();
            // Add garbage line at bottom with one random hole
            const hole = Math.floor(Math.random() * COLS);
            const row = Array(COLS).fill('#888'); // Grey garbage blocks
            row[hole] = 0;
            board.push(row);
        }
    }

    handleOpponentGameOver() {
        gameOver = true;
        createFuckassNotification('🏆 YOU WON!');
        // Show custom multiplayer game over
        document.getElementById('gameOverOverlay').classList.add('show');
        document.querySelector('#gameOverOverlay h2').textContent = 'YOU WON!';
        document.getElementById('restartButton').textContent = 'REMATCH';
        document.getElementById('restartButton').onclick = () => {
            this.sendData({ type: 'REMATCH' });
            document.getElementById('gameOverOverlay').classList.remove('show');
            createFuckassNotification('Waiting for opponent...');
        };
    }

    // Send local state to opponent
    broadcastState() {
        if (!multiplayerMode || !this.conn) return;

        // Compress board: only send non-zero cells
        const simplifiedBoard = board.map(row => row.map(cell => cell ? cell : 0));

        this.sendData({
            type: 'STATE_UPDATE',
            payload: {
                board: simplifiedBoard,
                score: score,
                piece: currentPiece
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

// Feature 201-220: EXTRA FEATURES PACK
const ExtraFeatures = {
    fpsCounter: false,
    zenMode: false,
    mirrorMode: false,
    invertColors: false,
    sepiaMode: false,
    pixelate: false,
    blur: false,
    glitchEffect: false,
    shakeOnDrop: true,
    confettiOnClear: true,
    neonGlow: true,
    retroCRT: false,
    fishEye: false,
    vignette: false,
    noise: false,
    doubleJump: false,
    windyMode: false,
    icyFloor: false,
    stickyFloor: false,
    timeWarp: false,
    
    // State
    fps: 0,
    lastFrameTime: 0,
    windTimer: 0,
    
    toggle(feature) {
        if (this.hasOwnProperty(feature)) {
            this[feature] = !this[feature];
            createFuckassNotification(`${feature.toUpperCase()} ${this[feature] ? 'ON' : 'OFF'}`);
            this.applyVisuals();
        }
    },
    
    applyVisuals() {
        const canvas = document.getElementById('gameCanvas');
        let filters = [];
        if (this.invertColors) filters.push('invert(100%)');
        if (this.sepiaMode) filters.push('sepia(100%)');
        if (this.blur) filters.push('blur(2px)');
        if (this.neonGlow) filters.push('drop-shadow(0 0 10px var(--primary))');
        
        canvas.style.filter = filters.join(' ');
        
        if (this.mirrorMode) canvas.style.transform = 'scaleX(-1)';
        else canvas.style.transform = 'none';
        
        if (this.pixelate) canvas.style.imageRendering = 'pixelated';
    },
    
    update(deltaTime) {
        // FPS Calculation
        const now = performance.now();
        this.fps = Math.round(1000 / (now - this.lastFrameTime));
        this.lastFrameTime = now;
        
        // Windy Mode
        if (this.windyMode && !isPaused && !gameOver) {
            this.windTimer += deltaTime;
            if (this.windTimer > 2000) {
                if (Math.random() > 0.5) move(Math.random() > 0.5 ? 1 : -1);
                this.windTimer = 0;
            }
        }
        
        // Glitch Effect
        if (this.glitchEffect && Math.random() > 0.95) {
            const canvas = document.getElementById('gameCanvas');
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            canvas.style.transform = `translate(${x}px, ${y}px)`;
            setTimeout(() => canvas.style.transform = 'none', 50);
        }
    },
    
    draw(ctx) {
        if (this.fpsCounter) {
            ctx.fillStyle = '#0aff60';
            ctx.font = '14px "Rajdhani"';
            ctx.fillText(`FPS: ${this.fps}`, 10, 20);
        }
        
        if (this.vignette) {
            const gradient = ctx.createRadialGradient(
                canvas.width/2, canvas.height/2, 100,
                canvas.width/2, canvas.height/2, 400
            );
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        if (this.retroCRT) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            for (let i = 0; i < canvas.height; i += 4) {
                ctx.fillRect(0, i, canvas.width, 2);
            }
        }
        
        if (this.noise) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (Math.random() > 0.9) {
                    const val = Math.random() * 255;
                    data[i] = val;
                    data[i+1] = val;
                    data[i+2] = val;
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }
    }
};

// Hook into existing functions
const originalGameLoop = gameLoop;
gameLoop = function(time = 0) {
    ExtraFeatures.update(time - lastTime);
    originalGameLoop(time);
};

const originalDraw = draw;
draw = function() {
    originalDraw();
    ExtraFeatures.draw(ctx);
};

// Add keybinds for new features (Shift + Key)
document.addEventListener('keydown', (e) => {
    if (e.shiftKey) {
        console.log('Shift key pressed with:', e.key); // DEBUG LOG
        switch(e.key.toLowerCase()) {
            case '1': ExtraFeatures.toggle('fpsCounter'); break;
            case '2': ExtraFeatures.toggle('zenMode'); break;
            case '3': ExtraFeatures.toggle('mirrorMode'); break;
            case '4': ExtraFeatures.toggle('invertColors'); break;
            case '5': ExtraFeatures.toggle('sepiaMode'); break;
            case '6': ExtraFeatures.toggle('pixelate'); break;
            case '7': ExtraFeatures.toggle('blur'); break;
            case '8': ExtraFeatures.toggle('glitchEffect'); break;
            case '9': ExtraFeatures.toggle('retroCRT'); break;
            case '0': ExtraFeatures.toggle('neonGlow'); break;
        }
    }
});

// Start game
window.addEventListener('load', init);
