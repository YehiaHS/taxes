// Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000',
    GHOST: 'rgba(255, 255, 255, 0.3)'
};

// Tetromino shapes
const SHAPES = {
    I: [
        [[0,0,0,0],
         [1,1,1,1],
         [0,0,0,0],
         [0,0,0,0]],
        [[0,0,1,0],
         [0,0,1,0],
         [0,0,1,0],
         [0,0,1,0]]
    ],
    O: [
        [[1,1],
         [1,1]]
    ],
    T: [
        [[0,1,0],
         [1,1,1],
         [0,0,0]],
        [[0,1,0],
         [0,1,1],
         [0,1,0]],
        [[0,0,0],
         [1,1,1],
         [0,1,0]],
        [[0,1,0],
         [1,1,0],
         [0,1,0]]
    ],
    S: [
        [[0,1,1],
         [1,1,0],
         [0,0,0]],
        [[0,1,0],
         [0,1,1],
         [0,0,1]]
    ],
    Z: [
        [[1,1,0],
         [0,1,1],
         [0,0,0]],
        [[0,0,1],
         [0,1,1],
         [0,1,0]]
    ],
    J: [
        [[1,0,0],
         [1,1,1],
         [0,0,0]],
        [[0,1,1],
         [0,1,0],
         [0,1,0]],
        [[0,0,0],
         [1,1,1],
         [0,0,1]],
        [[0,1,0],
         [0,1,0],
         [1,1,0]]
    ],
    L: [
        [[0,0,1],
         [1,1,1],
         [0,0,0]],
        [[0,1,0],
         [0,1,0],
         [0,1,1]],
        [[0,0,0],
         [1,1,1],
         [1,0,0]],
        [[1,1,0],
         [0,1,0],
         [0,1,0]]
    ]
};

// Game state
let canvas, ctx, nextCanvas, nextCtx, holdCanvas, holdCtx;
let board = [];
let currentPiece = null;
let nextPiece = null;
let holdPiece = null;
let canHold = true;
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let isPaused = false;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let animationId = null;

// Softbody mode
let softbodyMode = false;
let blockPhysics = [];
let gravity = 0.3;
let bounce = 0.4;
let damping = 0.92;
let squishFactor = 0;
let physicsSteps = 3; // Multiple physics steps per frame for stability

// Initialize the game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');
    holdCanvas = document.getElementById('holdCanvas');
    holdCtx = holdCanvas.getContext('2d');

    // Initialize empty board
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));

    // Set up event listeners
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('restartButton').addEventListener('click', restart);

    // Start the game
    nextPiece = createPiece();
    spawnPiece();
    updateDisplay();
    lastTime = performance.now();
    gameLoop();
}

// Create a random piece
function createPiece() {
    const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    return {
        type: type,
        shape: SHAPES[type][0],
        rotation: 0,
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0][0].length / 2),
        y: 0,
        color: COLORS[type]
    };
}

// Spawn a new piece
function spawnPiece() {
    currentPiece = nextPiece;
    nextPiece = createPiece();
    canHold = true;

    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        endGame();
    }
}

// Check for collisions
function collision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                if (newY >= 0 && board[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Merge piece into board
function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                    
                    if (softbodyMode) {
                        // Add physics properties to each block with initial velocity
                        const dropVelocity = Math.min(5, (ROWS - boardY) * 0.2);
                        blockPhysics.push({
                            x: boardX,
                            y: boardY,
                            targetY: boardY, // Rest position
                            vx: 0,
                            vy: dropVelocity,
                            color: currentPiece.color,
                            squish: 0,
                            squishVel: 0,
                            settled: false,
                            settleTimer: 0,
                            mass: 1.0
                        });
                    }
                }
            }
        });
    });
    
    if (softbodyMode) {
        applyImpactEffect();
    }
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    const clearedRows = [];
    
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            clearedRows.push(row);
            linesCleared++;
            row++; // Check the same row again
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        
        // Scoring system (based on original Tetris)
        const points = [0, 100, 300, 500, 800];
        score += points[linesCleared] * level;
        
        // Level up every 10 lines
        level = Math.floor(lines / 10) + 1;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        
        // In softbody mode, remove cleared blocks and update remaining blocks
        if (softbodyMode) {
            clearedRows.forEach(clearedRow => {
                // Remove blocks in cleared row
                blockPhysics = blockPhysics.filter(block => {
                    return Math.floor(block.y) !== clearedRow;
                });
                
                // Move blocks above down
                blockPhysics.forEach(block => {
                    if (block.targetY < clearedRow) {
                        block.targetY += 1;
                        block.settled = false;
                        block.settleTimer = 0;
                        block.vy = 0.5; // Small velocity to make them fall
                    }
                });
            });
        }
        
        updateDisplay();
    }
}

// Move piece
function move(dir) {
    currentPiece.x += dir;
    if (collision(currentPiece.x, currentPiece.y, currentPiece.shape)) {
        currentPiece.x -= dir;
        return false;
    }
    return true;
}

// Drop piece
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

// Hard drop
function hardDrop() {
    while (!collision(currentPiece.x, currentPiece.y + 1, currentPiece.shape)) {
        currentPiece.y++;
        score += 2; // Bonus points for hard drop
    }
    merge();
    clearLines();
    spawnPiece();
    updateDisplay();
}

// Rotate piece
function rotate(dir) {
    const shapes = SHAPES[currentPiece.type];
    const oldRotation = currentPiece.rotation;
    currentPiece.rotation = (currentPiece.rotation + dir + shapes.length) % shapes.length;
    const newShape = shapes[currentPiece.rotation];
    
    // Wall kick attempts
    const kicks = [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
        [-1, -1],
        [1, -1]
    ];
    
    for (let [kickX, kickY] of kicks) {
        if (!collision(currentPiece.x + kickX, currentPiece.y + kickY, newShape)) {
            currentPiece.x += kickX;
            currentPiece.y += kickY;
            currentPiece.shape = newShape;
            return;
        }
    }
    
    // If all kicks fail, revert rotation
    currentPiece.rotation = oldRotation;
}

// Hold piece
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
            endGame();
        }
    }
    
    drawHoldPiece();
}

// Get ghost piece position
function getGhostY() {
    let ghostY = currentPiece.y;
    while (!collision(currentPiece.x, ghostY + 1, currentPiece.shape)) {
        ghostY++;
    }
    return ghostY;
}

// Draw functions
function drawBlock(x, y, color, context = ctx, squish = 0) {
    const pixelSize = BLOCK_SIZE / 2;
    
    // Apply squish effect for softbody mode
    const squishX = 1 + squish * 0.3;
    const squishY = 1 - squish * 0.3;
    const offsetX = (BLOCK_SIZE - BLOCK_SIZE * squishX) / 2;
    const offsetY = (BLOCK_SIZE - BLOCK_SIZE * squishY) / 2;
    
    context.save();
    context.translate(x * BLOCK_SIZE + BLOCK_SIZE / 2, y * BLOCK_SIZE + BLOCK_SIZE / 2);
    context.scale(squishX, squishY);
    context.translate(-BLOCK_SIZE / 2, -BLOCK_SIZE / 2);
    
    // Main block color
    context.fillStyle = color;
    context.fillRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
    
    // Minecraft-style lighting - top and left highlights
    context.fillStyle = 'rgba(255, 255, 255, 0.4)';
    context.fillRect(0, 0, BLOCK_SIZE, 4);
    context.fillRect(0, 0, 4, BLOCK_SIZE);
    
    // Bottom and right shadows
    context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    context.fillRect(0, BLOCK_SIZE - 4, BLOCK_SIZE, 4);
    context.fillRect(BLOCK_SIZE - 4, 0, 4, BLOCK_SIZE);
    
    // Dark border
    context.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    context.lineWidth = 2;
    context.strokeRect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
    
    // Add pixelated texture pattern
    context.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if ((i + j) % 2 === 0) {
                context.fillRect(
                    i * (BLOCK_SIZE / 4),
                    j * (BLOCK_SIZE / 4),
                    BLOCK_SIZE / 4,
                    BLOCK_SIZE / 4
                );
            }
        }
    }
    
    context.restore();
}

function drawBoard() {
    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Minecraft-style grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }
    
    if (softbodyMode) {
        // Draw softbody blocks with physics
        blockPhysics.forEach(block => {
            drawBlock(block.x, block.y, block.color, ctx, block.squish);
        });
    } else {
        // Draw placed pieces normally
        board.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color) {
                    drawBlock(x, y, color);
                }
            });
        });
    }
}

function drawPiece(piece, ghostMode = false) {
    const yPos = ghostMode ? getGhostY() : piece.y;
    const color = ghostMode ? COLORS.GHOST : piece.color;
    
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(piece.x + x, yPos + y, color);
            }
        });
    });
}

function drawNextPiece() {
    nextCtx.fillStyle = '#1a1a1a';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const shape = nextPiece.shape;
        const offsetX = (4 - shape[0].length) / 2;
        const offsetY = (4 - shape.length) / 2;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(x + offsetX, y + offsetY, nextPiece.color, nextCtx);
                }
            });
        });
    }
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
        drawPiece(currentPiece, true); // Draw ghost piece
        drawPiece(currentPiece);        // Draw actual piece
    }
    drawNextPiece();
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// Softbody physics functions
function applyImpactEffect() {
    // Find the blocks that just landed
    const impactBlocks = blockPhysics.slice(-currentPiece.shape.flat().filter(v => v).length);
    
    impactBlocks.forEach(block => {
        block.squishVel = -0.8; // Initial squish on impact
    });
}

function updateSoftbodyPhysics(deltaTime) {
    if (!softbodyMode) return;
    
    const dt = Math.min(deltaTime / 1000, 0.016) / physicsSteps; // Cap to 60fps per step
    
    for (let step = 0; step < physicsSteps; step++) {
        blockPhysics.forEach((block, index) => {
            // Apply squish physics (spring effect) - always active for jelly effect
            const squishSpring = -block.squish * 0.4;
            const squishDamp = block.squishVel * 0.7;
            block.squishVel += (squishSpring - squishDamp) * dt * 60;
            block.squish += block.squishVel * dt * 60;
            
            // Clamp squish to prevent extreme deformation
            block.squish = Math.max(-0.8, Math.min(0.8, block.squish));
            
            if (!block.settled) {
                // Apply gravity
                block.vy += gravity * dt * 60;
                
                // Apply damping
                block.vy *= damping;
                block.vx *= damping;
                
                // Store old position
                const oldY = block.y;
                const oldX = block.x;
                
                // Apply velocity
                block.y += block.vy * dt * 60;
                block.x += block.vx * dt * 60;
                
                // Keep block in bounds horizontally
                if (block.x < 0) {
                    block.x = 0;
                    block.vx = -block.vx * bounce;
                } else if (block.x >= COLS - 0.5) {
                    block.x = COLS - 0.5;
                    block.vx = -block.vx * bounce;
                }
                
                // Check collision with bottom
                const targetRow = Math.floor(block.targetY);
                let groundLevel = ROWS - 1;
                
                // Find the highest settled block below this one in the same column
                for (let i = blockPhysics.length - 1; i >= 0; i--) {
                    const other = blockPhysics[i];
                    if (other !== block && 
                        Math.abs(other.x - block.x) < 0.8 && 
                        other.settled && 
                        other.targetY < block.targetY) {
                        groundLevel = Math.min(groundLevel, other.targetY - 1);
                        break;
                    }
                }
                
                // Collision with ground or settled blocks
                if (block.y >= groundLevel) {
                    block.y = groundLevel;
                    block.targetY = groundLevel;
                    
                    // Bounce effect
                    if (block.vy > 0.5) {
                        block.vy = -block.vy * bounce;
                        block.squishVel = -Math.abs(block.vy) * 0.5; // Squish on impact
                    } else {
                        block.vy = 0;
                        block.settleTimer += dt * 60;
                    }
                    
                    // Settle if velocity is low enough and timer reached
                    if (Math.abs(block.vy) < 0.15 && 
                        Math.abs(block.squishVel) < 0.15 && 
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
                
                // Check collision with other blocks (side collisions)
                blockPhysics.forEach((other, otherIndex) => {
                    if (other === block || !other.settled) return;
                    
                    const dx = block.x - other.x;
                    const dy = block.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < 0.9 && dist > 0.01) {
                        // Push blocks apart
                        const pushX = (dx / dist) * (0.9 - dist) * 0.5;
                        const pushY = (dy / dist) * (0.9 - dist) * 0.5;
                        
                        block.x += pushX;
                        block.y += pushY;
                        
                        // Transfer some momentum
                        block.vx += pushX * 0.3;
                        block.vy += pushY * 0.3;
                    }
                });
            }
        });
    }
    
    // Update settle status and check for cascading
    const needsUpdate = blockPhysics.some(block => !block.settled);
    if (!needsUpdate) {
        // All blocks settled, recalculate target positions
        recalculateTargetPositions();
    }
}

function recalculateTargetPositions() {
    // Sort blocks by column and current Y position
    const sortedBlocks = [...blockPhysics].sort((a, b) => {
        const colDiff = Math.floor(a.x) - Math.floor(b.x);
        if (colDiff !== 0) return colDiff;
        return b.y - a.y; // Bottom to top
    });
    
    // Recalculate where each block should be
    const columnHeights = new Array(COLS).fill(ROWS);
    
    sortedBlocks.forEach(block => {
        const col = Math.floor(block.x);
        const targetY = columnHeights[col] - 1;
        
        if (Math.abs(block.targetY - targetY) > 0.1 && block.settled) {
            // Block needs to fall further
            block.settled = false;
            block.targetY = targetY;
            block.settleTimer = 0;
        }
        
        if (block.settled) {
            columnHeights[col] = Math.floor(block.y);
        }
    });
}

function syncBoardWithPhysics() {
    if (!softbodyMode) return;
    
    // Clear board
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    
    // Update board with settled physics positions only
    blockPhysics.forEach(block => {
        const gridY = Math.round(block.y);
        const gridX = Math.round(block.x);
        if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            board[gridY][gridX] = block.color;
        }
    });
}

// Game loop
function gameLoop(time = 0) {
    if (gameOver || isPaused) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    
    if (dropCounter > dropInterval) {
        drop();
    }
    
    if (softbodyMode) {
        updateSoftbodyPhysics(deltaTime);
        syncBoardWithPhysics();
    }
    
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Handle keyboard input
function handleKeyPress(e) {
    if (gameOver) return;
    
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
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
        return;
    }
    
    if (isPaused) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            move(-1);
            break;
        case 'ArrowRight':
            move(1);
            break;
        case 'ArrowDown':
            drop();
            score += 1; // Bonus point for soft drop
            updateDisplay();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
        case 'ArrowUp':
        case 'x':
        case 'X':
            rotate(1);
            break;
        case 'z':
        case 'Z':
            rotate(-1);
            break;
        case 'c':
        case 'C':
            hold();
            break;
        case 's':
        case 'S':
            toggleSoftbodyMode();
            break;
    }
}

// Toggle softbody mode
function toggleSoftbodyMode() {
    softbodyMode = !softbodyMode;
    const modeIndicator = document.getElementById('modeIndicator');
    
    if (softbodyMode) {
        modeIndicator.innerHTML = '<p>Softbody</p>';
        modeIndicator.classList.add('softbody');
        
        // Initialize physics for existing blocks from bottom to top
        blockPhysics = [];
        const columnHeights = new Array(COLS).fill(ROWS);
        
        for (let row = ROWS - 1; row >= 0; row--) {
            for (let col = 0; col < COLS; col++) {
                if (board[row][col]) {
                    const targetY = columnHeights[col] - 1;
                    blockPhysics.push({
                        x: col,
                        y: row,
                        targetY: targetY,
                        vx: 0,
                        vy: 0,
                        color: board[row][col],
                        squish: 0,
                        squishVel: 0,
                        settled: true,
                        settleTimer: 60,
                        mass: 1.0
                    });
                    columnHeights[col] = targetY;
                }
            }
        }
    } else {
        modeIndicator.innerHTML = '<p>Normal</p>';
        modeIndicator.classList.remove('softbody');
        
        // Sync board back to normal - settle all blocks to grid
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

// End game
function endGame() {
    gameOver = true;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverOverlay').classList.add('show');
}

// Restart game
function restart() {
    // Reset game state
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    gameOver = false;
    isPaused = false;
    dropCounter = 0;
    dropInterval = 1000;
    holdPiece = null;
    canHold = true;
    blockPhysics = [];
    
    // Hide game over overlay
    document.getElementById('gameOverOverlay').classList.remove('show');
    
    // Reset pieces
    nextPiece = createPiece();
    spawnPiece();
    
    // Update display
    updateDisplay();
    drawHoldPiece();
    
    // Restart game loop
    lastTime = performance.now();
}

// Start the game when page loads
window.addEventListener('load', init);
