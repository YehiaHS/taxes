// ========== ULTIMATE TETRIS OPTIMIZED ==========

// Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Colors
const COLORS = {
    I: '#00f0f0', O: '#f0f000', T: '#a000f0', S: '#00f000',
    Z: '#f00000', J: '#0000f0', L: '#f0a000',
    GHOST: 'rgba(255, 255, 255, 0.15)',
    RAINBOW: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3']
};

// Shapes
const SHAPES = {
    I: [[[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]]],
    O: [[[1, 1], [1, 1]]],
    T: [[[0, 1, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 1, 0]], [[0, 0, 0], [1, 1, 1], [0, 1, 0]], [[0, 1, 0], [1, 1, 0], [0, 1, 0]]],
    S: [[[0, 1, 1], [1, 1, 0], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 0, 1]]],
    Z: [[[1, 1, 0], [0, 1, 1], [0, 0, 0]], [[0, 0, 1], [0, 1, 1], [0, 1, 0]]],
    J: [[[1, 0, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 1], [0, 1, 0], [0, 1, 0]], [[0, 0, 0], [1, 1, 1], [0, 0, 1]], [[0, 1, 0], [0, 1, 0], [1, 1, 0]]],
    L: [[[0, 0, 1], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 0], [0, 1, 1]], [[0, 0, 0], [1, 1, 1], [1, 0, 0]], [[1, 1, 0], [0, 1, 0], [0, 1, 0]]]
};

// Game State
let canvas, ctx, nextCanvas, nextCtx, holdCanvas, holdCtx;
let board = [];
let currentPiece = null;
let nextPieceQueue = [];
let holdPiece = null;
let canHold = true;
let score = 0;
let level = 1;
let lines = 0;
let combo = 0;
let gameOver = false;
let isPaused = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let animationId = null;
let pieceBag = [];

// Modes & Features
let softbodyMode = false;
let rainbowMode = false;
let invisibleMode = false;
let ghostPieceEnabled = true;
let trailEffect = false;
let particlesEnabled = true;

// Physics
let blockPhysics = [];
let gravity = 0.3;
let bounce = 0.4;
let damping = 0.92;
let physicsSteps = 3;

// Visual Effects
let particles = [];
let screenShake = 0;
let rainbowOffset = 0;

// Initialize
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');
    holdCanvas = document.getElementById('holdCanvas');
    holdCtx = holdCanvas.getContext('2d');

    // Reset State
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    combo = 0;
    gameOver = false;
    isPaused = false;
    dropInterval = 1000;
    nextPieceQueue = [];
    holdPiece = null;
    canHold = true;
    blockPhysics = [];
    particles = [];

    // Fill Queue
    for (let i = 0; i < 4; i++) {
        nextPieceQueue.push(createPiece());
    }
    spawnPiece();

    // Listeners
    document.removeEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);

    const restartBtn = document.getElementById('restartButton');
    if (restartBtn) {
        restartBtn.onclick = init;
    }

    updateDisplay();

    if (animationId) cancelAnimationFrame(animationId);
    lastTime = performance.now();
    gameLoop();
}

// Create random piece with bag randomizer
function createPiece() {
    if (pieceBag.length === 0) {
        pieceBag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        shuffleArray(pieceBag);
    }
    const type = pieceBag.pop();
    return {
        type,
        shape: SHAPES[type][0],
        rotation: 0,
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0][0].length / 2),
        y: 0,
        color: COLORS[type]
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

    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        endGame();
    }
}

function collision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
                if (newY >= 0 && board[newY][newX]) return true;
            }
        }
    }
    return false;
}

function merge() {
    let mergePositions = [];
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                    mergePositions.push({ x: boardX, y: boardY });

                    if (softbodyMode) {
                        const dropVelocity = Math.min(5, (ROWS - boardY) * 0.2);
                        blockPhysics.push({
                            x: boardX, y: boardY, targetY: boardY,
                            vx: 0, vy: dropVelocity, color: currentPiece.color,
                            squish: 0, squishVel: 0, settled: false,
                            settleTimer: 0
                        });
                    }
                }
            }
        });
    });

    if (particlesEnabled) createMergeParticles(mergePositions);
    if (softbodyMode) applyImpactEffect();
}

function clearLines() {
    let linesCleared = 0;
    const clearedRows = [];

    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            clearedRows.push(row);
            linesCleared++;
        }
    }

    if (linesCleared > 0) {
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared] * level;

        combo++;
        score += (combo - 1) * 50 * level;

        lines += linesCleared;
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);

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

        updateDisplay();
    } else {
        combo = 0;
        updateDisplay();
    }
}

function move(dir) {
    currentPiece.x += dir;
    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        currentPiece.x -= dir;
        return false;
    }
    return true;
}

function drop() {
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
    while (!collision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        currentPiece.y++;
        score += 2;
    }
    merge();
    clearLines();
    spawnPiece();
    updateDisplay();
    screenShake = 2;
}

function rotate(dir) {
    const shapes = SHAPES[currentPiece.type];
    const oldRotation = currentPiece.rotation;
    currentPiece.rotation = (currentPiece.rotation + dir + shapes.length) % shapes.length;
    const newShape = shapes[currentPiece.rotation];

    // SRS Wall Kicks (Simplified)
    const kicks = [
        [0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1], [-2, 0], [2, 0]
    ];

    for (let [kickX, kickY] of kicks) {
        if (!collision(currentPiece.x + kickX, currentPiece.y + kickY, newShape)) {
            currentPiece.x += kickX;
            currentPiece.y += kickY;
            currentPiece.shape = newShape;
            return;
        }
    }
    currentPiece.rotation = oldRotation;
}

function hold() {
    if (!canHold) return;
    canHold = false;

    if (holdPiece === null) {
        holdPiece = currentPiece.type;
        spawnPiece();
    } else {
        const temp = holdPiece;
        holdPiece = currentPiece.type;
        currentPiece = {
            type: temp,
            shape: SHAPES[temp][0],
            rotation: 0,
            x: Math.floor(COLS / 2) - Math.floor(SHAPES[temp][0][0].length / 2),
            y: 0,
            color: COLORS[temp]
        };
        if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
            currentPiece.y = 0;
            if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
                // Fail safe
            }
        }
    }
    drawHoldPiece();
}

function getGhostY() {
    let ghostY = currentPiece.y;
    while (!collision(currentPiece.x, ghostY + 1, currentPiece.shape)) {
        ghostY++;
    }
    return ghostY;
}

// Particles
function createMergeParticles(positions) {
    positions.forEach(pos => {
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: pos.x * BLOCK_SIZE + BLOCK_SIZE / 2,
                y: pos.y * BLOCK_SIZE + BLOCK_SIZE / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                life: 1,
                color: currentPiece.color,
                size: Math.random() * 4 + 2
            });
        }
    });
}

function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.03;
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

// Softbody Physics
function applyImpactEffect() {
    const impactBlocks = blockPhysics.slice(-currentPiece.shape.flat().filter(v => v).length);
    impactBlocks.forEach(block => {
        block.squishVel = -0.8;
    });
    screenShake = 3;
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

                block.y += block.vy * dt * 60;
                block.x += block.vx * dt * 60;

                if (block.x < 0) { block.x = 0; block.vx *= -bounce; }
                if (block.x >= COLS - 0.5) { block.x = COLS - 0.5; block.vx *= -bounce; }

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
                    if (Math.abs(block.vy) < 0.15 && block.settleTimer > 30) {
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

// Drawing
function getRainbowColor(index) {
    const offset = (Date.now() / 20 + index * 30) % 360;
    return `hsl(${offset}, 100%, 50%)`;
}

function drawBlock(x, y, color, context = ctx, squish = 0) {
    if (invisibleMode && context === ctx) return; // Don't draw on main board if invisible

    context.save();
    const squishX = 1 + squish * 0.3;
    const squishY = 1 - squish * 0.3;

    context.translate(x * BLOCK_SIZE + BLOCK_SIZE / 2, y * BLOCK_SIZE + BLOCK_SIZE / 2);
    context.scale(squishX, squishY);
    context.translate(-BLOCK_SIZE / 2, -BLOCK_SIZE / 2);

    let finalColor = color;
    if (rainbowMode) {
        finalColor = getRainbowColor(x + y);
    }

    // Modern Block Design
    // 1. Base Gradient
    const gradient = context.createLinearGradient(0, 0, BLOCK_SIZE, BLOCK_SIZE);
    gradient.addColorStop(0, finalColor);
    gradient.addColorStop(1, adjustColor(finalColor, -40)); // Darker bottom-right

    context.fillStyle = gradient;
    context.fillRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);

    // 2. Inner Bevel/Glow (Top-Left)
    context.fillStyle = 'rgba(255, 255, 255, 0.4)';
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(BLOCK_SIZE, 0);
    context.lineTo(BLOCK_SIZE - 4, 4);
    context.lineTo(4, 4);
    context.lineTo(4, BLOCK_SIZE - 4);
    context.lineTo(0, BLOCK_SIZE);
    context.closePath();
    context.fill();

    // 3. Inner Shadow (Bottom-Right)
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    context.beginPath();
    context.moveTo(BLOCK_SIZE, BLOCK_SIZE);
    context.lineTo(0, BLOCK_SIZE);
    context.lineTo(4, BLOCK_SIZE - 4);
    context.lineTo(BLOCK_SIZE - 4, BLOCK_SIZE - 4);
    context.lineTo(BLOCK_SIZE - 4, 4);
    context.lineTo(BLOCK_SIZE, 0);
    context.closePath();
    context.fill();

    // 4. Center Shine
    context.fillStyle = 'rgba(255, 255, 255, 0.1)';
    context.fillRect(8, 8, BLOCK_SIZE - 16, BLOCK_SIZE - 16);

    // 5. Border
    context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    context.lineWidth = 1;
    context.strokeRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);

    context.restore();
}

// Helper to darken color for gradient
function adjustColor(color, amount) {
    // Simple hex adjustment or return same if complex
    if (color.startsWith('#')) {
        let usePound = false;
        if (color[0] == "#") {
            color = color.slice(1);
            usePound = true;
        }
        let num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        if (r > 255) r = 255; else if (r < 0) r = 0;
        let b = ((num >> 8) & 0x00FF) + amount;
        if (b > 255) b = 255; else if (b < 0) b = 0;
        let g = (num & 0x0000FF) + amount;
        if (g > 255) g = 255; else if (g < 0) g = 0;
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
    }
    return color;
}

function drawBoard() {
    ctx.save();
    if (screenShake > 0) {
        ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
        screenShake *= 0.9;
        if (screenShake < 0.5) screenShake = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    if (softbodyMode) {
        blockPhysics.forEach(block => {
            drawBlock(block.x, block.y, block.color, ctx, block.squish);
        });
    } else {
        board.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) drawBlock(x, y, color);
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
            if (value) {
                if (ghostMode) {
                    // Simple ghost style
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 1;
                    const bx = (piece.x + x) * BLOCK_SIZE;
                    const by = (yPos + y) * BLOCK_SIZE;
                    ctx.fillRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);
                } else {
                    // Trail Effect
                    if (trailEffect) {
                        ctx.save();
                        ctx.globalAlpha = 0.2;
                        drawBlock(piece.x + x, piece.y + y - 1, color);
                        ctx.globalAlpha = 0.1;
                        drawBlock(piece.x + x, piece.y + y - 2, color);
                        ctx.restore();
                    }
                    drawBlock(piece.x + x, yPos + y, color);
                }
            }
        });
    });
}

function drawNextPieces() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    nextPieceQueue.slice(0, 3).forEach((piece, index) => {
        const shape = piece.shape;
        const offsetX = (4 - shape[0].length) / 2;
        const offsetY = (4 - shape.length) / 2 + index * 3.5;

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
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);

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
    drawHoldPiece();
    drawParticles();
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;

    const comboEl = document.getElementById('combo');
    if (comboEl) comboEl.textContent = combo > 1 ? `${combo}x` : '';

    // Mobile stats
    const scoreMob = document.getElementById('scoreMobile');
    if (scoreMob) scoreMob.textContent = score;
    const levelMob = document.getElementById('levelMobile');
    if (levelMob) levelMob.textContent = level;
}

function endGame() {
    gameOver = true;
    document.getElementById('gameOverOverlay').style.display = 'block';
    document.getElementById('finalScore').textContent = score;
}

function gameLoop(time = 0) {
    if (isPaused || gameOver) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        drop();
    }

    updateSoftbodyPhysics(deltaTime);
    updateParticles();
    draw();

    animationId = requestAnimationFrame(gameLoop);
}

function handleKeyDown(e) {
    if (gameOver) return;

    if (e.key === 'p' || e.key === 'P') {
        isPaused = !isPaused;
        return;
    }

    if (isPaused) return;

    switch (e.key) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown': drop(); score++; updateDisplay(); break;
        case 'ArrowUp': rotate(1); break;
        case 'x': case 'X': rotate(1); break;
        case 'z': case 'Z': rotate(-1); break;
        case ' ': hardDrop(); break;
        case 'c': case 'C': hold(); break;

        // Feature Toggles
        case 's': case 'S':
            softbodyMode = !softbodyMode;
            // Re-init physics if switching to softbody
            if (softbodyMode) {
                blockPhysics = [];
                board.forEach((row, y) => {
                    row.forEach((color, x) => {
                        if (color) {
                            blockPhysics.push({
                                x, y, targetY: y, vx: 0, vy: 0, color,
                                squish: 0, squishVel: 0, settled: true, settleTimer: 100
                            });
                        }
                    });
                });
            } else {
                // Sync board back
                board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
                blockPhysics.forEach(b => {
                    const bx = Math.round(b.x);
                    const by = Math.round(b.y);
                    if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
                        board[by][bx] = b.color;
                    }
                });
            }
            break;
        case 'r': case 'R': rainbowMode = !rainbowMode; break;
        case 'i': case 'I': invisibleMode = !invisibleMode; break;
        case 'g': case 'G': ghostPieceEnabled = !ghostPieceEnabled; break;
        case 't': case 'T': trailEffect = !trailEffect; break;
    }
}

// Start
init();
