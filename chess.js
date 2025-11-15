// Minimal ultimate chess implementation with similar polish/structure to Tetris
// NOTE: This is self-contained and focuses on core playability + effects hooks.

const CHESS_SIZE = 8;
const CHESS_TILE = 70;

let chessCanvas, chessCtx;
let chessBoard = [];
let chessSelected = null;
let chessTurn = 'w';
let chessMoveCount = 0;
let chessTimer = 0;
let chessTimerId = null;
let chessTimerStart = 0;
let chessGameOver = false;
let chessStatusEl, chessMoveCountEl, chessTimerEl, chessMoveListEl;
let fuckassChessMode = false;
let chessBotEnabled = false;
let chessBotDepth = 1;

// --- Advanced chess rules state ---
let chessEnPassant = null; // {x,y}
let chessCanCastle = { wK: true, wQ: true, bK: true, bQ: true };

const PIECES = {
    r: '♜', n: '♞', b: '♝', q: '♛', k: '♚', p: '♟',
    R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔', P: '♙'
};

function initChess() {
    chessCanvas = document.getElementById('chessCanvas');
    if (!chessCanvas) return;
    chessCtx = chessCanvas.getContext('2d');
    chessStatusEl = document.getElementById('chessStatus');
    chessMoveCountEl = document.getElementById('chessMoveCount');
    chessTimerEl = document.getElementById('chessTimer');
    chessMoveListEl = document.getElementById('chessMoveList');

    const botToggle = document.getElementById('enableChessBot');
    const botDepthSlider = document.getElementById('chessBotDepth');
    if (botToggle) {
        botToggle.addEventListener('change', () => {
            chessBotEnabled = botToggle.checked;
            updateChessModeLabel();
            // Reset when switching modes to avoid weird states
            resetChessBoard();
            drawChess();
        });
    }
    if (botDepthSlider) {
        botDepthSlider.addEventListener('input', () => {
            chessBotDepth = parseInt(botDepthSlider.value, 10) || 1;
        });
    }

    ['chessRestartButton', 'chessRestartButtonInline'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                resetChessBoard();
                drawChess();
            });
        }
    });

    ['backToHubFromChess', 'backToHubInline'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => window.location.href = 'hub.html');
        }
    });

    resetChessBoard();
    drawChess();

    chessCanvas.addEventListener('click', onChessClick);
    window.addEventListener('keydown', onChessKey);
}

function updateChessModeLabel() {
    const el = document.getElementById('chessModeIndicator');
    if (!el) return;
    if (fuckassChessMode) {
        el.innerHTML = '<p>Fuckass Mode</p>';
    } else if (chessBotEnabled) {
        el.innerHTML = '<p>Bot: Depth ' + chessBotDepth + '</p>';
    } else {
        el.innerHTML = '<p>Classic vs Human</p>';
    }
}

function resetChessBoard() {
    chessBoard = [
        ['r','n','b','q','k','b','n','r'],
        ['p','p','p','p','p','p','p','p'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['P','P','P','P','P','P','P','P'],
        ['R','N','B','Q','K','B','N','R']
    ];
    chessSelected = null;
    chessTurn = 'w';
    chessMoveCount = 0;
    chessGameOver = false;
    chessEnPassant = null;
    chessCanCastle = { wK: true, wQ: true, bK: true, bQ: true };
    if (chessMoveCountEl) chessMoveCountEl.textContent = '0';
    if (chessMoveListEl) {
        chessMoveListEl.innerHTML = '';
        chessMoveListEl.scrollTop = 0;
    }
    const overlay = document.getElementById('chessGameOver');
    if (overlay) overlay.style.display = 'none';
    const resultEl = document.getElementById('chessResult');
    if (resultEl) resultEl.textContent = '';
    stopChessTimer();
    startChessTimer();
    updateChessModeLabel();
    updateStatusMessage();
}

function drawChess() {
    if (!chessCtx) return;
    chessCtx.clearRect(0,0,chessCanvas.width,chessCanvas.height);

    const legal = chessSelected ? getLegalMoves(chessSelected.x, chessSelected.y) : [];

    for (let y=0; y<CHESS_SIZE; y++) {
        for (let x=0; x<CHESS_SIZE; x++) {
            const light = (x + y) % 2 === 0;
            let color = light ? '#1f2933' : '#111827';
            if (fuckassChessMode) {
                color = light ? '#22c55e' : '#065f46';
            }
            // Highlight legal target squares
            if (legal.some(m => m.dx === x && m.dy === y)) {
                color = 'rgba(34,197,94,0.35)';
            }
            chessCtx.fillStyle = color;
            chessCtx.fillRect(x*CHESS_TILE, y*CHESS_TILE, CHESS_TILE, CHESS_TILE);

            const piece = chessBoard[y][x];
            if (piece) {
                chessCtx.font = '48px system-ui';
                chessCtx.textAlign = 'center';
                chessCtx.textBaseline = 'middle';
                chessCtx.fillStyle = piece === piece.toUpperCase() ? '#f9fafb' : '#10b981';
                chessCtx.fillText(PIECES[piece], x*CHESS_TILE + CHESS_TILE/2, y*CHESS_TILE + CHESS_TILE/2);
            }
        }
    }

    if (chessSelected) {
        chessCtx.strokeStyle = '#22c55e';
        chessCtx.lineWidth = 3;
        chessCtx.strokeRect(chessSelected.x*CHESS_TILE+2, chessSelected.y*CHESS_TILE+2, CHESS_TILE-4, CHESS_TILE-4);
    }
}

function updateStatusMessage() {
    if (!chessStatusEl) return;
    if (chessGameOver) return;
    chessStatusEl.textContent = (chessTurn === 'w' ? 'White' : 'Black') + ' to move';
}

function onChessClick(e) {
    if (chessGameOver) return;
    const rect = chessCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CHESS_TILE);
    const y = Math.floor((e.clientY - rect.top) / CHESS_TILE);
    if (x<0||x>=CHESS_SIZE||y<0||y>=CHESS_SIZE) return;

    const piece = chessBoard[y][x];

    if (!chessSelected) {
        if (piece && isCurrentColor(piece)) {
            chessSelected = {x,y};
        }
    } else {
        if (chessSelected.x === x && chessSelected.y === y) {
            chessSelected = null;
        } else if (tryMoveChess(chessSelected.x, chessSelected.y, x, y)) {
            chessSelected = null;
        } else if (piece && isCurrentColor(piece)) {
            chessSelected = {x,y};
        } else {
            chessSelected = null;
        }
    }
    drawChess();
}

function isCurrentColor(piece) {
    return chessTurn === 'w' ? piece === piece.toUpperCase() : piece === piece.toLowerCase();
}

function getLegalMoves(x, y) {
    const piece = chessBoard[y][x];
    if (!piece) return [];
    const isWhite = piece === piece.toUpperCase();
    if ((isWhite && chessTurn !== 'w') || (!isWhite && chessTurn !== 'b')) return [];
    const type = piece.toLowerCase();
    let moves = [];

    const addMove = (dx, dy) => {
        const t = chessBoard[dy][dx];
        if (!t || (t === t.toUpperCase()) !== isWhite) {
            moves.push({ sx: x, sy: y, dx, dy });
        }
    };

    if (type === 'p') {
        // Delegate to getPawnMoves (includes en passant + double)
        moves = moves.concat(getPawnMoves(x, y, isWhite));
    }

    if (type === 'n') {
        const deltas = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
        deltas.forEach(([dx,dy]) => {
            const nx = x+dx, ny = y+dy;
            if (nx>=0&&nx<CHESS_SIZE&&ny>=0&&ny<CHESS_SIZE) {
                const t = chessBoard[ny][nx];
                if (!t || (t === t.toUpperCase()) !== isWhite) moves.push({sx:x,sy:y,dx:nx,dy:ny});
            }
        });
    }

    const slide = (dirs, limit=8) => {
        dirs.forEach(([sxDir, syDir]) => {
            let nx = x + sxDir;
            let ny = y + syDir;
            let steps = 0;
            while (nx>=0&&nx<CHESS_SIZE&&ny>=0&&ny<CHESS_SIZE && steps < limit) {
                const t = chessBoard[ny][nx];
                if (!t) {
                    moves.push({sx:x,sy:y,dx:nx,dy:ny});
                } else {
                    if ((t === t.toUpperCase()) !== isWhite) moves.push({sx:x,sy:y,dx:nx,dy:ny});
                    break;
                }
                nx += sxDir;
                ny += syDir;
                steps++;
            }
        });
    };

    if (type === 'b' || type === 'q') {
        slide([[1,1],[1,-1],[-1,1],[-1,-1]]);
    }
    if (type === 'r' || type === 'q') {
        slide([[1,0],[-1,0],[0,1],[0,-1]]);
    }
    if (type === 'k') {
        slide([[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], 1);
        // Castling helper: check if squares between are empty and not attacked
        function canCastle(isWhite, kingSide) {
            const row = isWhite ? 7 : 0;
            const enemyIsWhite = !isWhite;
            if (kingSide) {
                if (!(isWhite ? chessCanCastle.wK : chessCanCastle.bK)) return false;
                if (chessBoard[row][5] || chessBoard[row][6]) return false;
                // Squares king passes through must not be under attack
                if (isSquareAttacked(chessBoard, 4, row, enemyIsWhite)) return false;
                if (isSquareAttacked(chessBoard, 5, row, enemyIsWhite)) return false;
                if (isSquareAttacked(chessBoard, 6, row, enemyIsWhite)) return false;
                return true;
            } else {
                if (!(isWhite ? chessCanCastle.wQ : chessCanCastle.bQ)) return false;
                if (chessBoard[row][1] || chessBoard[row][2] || chessBoard[row][3]) return false;
                if (isSquareAttacked(chessBoard, 4, row, enemyIsWhite)) return false;
                if (isSquareAttacked(chessBoard, 3, row, enemyIsWhite)) return false;
                if (isSquareAttacked(chessBoard, 2, row, enemyIsWhite)) return false;
                return true;
            }
        }
        if (isWhite) {
            if (canCastle(true, true)) moves.push({ sx:x, sy:y, dx:6, dy:7, castle:'K' });
            if (canCastle(true, false)) moves.push({ sx:x, sy:y, dx:2, dy:7, castle:'Q' });
        } else {
            if (canCastle(false, true)) moves.push({ sx:x, sy:y, dx:6, dy:0, castle:'K' });
            if (canCastle(false, false)) moves.push({ sx:x, sy:y, dx:2, dy:0, castle:'Q' });
        }
    }

    // Filter out moves that leave own king in check
    const safe = [];
    for (const m of moves) {
        const boardCopy = cloneBoard();
        const p = boardCopy[y][x];
        boardCopy[y][x] = '';
        if (m.castle) {
            // move king
            boardCopy[m.dy][m.dx] = p;
            // move rook accordingly
            if (m.castle === 'K') {
                const row = isWhite ? 7 : 0;
                boardCopy[row][5] = boardCopy[row][7];
                boardCopy[row][7] = '';
            } else {
                const row = isWhite ? 7 : 0;
                boardCopy[row][3] = boardCopy[row][0];
                boardCopy[row][0] = '';
            }
        } else {
            boardCopy[m.dy][m.dx] = p;
        }
        if (!inCheck(boardCopy, isWhite)) safe.push(m);
    }
    return safe;
}

function tryMoveChess(sx, sy, dx, dy) {
    const legal = getLegalMoves(sx, sy);
    const move = legal.find(m => m.dx === dx && m.dy === dy);
    if (!move) return false;

    const piece = chessBoard[sy][sx];
    const targetBefore = chessBoard[dy][dx];
    const capturedPiece = move.enPassant ? (piece === 'P' ? 'p' : 'P') : (targetBefore || null);
    chessBoard[sy][sx] = '';
    chessBoard[dy][dx] = piece;

    if (move.castle && piece.toLowerCase() === 'k') {
        const isWhite = piece === 'K';
        const row = isWhite ? 7 : 0;
        if (move.castle === 'K') {
            chessBoard[row][5] = chessBoard[row][7];
            chessBoard[row][7] = '';
        } else {
            chessBoard[row][3] = chessBoard[row][0];
            chessBoard[row][0] = '';
        }
        if (isWhite) {
            chessCanCastle.wK = false;
            chessCanCastle.wQ = false;
        } else {
            chessCanCastle.bK = false;
            chessCanCastle.bQ = false;
        }
    } else {
        updateCastlingRights(sx, sy, dx, dy, piece, capturedPiece);
    }

    if (move.enPassant && chessEnPassant) {
        const capY = piece === 'P' ? dy + 1 : dy - 1;
        chessBoard[capY][dx] = '';
    }

    setEnPassant(sx, sy, dx, dy, piece);
    const promotedTo = applyPromotion(dx, dy);

    chessMoveCount++;
    chessTurn = chessTurn === 'w' ? 'b' : 'w';

    recordChessMove(piece, sx, sy, dx, dy, {
        capture: !!capturedPiece,
        capturedPiece,
        castle: move.castle,
        enPassant: !!move.enPassant,
        promotion: promotedTo
    });

    if (chessMoveCountEl) chessMoveCountEl.textContent = chessMoveCount;

    if (evaluateGameEnd()) {
        return true;
    }

    if (chessBotEnabled && !chessGameOver && chessTurn === 'b') {
        setTimeout(chessBotMove, 120);
    }

    updateStatusMessage();
    drawChess();
    return true;
}

function chessBotMove() {
    if (!chessBotEnabled || chessGameOver || chessTurn !== 'b') return;
    const moves = generateAllLegalBotMoves('b');
    if (moves.length === 0) return;

    // Difficulty: depth 1 = random-ish, 2+ prefer captures/center
    let best = null;
    let bestScore = -Infinity;
    moves.forEach(m => {
        let score = 0;
        if (m.captures) score += 3;
        const centerDist = Math.abs(3.5 - m.dx) + Math.abs(3.5 - m.dy);
        score += (4 - centerDist) * 0.2;
        if (chessBotDepth >= 2 && (m.piece === 'q' || m.piece === 'r' || m.piece === 'b')) score += 0.3;
        if (chessBotDepth >= 3 && m.capturesKing) score += 100;
        score += Math.random() * (chessBotDepth === 1 ? 1.5 : 0.3);
        if (score > bestScore) {
            bestScore = score;
            best = m;
        }
    });

    if (!best) return;

    // Apply
    const piece = chessBoard[best.sy][best.sx];
    const targetBefore = chessBoard[best.dy][best.dx];
    const capturedPiece = best.enPassant ? (piece === 'P' ? 'p' : 'P') : (targetBefore || null);
    chessBoard[best.sy][best.sx] = '';
    chessBoard[best.dy][best.dx] = piece;

    if (best.enPassant && chessEnPassant) {
        const capY = piece === 'P' ? best.dy + 1 : best.dy - 1;
        chessBoard[capY][best.dx] = '';
    }

    if (best.castle && piece.toLowerCase() === 'k') {
        const isWhite = piece === 'K';
        const row = isWhite ? 7 : 0;
        if (best.castle === 'K') {
            chessBoard[row][5] = chessBoard[row][7];
            chessBoard[row][7] = '';
        } else {
            chessBoard[row][3] = chessBoard[row][0];
            chessBoard[row][0] = '';
        }
        if (isWhite) {
            chessCanCastle.wK = false;
            chessCanCastle.wQ = false;
        } else {
            chessCanCastle.bK = false;
            chessCanCastle.bQ = false;
        }
    } else {
        updateCastlingRights(best.sx, best.sy, best.dx, best.dy, piece, capturedPiece);
    }

    setEnPassant(best.sx, best.sy, best.dx, best.dy, piece);
    const promotedTo = applyPromotion(best.dx, best.dy);
    chessMoveCount++;
    chessTurn = 'w';

    recordChessMove(piece, best.sx, best.sy, best.dx, best.dy, {
        capture: !!capturedPiece,
        capturedPiece,
        castle: best.castle,
        enPassant: !!best.enPassant,
        promotion: promotedTo
    });

    if (chessMoveCountEl) chessMoveCountEl.textContent = chessMoveCount;

    // End checks
    evaluateGameEnd();
    updateStatusMessage();

    drawChess();
}

function generateAllLegalBotMoves(color) {
    const moves = [];
    const isWhite = color === 'w';
    const originalTurn = chessTurn;
    chessTurn = color;
    for (let y = 0; y < CHESS_SIZE; y++) {
        for (let x = 0; x < CHESS_SIZE; x++) {
            const p = chessBoard[y][x];
            if (!p) continue;
            const pIsWhite = p === p.toUpperCase();
            if (pIsWhite !== isWhite) continue;
            const legal = getLegalMoves(x, y);
            legal.forEach(m => {
                const t = chessBoard[m.dy][m.dx];
                moves.push({
                    ...m,
                    piece: p,
                    captures: !!t,
                    capturedPiece: t || null,
                    capturesKing: t === 'K' || t === 'k'
                });
            });
        }
    }
    chessTurn = originalTurn;
    return moves;
}

// --- Utility helpers for full rule evaluation ---
function cloneBoard() {
    return chessBoard.map(row => row.slice());
}

function findKing(board, colorIsWhite) {
    const k = colorIsWhite ? 'K' : 'k';
    for (let y = 0; y < CHESS_SIZE; y++) {
        for (let x = 0; x < CHESS_SIZE; x++) {
            if (board[y][x] === k) return { x, y };
        }
    }
    return null;
}

function isSquareAttacked(board, x, y, byWhite) {
    const pawnDir = byWhite ? -1 : 1;
    const pawnRow = y + pawnDir;
    if (pawnRow >= 0 && pawnRow < CHESS_SIZE) {
        for (const dx of [-1, 1]) {
            const px = x + dx;
            if (px >= 0 && px < CHESS_SIZE) {
                const pawn = board[pawnRow][px];
                if (pawn && pawn === (byWhite ? 'P' : 'p')) return true;
            }
        }
    }

    const knightOffsets = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
    for (const [dx, dy] of knightOffsets) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx>=0 && nx<CHESS_SIZE && ny>=0 && ny<CHESS_SIZE) {
            const n = board[ny][nx];
            if (n && n === (byWhite ? 'N' : 'n')) return true;
        }
    }

    const slideDirs = {
        bishop: [[1,1],[1,-1],[-1,1],[-1,-1]],
        rook: [[1,0],[-1,0],[0,1],[0,-1]]
    };

    const scan = (dirs, pieces) => {
        for (const [dx, dy] of dirs) {
            let nx = x + dx;
            let ny = y + dy;
            while (nx>=0 && nx<CHESS_SIZE && ny>=0 && ny<CHESS_SIZE) {
                const cell = board[ny][nx];
                if (cell) {
                    if (pieces.includes(cell)) return true;
                    break;
                }
                nx += dx;
                ny += dy;
            }
        }
        return false;
    };

    if (scan(slideDirs.bishop, byWhite ? ['B','Q'] : ['b','q'])) return true;
    if (scan(slideDirs.rook, byWhite ? ['R','Q'] : ['r','q'])) return true;

    for (const [dx, dy] of [...slideDirs.bishop, ...slideDirs.rook]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx>=0 && nx<CHESS_SIZE && ny>=0 && ny<CHESS_SIZE) {
            const king = board[ny][nx];
            if (king && king === (byWhite ? 'K' : 'k')) return true;
        }
    }

    return false;
}

function inCheck(board, colorIsWhite) {
    const king = findKing(board, colorIsWhite);
    if (!king) return true;
    return isSquareAttacked(board, king.x, king.y, !colorIsWhite);
}

function hasAnyLegalMove(colorIsWhite) {
    const originalTurn = chessTurn;
    chessTurn = colorIsWhite ? 'w' : 'b';
    for (let y = 0; y < CHESS_SIZE; y++) {
        for (let x = 0; x < CHESS_SIZE; x++) {
            const p = chessBoard[y][x];
            if (!p) continue;
            const isWhite = p === p.toUpperCase();
            if (isWhite !== colorIsWhite) continue;
            const moves = getLegalMoves(x, y);
            if (moves.length) {
                chessTurn = originalTurn;
                return true;
            }
        }
    }
    chessTurn = originalTurn;
    return false;
}

// Enhanced finish: use checkmate/stalemate instead of only missing king
function evaluateGameEnd() {
    const whiteInCheck = inCheck(chessBoard, true);
    const blackInCheck = inCheck(chessBoard, false);
    const whiteHasMoves = hasAnyLegalMove(true);
    const blackHasMoves = hasAnyLegalMove(false);

    let result = null;
    if (!whiteHasMoves && whiteInCheck) result = 'Black wins by checkmate';
    else if (!blackHasMoves && blackInCheck) result = 'White wins by checkmate';
    else if (!whiteHasMoves && !whiteInCheck) result = 'Stalemate';
    else if (!blackHasMoves && !blackInCheck) result = 'Stalemate';

    if (result) {
        chessGameOver = true;
        stopChessTimer();
        const resEl = document.getElementById('chessResult');
        if (resEl) resEl.textContent = result;
        const overlay = document.getElementById('chessGameOver');
        if (overlay) overlay.style.display = 'flex';
        return true;
    }
    return false;
}

// Legacy finishChessGame no longer used; evaluateGameEnd handles outcomes
function finishChessGame() {
    evaluateGameEnd();
}

// Enhanced fuckass mode: chaotic visuals and slightly unhinged bot
function setFuckassChessMode(on) {
    fuckassChessMode = on;
    const body = document.body;
    if (on) {
        body.classList.add('fuckass-mode');
    } else {
        body.classList.remove('fuckass-mode');
    }
    updateChessModeLabel();
    drawChess();
}

function coordsToNotation(x, y) {
    const file = String.fromCharCode(97 + x);
    const rank = (CHESS_SIZE - y).toString();
    return file + rank;
}

function recordChessMove(piece, sx, sy, dx, dy, meta = {}) {
    if (!chessMoveListEl) return;
    const li = document.createElement('li');
    const color = piece === piece.toUpperCase() ? 'White' : 'Black';
    const glyph = PIECES[piece] || piece.toUpperCase();
    const from = coordsToNotation(sx, sy);
    const to = coordsToNotation(dx, dy);
    const notes = [];
    if (meta.castle) notes.push(meta.castle === 'K' ? 'castle kingside' : 'castle queenside');
    if (meta.enPassant) notes.push('en passant');
    if (meta.promotion) {
        const promoGlyph = PIECES[meta.promotion] || meta.promotion.toUpperCase();
        notes.push('promo ' + promoGlyph);
    }
    if (meta.capture) {
        const capturedGlyph = meta.capturedPiece ? (PIECES[meta.capturedPiece] || meta.capturedPiece.toUpperCase()) : '';
        notes.push('capture' + (capturedGlyph ? ' ' + capturedGlyph : ''));
    }
    li.textContent = `${color} ${glyph} ${from} → ${to}${notes.length ? ' — ' + notes.join(', ') : ''}`;
    chessMoveListEl.appendChild(li);
    chessMoveListEl.scrollTop = chessMoveListEl.scrollHeight;
}

function startChessTimer() {
    chessTimer = 0;
    chessTimerStart = performance.now();
    if (chessTimerId) clearInterval(chessTimerId);
    chessTimerId = setInterval(() => {
        const elapsed = Math.floor((performance.now() - chessTimerStart) / 1000);
        chessTimer = elapsed;
        updateChessTimerDisplay();
    }, 1000);
    updateChessTimerDisplay();
}

function stopChessTimer() {
    if (chessTimerId) {
        clearInterval(chessTimerId);
        chessTimerId = null;
    }
}

function updateChessTimerDisplay() {
    if (!chessTimerEl) return;
    const minutes = Math.floor(chessTimer / 60).toString().padStart(2, '0');
    const seconds = (chessTimer % 60).toString().padStart(2, '0');
    chessTimerEl.textContent = `${minutes}:${seconds}`;
}

function onChessKey(e) {
    if (e.key === 'r' || e.key === 'R') {
        resetChessBoard();
        drawChess();
    }
    if (e.key === 'f' || e.key === 'F') {
        setFuckassChessMode(!fuckassChessMode);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initChess();
});

// en passant tracking
function setEnPassant(sx, sy, dx, dy, piece) {
    chessEnPassant = null;
    if (piece === 'P' && sy === 6 && dy === 4 && sx === dx) {
        chessEnPassant = { x: dx, y: 5, pawn: 'P' };
    } else if (piece === 'p' && sy === 1 && dy === 3 && sx === dx) {
        chessEnPassant = { x: dx, y: 2, pawn: 'p' };
    }
}

function updateCastlingRights(sx, sy, dx, dy, piece, capturedPiece = null) {
    if (piece === 'K') {
        chessCanCastle.wK = false;
        chessCanCastle.wQ = false;
    } else if (piece === 'k') {
        chessCanCastle.bK = false;
        chessCanCastle.bQ = false;
    }

    if (piece === 'R' && sy === 7) {
        if (sx === 0) chessCanCastle.wQ = false;
        if (sx === 7) chessCanCastle.wK = false;
    }
    if (piece === 'r' && sy === 0) {
        if (sx === 0) chessCanCastle.bQ = false;
        if (sx === 7) chessCanCastle.bK = false;
    }

    if (capturedPiece === 'r' && dy === 0) {
        if (dx === 0) chessCanCastle.bQ = false;
        if (dx === 7) chessCanCastle.bK = false;
    }
    if (capturedPiece === 'R' && dy === 7) {
        if (dx === 0) chessCanCastle.wQ = false;
        if (dx === 7) chessCanCastle.wK = false;
    }
}

// updated getLegalMoves pawn section to include en passant
function getPawnMoves(x, y, isWhite) {
    const moves = [];
    const dir = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;
    const ny = y + dir;

    const forwardEmpty = ny >= 0 && ny < CHESS_SIZE && !chessBoard[ny][x];
    if (forwardEmpty) {
        moves.push({ sx:x, sy:y, dx:x, dy:ny });
        const ny2 = y + dir * 2;
        if (y === startRow && !chessBoard[ny2][x]) {
            moves.push({ sx:x, sy:y, dx:x, dy:ny2, double:true });
        }
    }
    for (const ox of [-1,1]) {
        const cx = x + ox;
        if (cx < 0 || cx >= CHESS_SIZE) continue;
        const t = ny >=0 && ny<CHESS_SIZE ? chessBoard[ny][cx] : null;
        if (t && (t === t.toUpperCase()) !== isWhite) {
            moves.push({ sx:x, sy:y, dx:cx, dy:ny });
        }
        // en passant capture
        if (!t && chessEnPassant && chessEnPassant.x === cx && chessEnPassant.y === ny &&
            ((isWhite && chessEnPassant.pawn === 'p') || (!isWhite && chessEnPassant.pawn === 'P'))) {
            moves.push({ sx:x, sy:y, dx:cx, dy:ny, enPassant:true });
        }
    }
    return moves;
}

function applyPromotion(x, y) {
    const p = chessBoard[y][x];
    if (p === 'P' && y === 0) {
        chessBoard[y][x] = 'Q';
        return 'Q';
    }
    if (p === 'p' && y === 7) {
        chessBoard[y][x] = 'q';
        return 'q';
    }
    return null;
}
