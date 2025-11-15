const LANES = [180, 360, 540];
const RUNNER_HEIGHT = 360;
const PLAYER_Y = 280;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 72;

let runnerCanvas, runnerCtx;
let runnerState;
let lastTimestamp = 0;
let animationId = null;
let overlayEl, overlayTitleEl, overlaySubtitleEl, playButtonEl;
let scoreEl, coinsEl, multiplierEl, powerEl, bestEl, shieldEl, magnetEl, feedEl;

function initRunner() {
    runnerCanvas = document.getElementById('runnerCanvas');
    if (!runnerCanvas) return;
    runnerCtx = runnerCanvas.getContext('2d');
    overlayEl = document.getElementById('runnerOverlay');
    overlayTitleEl = document.getElementById('runnerOverlayTitle');
    overlaySubtitleEl = document.getElementById('runnerOverlaySubtitle');
    playButtonEl = document.getElementById('runnerPlayButton');
    scoreEl = document.getElementById('runnerScore');
    coinsEl = document.getElementById('runnerCoins');
    multiplierEl = document.getElementById('runnerMultiplier');
    powerEl = document.getElementById('runnerPower');
    bestEl = document.getElementById('runnerBest');
    shieldEl = document.getElementById('runnerShield');
    magnetEl = document.getElementById('runnerMagnet');
    feedEl = document.getElementById('runnerFeed');

    window.addEventListener('keydown', onRunnerKey);
    playButtonEl.addEventListener('click', startRunnerGame);
    overlayEl.addEventListener('click', startRunnerGame);
    setupRunnerTouchControls();

    resetRunnerGame();
    drawRunner(0);
}

document.addEventListener('DOMContentLoaded', initRunner);

function setupRunnerTouchControls() {
    const container = document.getElementById('runnerTouchControls');
    if (!container) return;
    const prefersTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    if (prefersTouch) {
        container.classList.add('touch-active');
    }
    const bindings = [
        { id: 'runner-btn-left', key: 'ArrowLeft', repeat: true },
        { id: 'runner-btn-right', key: 'ArrowRight', repeat: true },
        { id: 'runner-btn-jump', key: 'ArrowUp' },
        { id: 'runner-btn-slide', key: 'ArrowDown' },
        { id: 'runner-btn-hover', key: ' ' }
    ];
    bindings.forEach(({ id, key, repeat = false }) => {
        const button = document.getElementById(id);
        if (!button) return;
        let intervalId = null;
        const trigger = () => onRunnerKey({ key });
        const start = (event) => {
            event.preventDefault();
            trigger();
            if (repeat && intervalId === null) {
                intervalId = setInterval(trigger, 160);
            }
        };
        const stop = () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };
        button.addEventListener('pointerdown', start);
        button.addEventListener('pointerup', stop);
        button.addEventListener('pointerleave', stop);
        button.addEventListener('pointercancel', stop);
    });
}

function resetRunnerGame() {
    runnerState = {
        running: false,
        justCrashed: false,
        score: 0,
        best: Number(localStorage.getItem('runnerBest') || 0),
        coins: 0,
        multiplier: 1,
        speed: 220,
        lane: 1,
        targetLane: 1,
        laneOffset: 0,
        playerY: PLAYER_Y,
        jumpTimer: 0,
        slideTimer: 0,
        hoverTimer: 0,
        magnetTimer: 0,
        shieldCharges: 0,
        obstacleTimer: 0,
        coinTimer: 0,
        powerTimer: 4,
        spawnGap: 1,
        obstacles: [],
        coinsOnTrack: [],
        powersOnTrack: [],
        feed: []
    };
    updateRunnerUI();
    showRunnerOverlay('Tap to Ride', 'Press any arrow to dive into the tracks.');
}

function startRunnerGame() {
    if (runnerState.running) return;
    if (runnerState.justCrashed) {
        resetRunnerGame();
    }
    hideRunnerOverlay();
    runnerState.running = true;
    lastTimestamp = performance.now();
    runnerLoop(lastTimestamp);
}

function runnerLoop(timestamp) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;
    updateRunner(dt);
    drawRunner(dt);
    if (runnerState.running) {
        animationId = requestAnimationFrame(runnerLoop);
    }
}

function stopRunnerLoop() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
}

function updateRunner(dt) {
    if (!runnerState.running) return;

    runnerState.score += runnerState.speed * dt * 0.1 * runnerState.multiplier;
    runnerState.speed = Math.min(420, runnerState.speed + dt * 4);
    runnerState.spawnGap = Math.max(0.65, 1.2 - runnerState.score / 4000);

    runnerState.obstacleTimer += dt;
    runnerState.coinTimer += dt;
    runnerState.powerTimer += dt;

    if (runnerState.obstacleTimer >= runnerState.spawnGap) {
        spawnRunnerObstacle();
        runnerState.obstacleTimer = 0;
    }
    if (runnerState.coinTimer >= 0.4) {
        spawnRunnerCoins();
        runnerState.coinTimer = 0;
    }
    if (runnerState.powerTimer >= 8) {
        spawnRunnerPower();
        runnerState.powerTimer = 0;
    }

    updatePlayerMotion(dt);
    updateEntities(dt);
    updateRunnerUI();
}

function updatePlayerMotion(dt) {
    const laneDiff = runnerState.targetLane - runnerState.lane;
    if (laneDiff !== 0) {
        runnerState.laneOffset += laneDiff * dt * 6;
        if (Math.abs(runnerState.laneOffset) >= 1) {
            runnerState.lane += Math.sign(runnerState.laneOffset);
            runnerState.laneOffset = 0;
        }
    }
    runnerState.jumpTimer = Math.max(0, runnerState.jumpTimer - dt);
    runnerState.slideTimer = Math.max(0, runnerState.slideTimer - dt);
    runnerState.hoverTimer = Math.max(0, runnerState.hoverTimer - dt);
    runnerState.magnetTimer = Math.max(0, runnerState.magnetTimer - dt);
}

function updateEntities(dt) {
    const speed = runnerState.speed * dt;

    runnerState.obstacles.forEach(o => o.y += speed);
    runnerState.coinsOnTrack.forEach(c => c.y += speed);
    runnerState.powersOnTrack.forEach(p => p.y += speed);

    runnerState.obstacles = runnerState.obstacles.filter(o => o.y < RUNNER_HEIGHT + 100);
    runnerState.coinsOnTrack = runnerState.coinsOnTrack.filter(c => c.y < RUNNER_HEIGHT + 40);
    runnerState.powersOnTrack = runnerState.powersOnTrack.filter(p => p.y < RUNNER_HEIGHT + 40);

    checkCoinCollisions();
    checkPowerCollisions();
    checkObstacleCollisions();
}

function spawnRunnerObstacle() {
    const typeRoll = Math.random();
    let type;
    if (typeRoll < 0.5) type = 'barrier';
    else if (typeRoll < 0.8) type = 'drone';
    else type = 'train';
    const lane = type === 'train' ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 3);
    const obstacle = {
        type,
        lane,
        y: -120,
        width: type === 'train' ? 200 : 120,
        height: type === 'drone' ? 60 : 80
    };
    runnerState.obstacles.push(obstacle);
}

function spawnRunnerCoins() {
    const lane = Math.floor(Math.random() * 3);
    const stack = Math.random() < 0.5 ? 1 : 3;
    for (let i = 0; i < stack; i++) {
        runnerState.coinsOnTrack.push({ lane, y: -i * 60 - 40, collected: false });
    }
}

function spawnRunnerPower() {
    const types = ['magnet', 'shield', 'multiplier'];
    const type = types[Math.floor(Math.random() * types.length)];
    runnerState.powersOnTrack.push({ lane: Math.floor(Math.random() * 3), y: -40, type });
}

function playerRect() {
    const lanePosition = LANES[runnerState.lane];
    const x = lanePosition - PLAYER_WIDTH / 2 + runnerState.laneOffset * 60;
    let height = PLAYER_HEIGHT;
    let y = playerJumpY();
    if (runnerState.slideTimer > 0) {
        height = PLAYER_HEIGHT * 0.6;
        y += 20;
    }
    return { x, y, width: PLAYER_WIDTH, height };
}

function playerJumpY() {
    if (runnerState.jumpTimer <= 0) return PLAYER_Y;
    const progress = 1 - runnerState.jumpTimer / 0.6;
    return PLAYER_Y - Math.sin(progress * Math.PI) * 90;
}

function checkCoinCollisions() {
    const rect = playerRect();
    runnerState.coinsOnTrack.forEach(coin => {
        if (coin.collected) return;
        if (runnerState.magnetTimer > 0 && Math.abs(coin.y - rect.y) < 140) {
            collectCoin(coin);
            return;
        }
        if (coin.lane === runnerState.lane && coin.y + 30 > rect.y && coin.y < rect.y + rect.height) {
            collectCoin(coin);
        }
    });
    runnerState.coinsOnTrack = runnerState.coinsOnTrack.filter(c => !c.collected && c.y < RUNNER_HEIGHT + 40);
}

function collectCoin(coin) {
    coin.collected = true;
    runnerState.coins += 1;
    const bonus = runnerState.magnetTimer > 0 ? 2 : 1;
    runnerState.score += 15 * bonus;
    runnerState.multiplier = Math.min(5, runnerState.multiplier + 0.02);
}

function checkPowerCollisions() {
    const rect = playerRect();
    runnerState.powersOnTrack.forEach(power => {
        if (power.lane !== runnerState.lane) return;
        if (power.y + 30 > rect.y && power.y < rect.y + rect.height) {
            applyRunnerPower(power.type);
            power.y = RUNNER_HEIGHT + 100;
        }
    });
}

function applyRunnerPower(type) {
    if (type === 'magnet') {
        runnerState.magnetTimer = 8;
        pushRunnerFeed('Magnet online!');
    } else if (type === 'shield') {
        runnerState.shieldCharges = Math.min(3, runnerState.shieldCharges + 1);
        pushRunnerFeed('Shield gained.');
    } else if (type === 'multiplier') {
        runnerState.multiplier = Math.min(5, runnerState.multiplier + 0.5);
        pushRunnerFeed('Multiplier boost!');
    }
}

function checkObstacleCollisions() {
    const rect = playerRect();
    for (const obstacle of runnerState.obstacles) {
        if (obstacle.lane !== runnerState.lane) continue;
        if (obstacle.y + obstacle.height < rect.y || obstacle.y > rect.y + rect.height) continue;
        if (canBypassObstacle(obstacle)) continue;
        handleRunnerCrash();
        obstacle.y = RUNNER_HEIGHT + 200;
        break;
    }
}

function canBypassObstacle(obstacle) {
    if (runnerState.hoverTimer > 0) return true;
    if (obstacle.type === 'barrier' && runnerState.jumpTimer > 0) return true;
    if (obstacle.type === 'drone' && runnerState.slideTimer > 0) return true;
    return false;
}

function handleRunnerCrash() {
    if (runnerState.shieldCharges > 0) {
        runnerState.shieldCharges -= 1;
        pushRunnerFeed('Shield absorbed the hit!');
        runnerState.hoverTimer = 1.2;
        return;
    }
    runnerState.running = false;
    runnerState.justCrashed = true;
    stopRunnerLoop();
    runnerState.best = Math.max(runnerState.best, Math.floor(runnerState.score));
    localStorage.setItem('runnerBest', runnerState.best);
    updateRunnerUI();
    showRunnerOverlay('Wrecked!', 'You clipped a train. Tap to retry.');
}

function onRunnerKey(e) {
    if (!runnerCanvas) return;
    if (!runnerState.running && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) {
        startRunnerGame();
    }
    switch (e.key) {
        case 'ArrowLeft':
            runnerState.targetLane = Math.max(0, runnerState.targetLane - 1);
            break;
        case 'ArrowRight':
            runnerState.targetLane = Math.min(2, runnerState.targetLane + 1);
            break;
        case 'ArrowUp':
            runnerState.jumpTimer = 0.6;
            runnerState.slideTimer = 0;
            break;
        case 'ArrowDown':
            runnerState.slideTimer = 0.5;
            runnerState.jumpTimer = 0;
            break;
        case ' ':
            if (runnerState.hoverTimer <= 0) {
                runnerState.hoverTimer = 2.5;
                pushRunnerFeed('Hoverboard activated!');
            }
            break;
        case 'r':
        case 'R':
            stopRunnerLoop();
            resetRunnerGame();
            break;
    }
}

function updateRunnerUI() {
    if (!scoreEl) return;
    scoreEl.textContent = Math.floor(runnerState.score).toLocaleString();
    coinsEl.textContent = runnerState.coins.toLocaleString();
    multiplierEl.textContent = 'x' + runnerState.multiplier.toFixed(1);
    powerEl.textContent = runnerState.hoverTimer > 0 ? 'Hover ' + runnerState.hoverTimer.toFixed(1) + 's' : runnerState.magnetTimer > 0 ? 'Magnet ' + runnerState.magnetTimer.toFixed(0) + 's' : runnerState.shieldCharges > 0 ? 'Shield x' + runnerState.shieldCharges : '---';
    bestEl.textContent = runnerState.best.toLocaleString();
    shieldEl.textContent = runnerState.shieldCharges.toString();
    magnetEl.textContent = runnerState.magnetTimer.toFixed(0) + 's';
    if (feedEl) {
        feedEl.innerHTML = runnerState.feed.map(item => `<li>${item}</li>`).join('');
    }
}

function pushRunnerFeed(text) {
    runnerState.feed.unshift(text);
    if (runnerState.feed.length > 5) runnerState.feed.pop();
}

function showRunnerOverlay(title, subtitle) {
    if (!overlayEl) return;
    overlayTitleEl.textContent = title;
    overlaySubtitleEl.textContent = subtitle;
    overlayEl.style.display = 'flex';
}

function hideRunnerOverlay() {
    if (overlayEl) overlayEl.style.display = 'none';
}

function drawRunner() {
    if (!runnerCtx) return;
    runnerCtx.clearRect(0, 0, runnerCanvas.width, runnerCanvas.height);
    drawTrack();
    drawCollectibles();
    drawObstacles();
    drawPlayer();
}

function drawTrack() {
    runnerCtx.fillStyle = '#0f172a';
    runnerCtx.fillRect(0, 0, runnerCanvas.width, runnerCanvas.height);

    runnerCtx.strokeStyle = 'rgba(148,163,184,0.4)';
    runnerCtx.lineWidth = 4;
    LANES.forEach((lane, i) => {
        const x = lane;
        runnerCtx.setLineDash([20, 20]);
        runnerCtx.beginPath();
        runnerCtx.moveTo(x, 0);
        runnerCtx.lineTo(x, RUNNER_HEIGHT);
        runnerCtx.stroke();
        runnerCtx.setLineDash([]);
        runnerCtx.fillStyle = 'rgba(34,197,94,0.12)';
        runnerCtx.fillRect(x - 90, 0, 180, RUNNER_HEIGHT);
        runnerCtx.globalAlpha = 0.1;
        runnerCtx.fillRect(x - 90, 0, 180, RUNNER_HEIGHT);
        runnerCtx.globalAlpha = 1;
    });
}

function drawPlayer() {
    const rect = playerRect();
    const gradient = runnerCtx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.height);
    gradient.addColorStop(0, '#34d399');
    gradient.addColorStop(1, '#0ea5e9');
    runnerCtx.fillStyle = gradient;
    runnerCtx.fillRect(rect.x, rect.y, rect.width, rect.height);
    if (runnerState.hoverTimer > 0) {
        runnerCtx.fillStyle = 'rgba(59,130,246,0.35)';
        runnerCtx.fillRect(rect.x - 5, rect.y + rect.height, rect.width + 10, 6);
    }
}

function drawObstacles() {
    runnerState.obstacles.forEach(o => {
        const laneX = LANES[o.lane];
        const x = laneX - o.width / 2;
        if (o.type === 'train') {
            runnerCtx.fillStyle = '#ef4444';
        } else if (o.type === 'barrier') {
            runnerCtx.fillStyle = '#f97316';
        } else {
            runnerCtx.fillStyle = '#a855f7';
        }
        runnerCtx.fillRect(x, o.y, o.width, o.height);
    });
}

function drawCollectibles() {
    runnerState.coinsOnTrack.forEach(c => {
        const laneX = LANES[c.lane];
        runnerCtx.fillStyle = '#facc15';
        runnerCtx.beginPath();
        runnerCtx.arc(laneX, c.y, 12, 0, Math.PI * 2);
        runnerCtx.fill();
    });
    runnerState.powersOnTrack.forEach(p => {
        const laneX = LANES[p.lane];
        runnerCtx.fillStyle = p.type === 'magnet' ? '#38bdf8' : p.type === 'shield' ? '#f472b6' : '#22c55e';
        runnerCtx.beginPath();
        runnerCtx.rect(laneX - 14, p.y - 14, 28, 28);
        runnerCtx.fill();
        runnerCtx.fillStyle = '#020617';
        runnerCtx.font = '16px monospace';
        runnerCtx.textAlign = 'center';
        runnerCtx.textBaseline = 'middle';
        runnerCtx.fillText(p.type[0].toUpperCase(), laneX, p.y);
    });
}
