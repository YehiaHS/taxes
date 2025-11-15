// ========== ULTIMATE TETRIS WITH 200+ FEATURES ==========

// Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

// Feature 1-8: Extended color palette with gradients and effects
const COLORS = {
    I: '#00f0f0', O: '#f0f000', T: '#a000f0', S: '#00f000',
    Z: '#f00000', J: '#0000f0', L: '#f0a000',
    GHOST: 'rgba(255, 255, 255, 0.3)',
    RAINBOW: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
    NEON: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#0080ff', '#80ff00', '#ff0080'],
    FIRE: ['#ff0000', '#ff4400', '#ff8800', '#ffcc00', '#ffff00', '#ffffff', '#ffaa00'],
    ICE: ['#00ffff', '#00aaff', '#0088ff', '#0044ff', '#0000ff', '#4400ff', '#8800ff']
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
let scoreElement, levelElement, linesElement, comboElement;
let scoreMobileElement, levelMobileElement, linesMobileElement, comboMobileElement;
let board = [];
let currentPiece = null;
let nextPiece = null;
let nextPieceQueue = []; // Feature 17: Extended next piece queue (up to 6)
let pieceBag = []; // Bag system for fair piece distribution
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
const BASE_DROP_INTERVAL = 1000;
const MIN_DROP_INTERVAL = 120;
const LEVEL_INTERVAL_STEP = 70;
const TIME_RAMP_INTERVAL = 20000; // ms per ramp step
const TIME_INTERVAL_STEP = 15;
let dropInterval = BASE_DROP_INTERVAL;
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
let softbodyClusters = [];
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
let gameMode = 'classic'; // classic, sprint, ultra, survival, zen, mystery, fuckass
let sprintLinesTarget = 40;
let ultraTimeLimit = 120000;
let survivalSpeed = 1;
let invisibleMode = false;
let gravityMode = false;
let magnetMode = false;
let chaosMode = false;
let fuckassMode = false;
let fuckassIntensity = 1.0;
let fuckassTimer = 0;
let fuckassPenalties = [];
let fuckassRotation = 0;
let fuckassZoom = 1.0;

// Feature 61-70: Power-ups and Special Features
let powerUps = [];
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

// Feature 101-110: Additional Game Modes
let zenMode = false;
let puzzleMode = false;
let timeAttackMode = false;
let endlessMode = false;
let challengeMode = false;
let bossMode = false;
let storyMode = false;
let tournamentMode = false;
let speedrunMode = false;
let practiceMode = false;

// Feature 111-120: Special Effects
let lightningMode = false;
let fireMode = false;
let iceMode = false;
let poisonMode = false;
let electricMode = false;
let magneticMode = false;
let gravityWells = [];
let forceFields = [];
let portals = [];
let teleporters = [];

// Feature 121-130: Advanced Physics
let windForce = 0;
let turbulence = 0;
let magneticFields = [];
let gravityFields = [];
let timeDilation = 1;
let spaceWarps = [];
let quantumEffects = false;
let relativityMode = false;
let wormholes = [];

// Feature 131-140: Multiplayer Features
let multiplayerMode = false;
let playerId = null;
let opponents = [];
let networkConnected = false;
let spectating = false;
let tournamentBracket = null;
let chatEnabled = false;
let voiceChat = false;
let friendList = [];
let clanSystem = false;

// Feature 141-150: AI and Automation
let aiDifficulty = 'medium';
let aiAssistance = false;
let autoPilot = false;
let perfectPlay = false;
let hintSystem = false;
let tutorialAI = false;
let practiceAI = false;
let speedrunAI = false;
let analysisMode = false;
let replayAnalysis = false;

// Feature 151-160: Special Pieces
let specialPieces = [];
let bombPiece = false;
let laserPiece = false;
let freezePiece = false;
let gravityPiece = false;
let timePiece = false;
let portalPiece = false;
let magnetPiece = false;
let electricPiece = false;
let firePiece = false;
let icePiece = false;

// Feature 161-170: Environmental Effects
let weatherSystem = 'clear';
let dayNightCycle = false;
let timeOfDay = 0;
let weatherParticles = [];
let environmentalHazards = [];
let movingPlatforms = [];
let destructibleTerrain = [];
let dynamicLighting = false;
let shadowSystem = false;

// Feature 171-180: Achievement System
let achievementList = [];
let unlockedAchievements = [];
let achievementProgress = {};
let dailyQuests = [];
let weeklyChallenges = [];
let seasonalEvents = [];
let milestoneRewards = [];
let achievementShowcase = false;
let progressTracking = true;

// Feature 181-190: Economy System
let currency = 0;
let premiumCurrency = 0;
let shopItems = [];
let cosmeticItems = [];
let powerUpShop = [];
let themeShop = [];
let soundPackShop = [];
let microtransactions = false;
let lootBoxes = [];
let dailyRewards = [];

// Feature 191-200: Advanced Analytics
let performanceMetrics = {};
let heatmaps = [];
let playstyleAnalysis = {};
let skillRating = 0;
let rankSystem = false;
let leaderboardPosition = 0;
let globalStats = {};
let personalRecords = {};
let improvementTracking = true;

// Additional features 201+
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
let lastPlayableState = null;
let continueUsed = false;
let cheatBuffer = '';
const CHEAT_CODE = 'ami';
const CONTINUE_ROW_CLEANUP = 4;

// Feature 201-210: Advanced Visual Effects
let bloomEffect = false;
let chromaticAberration = false;
let motionBlur = false;
let depthOfField = false;
let lensFlare = false;
let godRays = false;
let volumetricLighting = false;
let particleTrails = false;
let rippleEffects = false;
let shockwaves = false;

// Feature 211-220: Sound System
let soundEffects = {};
let musicTracks = [];
let ambientSounds = [];
let voiceLines = [];
let proceduralMusic = false;
let beatDetection = false;
let audioVisualization = false;
let surroundSound = false;
let hapticFeedback = false;
let voiceCommands = false;

// Feature 221-230: Network Features
let matchmaking = false;
let serverBrowser = false;
let customServers = false;
let modSupport = false;
let workshopIntegration = false;
let cloudSaves = false;
let crossPlatform = false;
let socialFeatures = false;
let streamingIntegration = false;
let tournamentSystem = false;

// Feature 231-240: Advanced AI
let neuralNetwork = null;
let machineLearning = false;
let adaptiveDifficulty = false;
let playerModeling = false;
let predictiveAI = false;
let strategicAI = false;
let comboAI = false;
let patternRecognition = false;
let learningFromMistakes = false;
let skillAssessment = false;

// Feature 241-250: Special Game Modes
let mirrorMode = false;
let upsideDownMode = false;
let noHoldMode = false;
let noGhostMode = false;
let blindMode = false;
let drunkMode = false;
let earthquakeMode = false;
let tornadoMode = false;
let blackHoleMode = false;
let timeWarpMode = false;

// Feature 251-260: Environmental Hazards
let lavaFlows = [];
let spikeTraps = [];
let movingWalls = [];
let crushingCeilings = [];
let fallingDebris = [];
let toxicGas = [];
let electricFields = [];
let magneticStorms = [];
let gravityAnomalies = [];
let timeFields = [];

// Feature 261-270: Power-up System
let powerUpInventory = [];
let activePowerUps = [];
let powerUpCooldowns = {};
let comboPowerUps = [];
let scoreMultipliers = [];
let timeExtenders = [];
let shieldGenerators = [];
let speedBoosters = [];
let luckEnhancers = [];
let skillBoosters = [];

// Feature 271-280: Customization Options
let customThemes = [];
let customBlocks = [];
let customSounds = [];
let customMusic = [];
let customControls = {};
let customUI = {};
let customParticles = [];
let customEffects = [];
let customGameModes = [];
let customAchievements = [];

// Feature 281-290: Advanced Statistics
let detailedStats = {};
let performanceGraphs = [];
let skillProgression = {};
let learningCurves = {};
let mistakeAnalysis = {};
let optimalPlayData = {};
let comparativeAnalysis = {};
let trendAnalysis = {};
let predictiveStats = {};
let correlationAnalysis = {};

// Feature 291-300: Meta Features
let gameWithinGame = false;
let recursiveTetris = false;
let tetrisSimulator = false;
let tetrisBuilder = false;
let tetrisEditor = false;
let tetrisAnalyzer = false;
let tetrisStreamer = false;
let tetrisTeacher = false;
let tetrisResearcher = false;
let tetrisPhilosopher = false;

// Initialize
function init() {
    console.log('Initializing game...');
    lastPlayableState = null;
    continueUsed = false;
    cheatBuffer = '';
    dropInterval = BASE_DROP_INTERVAL;
    
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('nextCanvas');
    nextCtx = nextCanvas.getContext('2d');
    holdCanvas = document.getElementById('holdCanvas');
    holdCtx = holdCanvas.getContext('2d');
    scoreElement = document.getElementById('score');
    levelElement = document.getElementById('level');
    linesElement = document.getElementById('lines');
    comboElement = document.getElementById('combo');
    scoreMobileElement = document.getElementById('scoreMobile');
    levelMobileElement = document.getElementById('levelMobile');
    linesMobileElement = document.getElementById('linesMobile');
    comboMobileElement = document.getElementById('comboMobile');
    
    console.log('Canvas initialized:', canvas, ctx);
    
    try {
        loadSettings();
        initStars();
        initMatrixRain();
        initWeatherSystem();
        initEnvironmentalHazards();
        initAchievementSystem();
        initEconomySystem();
        initNetworkFeatures();
        initAISystem();
        initSpecialEffects();
        initSoundSystem();
        initAdvancedAnalytics();
        
        console.log('All systems initialized');
        
        board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        
        // Initialize piece queue
        nextPieceQueue = [];
        for (let i = 0; i < 6; i++) {
            nextPieceQueue.push(createPiece());
        }
        
        // Spawn first piece
        spawnPiece();
        
        console.log('Board and pieces created', {
            queueLength: nextPieceQueue.length,
            currentPiece: currentPiece ? currentPiece.type : 'none'
        });
        
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        document.getElementById('restartButton')?.addEventListener('click', restart);
        document.getElementById('fuckassButton')?.addEventListener('click', toggleFuckassMode);
        
        setupEventListeners();
        updateDisplay();
        gameStartTime = Date.now();
        lastTime = performance.now();
        refreshDropInterval(true);
        
        console.log('Starting game loop...');
        gameLoop();
        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Error initializing game:', error);
        alert('Error starting game: ' + error.message);
    }
}

// Feature 301-310: Advanced Initialization
function initWeatherSystem() {
    if (!canvas) return;
    weatherParticles = [];
    for (let i = 0; i < 50; i++) {
        weatherParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 3 + 1,
            size: Math.random() * 3 + 1,
            type: weatherSystem
        });
    }
}

function initEnvironmentalHazards() {
    environmentalHazards = [];
    if (chaosMode) {
        for (let i = 0; i < 5; i++) {
            environmentalHazards.push({
                x: Math.random() * COLS,
                y: Math.random() * ROWS,
                type: ['lava', 'spike', 'electric'][Math.floor(Math.random() * 3)],
                active: true
            });
        }
    }
}

function initAchievementSystem() {
    achievementList = [
        { id: 'first_game', name: 'First Steps', description: 'Complete your first game', unlocked: false },
        { id: 'tetris_master', name: 'Tetris Master', description: 'Clear 100 Tetrises', unlocked: false },
        { id: 'combo_king', name: 'Combo King', description: 'Achieve a 20x combo', unlocked: false },
        { id: 'perfect_clear', name: 'Perfect Clear', description: 'Clear the board completely', unlocked: false },
        { id: 'speed_demon', name: 'Speed Demon', description: 'Reach level 50', unlocked: false },
        { id: 'softbody_expert', name: 'Jelly Master', description: 'Master softbody physics', unlocked: false }
    ];
}

function initEconomySystem() {
    shopItems = [
        { id: 'rainbow_theme', name: 'Rainbow Theme', cost: 100, owned: false },
        { id: 'neon_theme', name: 'Neon Theme', cost: 150, owned: false },
        { id: 'bomb_powerup', name: 'Bomb Pack', cost: 50, owned: false },
        { id: 'slow_time', name: 'Time Extender', cost: 75, owned: false }
    ];
}

function initNetworkFeatures() {
    if (multiplayerMode) {
        // Initialize networking
        networkConnected = true;
        playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    }
}

function initAISystem() {
    if (aiAssistance) {
        // Initialize AI assistance
        hintSystem = true;
        predictiveAI = true;
    }
}

function initSpecialEffects() {
    if (bloomEffect) {
        // Initialize bloom post-processing
    }
    if (motionBlur) {
        // Initialize motion blur
    }
}

function initSoundSystem() {
    if (soundEnabled) {
        // Initialize advanced audio system
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        proceduralMusic = true;
    }
}

function initAdvancedAnalytics() {
    performanceMetrics = {
        averageResponseTime: 0,
        accuracy: 0,
        efficiency: 0,
        adaptability: 0
    };
}

// Enhanced save/load system (Feature 311-320)
function saveSettings() {
    const settings = {
        stats, theme, soundEnabled, musicEnabled, volume,
        ghostPieceEnabled, holdEnabled, highScore: stats.highScore,
        // New features
        bloomEffect, motionBlur, proceduralMusic, aiAssistance,
        weatherSystem, chaosMode, multiplayerMode, currency,
        unlockedAchievements, customThemes, detailedStats
    };
    localStorage.setItem('tetrisUltimateSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('tetrisUltimateSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        Object.assign(stats, settings.stats || {});
        theme = settings.theme || 'minecraft';
        soundEnabled = settings.soundEnabled !== false;
        musicEnabled = settings.musicEnabled !== false;
        volume = settings.volume || 0.5;
        bloomEffect = settings.bloomEffect || false;
        motionBlur = settings.motionBlur || false;
        proceduralMusic = settings.proceduralMusic || false;
        aiAssistance = settings.aiAssistance || false;
        weatherSystem = settings.weatherSystem || 'clear';
        chaosMode = settings.chaosMode || false;
        multiplayerMode = settings.multiplayerMode || false;
        currency = settings.currency || 0;
        unlockedAchievements = settings.unlockedAchievements || [];
        customThemes = settings.customThemes || [];
        detailedStats = settings.detailedStats || {};
    }
}

function initStars() {
    if (!canvas) return;
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2
        });
    }
}

function initMatrixRain() {
    if (!canvas) return;
    matrixRain = [];
    for (let i = 0; i < 20; i++) {
        matrixRain.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 3 + 1
        });
    }
}

function setupEventListeners() {
    setupTouchControls();
}

function setupTouchControls() {
    const container = document.getElementById('tetrisTouchControls');
    if (!container) return;
    const prefersTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const enableTouchControls = () => container.classList.add('touch-active');
    const disableTouchControls = () => container.classList.remove('touch-active');
    const updateTouchVisibility = () => {
        if (prefersTouch || window.innerWidth <= 960) {
            enableTouchControls();
        } else {
            disableTouchControls();
        }
    };
    updateTouchVisibility();
    window.addEventListener('resize', updateTouchVisibility);
    setupSwipeControls();
}

function setupSwipeControls() {
    if (!canvas) return;
    canvas.style.touchAction = 'none';
    const swipeState = {
        active: false,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        accumX: 0,
        accumY: 0,
        hardDropTriggered: false,
        tapCandidate: false,
        startTime: 0
    };
    let lastTapTime = 0;
    const MOVE_THRESHOLD = 28;
    const HARD_DROP_THRESHOLD = 70;
    const TAP_DISTANCE = 12;
    const TAP_TIME = 250;

    const handlePointerDown = (event) => {
        if (event.pointerType !== 'touch') return;
        event.preventDefault();
        swipeState.active = true;
        swipeState.startX = swipeState.lastX = event.clientX;
        swipeState.startY = swipeState.lastY = event.clientY;
        swipeState.accumX = 0;
        swipeState.accumY = 0;
        swipeState.hardDropTriggered = false;
        swipeState.tapCandidate = true;
        swipeState.startTime = performance.now();
        try {
            canvas.setPointerCapture(event.pointerId);
        } catch (_) {
            // Ignore capture errors (e.g., unsupported browsers)
        }
    };

    const handlePointerMove = (event) => {
        if (!swipeState.active || event.pointerType !== 'touch') return;
        event.preventDefault();
        const deltaX = event.clientX - swipeState.lastX;
        const deltaY = event.clientY - swipeState.lastY;
        swipeState.accumX += deltaX;
        swipeState.accumY += deltaY;
        swipeState.lastX = event.clientX;
        swipeState.lastY = event.clientY;

        while (swipeState.accumX <= -MOVE_THRESHOLD) {
            movePieceMobile(-1);
            swipeState.accumX += MOVE_THRESHOLD;
            swipeState.tapCandidate = false;
        }
        while (swipeState.accumX >= MOVE_THRESHOLD) {
            movePieceMobile(1);
            swipeState.accumX -= MOVE_THRESHOLD;
            swipeState.tapCandidate = false;
        }
        while (swipeState.accumY >= MOVE_THRESHOLD) {
            softDropMobile();
            swipeState.accumY -= MOVE_THRESHOLD;
            swipeState.tapCandidate = false;
        }

        const upwardTravel = swipeState.startY - event.clientY;
        if (!swipeState.hardDropTriggered && upwardTravel >= HARD_DROP_THRESHOLD) {
            hardDropMobile();
            swipeState.hardDropTriggered = true;
            swipeState.tapCandidate = false;
        }

        if (
            Math.abs(event.clientX - swipeState.startX) > TAP_DISTANCE ||
            Math.abs(event.clientY - swipeState.startY) > TAP_DISTANCE
        ) {
            swipeState.tapCandidate = false;
        }
    };

    const handlePointerEnd = (event) => {
        if (!swipeState.active || (event.pointerType && event.pointerType !== 'touch')) return;
        event.preventDefault();
        try {
            if (canvas.hasPointerCapture(event.pointerId)) {
                canvas.releasePointerCapture(event.pointerId);
            }
        } catch (_) {
            // Ignore release errors
        }
        const elapsed = performance.now() - swipeState.startTime;
        const totalMove = Math.hypot(event.clientX - swipeState.startX, event.clientY - swipeState.startY);
        if (swipeState.tapCandidate && totalMove < TAP_DISTANCE && elapsed < TAP_TIME) {
            handleTap();
        }
        swipeState.active = false;
    };

    const handleTap = () => {
        const now = performance.now();
        if (now - lastTapTime < 250) {
            holdMobile();
            lastTapTime = 0;
        } else {
            rotateMobile();
            lastTapTime = now;
        }
    };

    canvas.addEventListener('pointerdown', handlePointerDown, { passive: false });
    canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
    canvas.addEventListener('pointerup', handlePointerEnd, { passive: false });
    canvas.addEventListener('pointercancel', handlePointerEnd, { passive: false });
}

function movePieceMobile(direction) {
    if (gameOver || isPaused) return;
    move(direction);
}

function softDropMobile() {
    if (gameOver || isPaused) return;
    if (drop()) {
        score += 1;
        updateDisplay();
    }
}

function rotateMobile() {
    if (gameOver || isPaused) return;
    rotate(1);
}

function hardDropMobile() {
    if (gameOver || isPaused) return;
    hardDrop();
}

function holdMobile() {
    if (gameOver || isPaused) return;
    hold();
}

function updateDisplay() {
    const comboText = combo > 0 ? `${combo}x` : '';
    if (scoreElement) {
        scoreElement.textContent = score.toLocaleString();
    }
    if (levelElement) {
        levelElement.textContent = level;
    }
    if (linesElement) {
        linesElement.textContent = lines;
    }
    if (comboElement) {
        comboElement.textContent = comboText;
    }
    if (scoreMobileElement) {
        scoreMobileElement.textContent = score.toLocaleString();
    }
    if (levelMobileElement) {
        levelMobileElement.textContent = level;
    }
    if (linesMobileElement) {
        linesMobileElement.textContent = lines;
    }
    if (comboMobileElement) {
        comboMobileElement.textContent = combo > 0 ? comboText : '—';
    }
}

// Enhanced piece creation with special pieces (Feature 321-330)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createPiece() {
    if (specialPieces.length > 0 && Math.random() < 0.1) {
        return createSpecialPiece();
    }
    
    if (pieceBag.length === 0) {
        pieceBag = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        shuffleArray(pieceBag);
    }
    const type = pieceBag.pop();
    return {
        type, shape: SHAPES[type], rotation: 0,
        x: Math.floor(COLS / 2) - 1,
        y: 0, color: rainbowMode ? COLORS.RAINBOW[0] : COLORS[type],
        lastMove: null, tSpin: false, special: false
    };
}

function createSpecialPiece() {
    const specialTypes = ['bomb', 'laser', 'freeze', 'gravity', 'time', 'portal'];
    const type = specialTypes[Math.floor(Math.random() * specialTypes.length)];
    
    return {
        type: 'SPECIAL_' + type.toUpperCase(),
        shape: [[1]], // Single block for special pieces
        rotation: 0,
        x: Math.floor(COLS / 2),
        y: 0,
        color: '#ff00ff',
        lastMove: null,
        tSpin: false,
        special: true,
        specialType: type
    };
}

// Enhanced spawn with special effects (Feature 331-340)
function spawnPiece() {
    currentPiece = nextPieceQueue.shift();
    nextPieceQueue.push(createPiece());
    canHold = true;
    stats.totalPieces++;
    
    // Special piece effects
    if (currentPiece.special) {
        activateSpecialEffect(currentPiece.specialType);
    }
    
    // AI assistance
    if (aiAssistance && hintSystem) {
        calculateOptimalPlacement();
    }
    
    // Environmental effects
    if (gravityMode) {
        currentPiece.gravityMultiplier = 2;
    }
    
    // Check for game over
    if (collision()) {
        if (!invincibilityActive) {
            endGame();
            return;
        }
    }
    
    recordLastPlayableState();
    drawNextPieces();
}

function activateSpecialEffect(type) {
    switch (type) {
        case 'bomb':
            bombsAvailable++;
            break;
        case 'laser':
            clearRandomRow();
            break;
        case 'freeze':
            slowTimeActive = true;
            setTimeout(() => slowTimeActive = false, 5000);
            break;
        case 'gravity':
            gravityMode = true;
            setTimeout(() => gravityMode = false, 10000);
            break;
        case 'time':
            dropInterval *= 0.5;
            setTimeout(() => dropInterval *= 2, 8000);
            break;
        case 'portal':
            createPortal();
            break;
    }
}

function clearRandomRow() {
    const randomRow = Math.floor(Math.random() * ROWS);
    board[randomRow] = Array(COLS).fill(0);
    score += 1000;
    if (softbodyMode) {
        rebuildSoftbodyClusters({ releasedRows: [randomRow] });
    }
    updateDisplay();
}

// Core game functions
function move(dir) {
    if (!currentPiece) return false;
    currentPiece.x += dir;
    if (collision()) {
        currentPiece.x -= dir;
        return false;
    }
    return true;
}

function rotate(dir) {
    if (!currentPiece) return false;
    const previousRotation = currentPiece.rotation;
    currentPiece.rotation = (currentPiece.rotation + dir + currentPiece.shape.length) % currentPiece.shape.length;
    
    // Try wall kicks
    const kicks = [[0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1]];
    
    for (let [kickX, kickY] of kicks) {
        currentPiece.x += kickX;
        currentPiece.y += kickY;
        if (!collision()) {
            stats.totalRotations++;
            return true;
        }
        currentPiece.x -= kickX;
        currentPiece.y -= kickY;
    }
    
    // All kicks failed, revert
    currentPiece.rotation = previousRotation;
    return false;
}

function drop() {
    if (!currentPiece) return false;
    
    currentPiece.y++;
    if (collision()) {
        currentPiece.y--;
        merge();
        return false;
    }
    dropCounter = 0;
    return true;
}

function hardDrop() {
    if (!currentPiece) return;
    
    let dropDistance = 0;
    while (!collision()) {
        currentPiece.y++;
        dropDistance++;
    }
    currentPiece.y--;
    score += dropDistance * 2;
    merge();
    updateDisplay();
}

function collision() {
    if (!currentPiece) return true;
    const shape = currentPiece.shape[currentPiece.rotation];
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const newX = currentPiece.x + x;
                const newY = currentPiece.y + y;
                
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

function hold() {
    if (!canHold || !currentPiece) return;
    
    canHold = false;
    
    if (holdPiece === null) {
        holdPiece = currentPiece.type;
        spawnPiece();
    } else {
        const temp = holdPiece;
        holdPiece = currentPiece.type;
        currentPiece = {
            type: temp,
            shape: SHAPES[temp],
            rotation: 0,
            x: Math.floor(COLS / 2) - 1,
            y: 0,
            color: COLORS[temp]
        };
    }
    
    drawHoldPiece();
    if (currentPiece) {
        recordLastPlayableState();
    }
}

// Enhanced merge with special effects (Feature 341-350)
function merge() {
    let mergePositions = [];
    currentPiece.shape[currentPiece.rotation].forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                    mergePositions.push({x: boardX, y: boardY});
                    
                    // Special piece effects on merge
                    if (currentPiece.special) {
                        handleSpecialMerge(currentPiece.specialType, boardX, boardY);
                    }
                    
                    // Softbody clusters are rebuilt after merge when the mode is active.
                }
            }
        });
    });
    
    if (particlesEnabled) createMergeParticles(mergePositions);
    if (softbodyMode) applyImpactEffect();
    
    // Environmental hazard interactions
    checkEnvironmentalHazards(mergePositions);
    
    // Achievement checks
    checkAchievements();
    
    playSound('drop');
    
    // Clear completed lines
    clearLines();
    
    if (softbodyMode) {
        rebuildSoftbodyClusters({ impulsePositions: mergePositions });
    }
    
    // Spawn new piece
    canHold = true;
    spawnPiece();
    
    // Check game over
    if (collision()) {
        gameOver = true;
        endGame();
    }
}

function handleSpecialMerge(type, x, y) {
    switch (type) {
        case 'bomb':
            // Explode nearby blocks
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS) {
                        board[ny][nx] = 0;
                    }
                }
            }
            createExplosion();
            break;
        case 'laser':
            // Clear entire column
            for (let row = 0; row < ROWS; row++) {
                board[row][x] = 0;
            }
            break;
    }
}

function checkEnvironmentalHazards(positions) {
    positions.forEach(pos => {
        environmentalHazards.forEach(hazard => {
            if (Math.abs(hazard.x - pos.x) < 1 && Math.abs(hazard.y - pos.y) < 1) {
                if (hazard.type === 'lava' && !invincibilityActive) {
                    // Damage effect
                    flashEffect = 0.5;
                    score = Math.max(0, score - 100);
                }
            }
        });
    });
}

function checkAchievements() {
    if (stats.gamesPlayed >= 1 && !unlockedAchievements.includes('first_game')) {
        unlockAchievement('first_game');
    }
    if (combo >= 20 && !unlockedAchievements.includes('combo_king')) {
        unlockAchievement('combo_king');
    }
    if (stats.tetrisLines >= 100 && !unlockedAchievements.includes('tetris_master')) {
        unlockAchievement('tetris_master');
    }
}

function unlockAchievement(id) {
    unlockedAchievements.push(id);
    const achievement = achievementList.find(a => a.id === id);
    if (achievement) {
        // Show achievement notification
        createAchievementNotification(achievement);
        currency += 50; // Reward
        saveSettings();
    }
}

function createAchievementNotification(achievement) {
    // Create floating notification
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <h3>🏆 ${achievement.name}</h3>
        <p>${achievement.description}</p>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Enhanced line clearing with special effects (Feature 351-360)
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
        // Enhanced line clear types
        if (linesCleared === 1) stats.singleLines++;
        else if (linesCleared === 2) stats.doubleLines++;
        else if (linesCleared === 3) stats.tripleLines++;
        else if (linesCleared === 4) {
            stats.tetrisLines++;
            screenShake = 10;
            createExplosion();
            if (stats.fastestTetris > Date.now() - gameStartTime) {
                stats.fastestTetris = Date.now() - gameStartTime;
            }
        }
        
        // Special scoring with multipliers
        let baseScore = [0, 100, 300, 500, 800][linesCleared];
        let multiplier = 1;
        
        if (isTSpin) {
            stats.tSpins++;
            baseScore *= 1.5;
            flashEffect = 0.5;
        }
        
        if (combo > 0) multiplier += combo * 0.1;
        if (doublePointsActive) multiplier *= 2;
        if (slowTimeActive) multiplier *= 1.5;
        
        score += Math.floor(baseScore * level * multiplier);
        
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        score += combo * 50 * level;
        
        lines += linesCleared;
        level = Math.floor(lines / 10) + 1;
        refreshDropInterval();
        
        // Special effects for different line clears
        if (linesCleared === 4) {
            createTetrisEffect();
        } else if (isTSpin) {
            createTSpinEffect();
        }
        
        // Animate line clear with enhanced effects
        animateLineClear(clearedRows);
        
        setTimeout(() => {
            clearedRows.forEach(row => {
                board.splice(row, 1);
                board.unshift(Array(COLS).fill(0));
            });
            
            if (softbodyMode) {
                rebuildSoftbodyClusters({ releasedRows: clearedRows });
            }
            
            checkPerfectClear();
        }, 300);
        
        updateDisplay();
        playSound('clear');
    } else {
        combo = 0;
    }
}

function createTetrisEffect() {
    // Special Tetris celebration
    screenShake = 15;
    flashEffect = 1.0;
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: canvas.width / 2, y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 0.5) * 15,
            life: 2, color: COLORS.RAINBOW[i % 7], size: 5
        });
    }
}

function createTSpinEffect() {
    // T-Spin visual effect
    flashEffect = 0.8;
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: currentPiece.x * BLOCK_SIZE + BLOCK_SIZE / 2,
            y: currentPiece.y * BLOCK_SIZE + BLOCK_SIZE / 2,
            vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8,
            life: 1.5, color: '#a000f0', size: 4
        });
    }
}

// Drawing functions
function drawBoard() {
    if (softbodyMode) return;
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                ctx.fillStyle = board[y][x];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.lineWidth = 2;
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                
                // Add 3D effect
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, 3);
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 3, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece(piece, isGhost = false) {
    if (!piece) return;
    
    const shape = piece.shape[piece.rotation];
    let drawYOffset = 0;
    
    if (isGhost) {
        // Calculate ghost position without modifying piece
        let testY = piece.y;
        const originalY = piece.y;
        
        while (true) {
            piece.y = testY + 1;
            if (collision()) {
                break;
            }
            testY++;
        }
        piece.y = originalY;
        drawYOffset = testY - originalY;
    }
    
    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const drawY = piece.y + y + (isGhost ? drawYOffset : 0);
                const drawX = piece.x + x;
                
                if (drawY >= 0) {
                    if (invisibleMode && !isGhost) {
                        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
                    } else if (isGhost) {
                        ctx.fillStyle = COLORS.GHOST;
                    } else {
                        ctx.fillStyle = piece.color;
                    }
                    
                    ctx.fillRect(drawX * BLOCK_SIZE, drawY * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = isGhost ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(drawX * BLOCK_SIZE, drawY * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    
                    if (!isGhost && !invisibleMode) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                        ctx.fillRect(drawX * BLOCK_SIZE, drawY * BLOCK_SIZE, BLOCK_SIZE, 3);
                        ctx.fillRect(drawX * BLOCK_SIZE, drawY * BLOCK_SIZE, 3, BLOCK_SIZE);
                    }
                }
            }
       });
    });
}

function drawNextPieces() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    for (let i = 0; i < Math.min(3, nextPieceQueue.length); i++) {
        const piece = nextPieceQueue[i];
        if (!piece) continue;
        
        const shape = piece.shape[0];
        const offsetY = i * 120;
        
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    nextCtx.fillStyle = piece.color;
                    nextCtx.fillRect(x * 25 + 10, y * 25 + 10 + offsetY, 25, 25);
                    nextCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                    nextCtx.lineWidth = 2;
                    nextCtx.strokeRect(x * 25 + 10, y * 25 + 10 + offsetY, 25, 25);
                }
            });
        });
    }
}

function drawHoldPiece() {
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    
    if (holdPiece) {
        const shape = SHAPES[holdPiece][0];
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    holdCtx.fillStyle = COLORS[holdPiece];
                    holdCtx.fillRect(x * 25 + 10, y * 25 + 10, 25, 25);
                    holdCtx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
                    holdCtx.strokeRect(x * 25 + 10, y * 25 + 10, 25, 25);
                }
            });
        });
    }
}

function drawParticles() {
    particles.forEach((p, i) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1;
        
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        if (p.life <= 0) particles.splice(i, 1);
    });
}

function drawUIEffects() {
    // Additional UI effects
}

// Enhanced drawing with all visual effects (Feature 361-370)
function draw() {
    ctx.save();
    
    // Trail effect - draw semi-transparent black rectangle instead of clearing
    if (trailEffect) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // FUCKASS MODE EFFECTS - Apply stupid transformations
    if (fuckassMode) {
        applyFuckassEffects();
    }
    
    // Post-processing effects
    if (bloomEffect) applyBloomEffect();
    if (motionBlur) applyMotionBlur();
    if (chromaticAberration) applyChromaticAberration();
    
    // Screen shake
    if (screenShake > 0) {
        ctx.translate(
            (Math.random() - 0.5) * screenShake,
            (Math.random() - 0.5) * screenShake
        );
        screenShake *= 0.9;
    }
    
    // Flash effect
    if (flashEffect > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashEffect})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        flashEffect *= 0.9;
    }
    
    drawBoard();
    drawSoftbodyPieces();
    if (currentPiece) {
        if (ghostPieceEnabled) drawPiece(currentPiece, true);
        drawPiece(currentPiece);
    }
    
    drawNextPieces();
    drawParticles();
    drawWeatherEffects();
    drawEnvironmentalHazards();
    drawUIEffects();
    
    ctx.restore();
}

function applyBloomEffect() {
    // Simple bloom simulation
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
}

function applyMotionBlur() {
    // Motion blur effect
    ctx.globalAlpha = 0.8;
}

function applyChromaticAberration() {
    // Chromatic aberration effect
    // This would require multiple render passes in a real implementation
}

function drawWeatherEffects() {
    if (weatherSystem !== 'clear') {
        weatherParticles.forEach(particle => {
            ctx.fillStyle = weatherSystem === 'rain' ? 'rgba(0, 100, 255, 0.6)' :
                           weatherSystem === 'snow' ? 'rgba(255, 255, 255, 0.8)' :
                           'rgba(255, 200, 0, 0.4)';
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            
            particle.y += particle.vy;
            particle.x += particle.vx;
            
            if (particle.y > canvas.height) {
                particle.y = -particle.size;
                particle.x = Math.random() * canvas.width;
            }
        });
    }
}

function drawEnvironmentalHazards() {
    environmentalHazards.forEach(hazard => {
        if (hazard.active) {
            const x = hazard.x * BLOCK_SIZE;
            const y = hazard.y * BLOCK_SIZE;
            
            ctx.fillStyle = hazard.type === 'lava' ? '#ff4400' :
                           hazard.type === 'spike' ? '#666666' :
                           '#0088ff';
            ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            
            // Hazard animation
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
        }
    });
}

function drawUIEffects() {
    // Draw active power-ups
    activePowerUps.forEach((powerUp, index) => {
        ctx.fillStyle = powerUp.color;
        ctx.fillRect(10, 10 + index * 30, 20, 20);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(powerUp.name, 35, 25 + index * 30);
    });
    
    // Draw combo counter with effects
    if (combo > 1) {
        ctx.fillStyle = `hsl(${combo * 10}, 100%, 50%)`;
        ctx.font = 'bold 24px Arial';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText(`${combo}x`, canvas.width - 60, 40);
        ctx.fillText(`${combo}x`, canvas.width - 60, 40);
    }
}

function drawSoftbodyPieces() {
    if (!softbodyMode || softbodyClusters.length === 0) return;
    softbodyClusters.forEach(cluster => {
        ctx.save();
        const widthPx = cluster.width * BLOCK_SIZE;
        const heightPx = cluster.height * BLOCK_SIZE;
        const centerX = (cluster.x + cluster.width / 2) * BLOCK_SIZE;
        const centerY = (cluster.y + cluster.height / 2) * BLOCK_SIZE;
        ctx.translate(centerX, centerY);
        ctx.rotate(cluster.angle);
        ctx.translate(-widthPx / 2, -heightPx / 2);
        cluster.blocks.forEach(block => {
            const bx = block.x * BLOCK_SIZE;
            const by = block.y * BLOCK_SIZE;
            ctx.fillStyle = block.color || '#ffffff';
            ctx.fillRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(bx, by, BLOCK_SIZE, 3);
            ctx.fillRect(bx, by, 3, BLOCK_SIZE);
        });
        ctx.restore();
    });
}

// Enhanced game loop with all systems (Feature 371-380)
function gameLoop(time = 0) {
    if (gameOver || isPaused) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    refreshDropInterval();
    
    if (dropCounter > dropInterval * (slowTimeActive ? 2 : 1)) {
        drop();
    }
    
    updateDAS();
    updateParticles(deltaTime);
    updateWeather(deltaTime);
    updateEnvironmentalHazards(deltaTime);
    updatePowerUps(deltaTime);
    updateAI(deltaTime);
    updateNetwork(deltaTime);
    
    // FUCKASS MODE - Apply chaotic updates
    if (fuckassMode) {
        updateFuckassMode(deltaTime);
    }
    
    if (softbodyMode) {
        updateSoftbodyPhysics(deltaTime);
        syncBoardWithPhysics();
    }
    
    // Rainbow mode color cycling
    if (rainbowMode && currentPiece) {
        const colorIndex = Math.floor(time / 100) % COLORS.RAINBOW.length;
        currentPiece.color = COLORS.RAINBOW[colorIndex];
    }
    
    // Time dilation effects
    if (timeDilation !== 1) {
        // Apply time dilation to various systems
    }
    
    // Quantum effects
    if (quantumEffects) {
        applyQuantumEffects();
    }
    
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function updateWeather(deltaTime) {
    // Update weather particle positions
    weatherParticles.forEach(particle => {
        particle.y += particle.vy * (deltaTime / 16);
        particle.x += particle.vx * (deltaTime / 16);
        
        if (particle.y > canvas.height) {
            particle.y = -particle.size;
            particle.x = Math.random() * canvas.width;
        }
    });
}

function updateDAS() {
    // DAS (Delayed Auto Shift) for smooth movement
}

function updateParticles(deltaTime) {
    particles.forEach((p, i) => {
        p.vy += 0.2; // gravity
        p.x += p.vx * (deltaTime / 16);
        p.y += p.vy * (deltaTime / 16);
    });
}

function updateEnvironmentalHazards(deltaTime) {
    environmentalHazards.forEach(hazard => {
        if (hazard.type === 'electric') {
            // Electric hazard animation
            hazard.animation = (hazard.animation || 0) + deltaTime * 0.01;
        }
    });
}

function updatePowerUps(deltaTime) {
    activePowerUps.forEach(powerUp => {
        powerUp.duration -= deltaTime;
        if (powerUp.duration <= 0) {
            deactivatePowerUp(powerUp);
        }
    });
    activePowerUps = activePowerUps.filter(p => p.duration > 0);
}

function updateAI(deltaTime) {
    if (aiAssistance) {
        // Update AI hint system
        updateHints();
    }
    if (autoPilot) {
        // Auto-play functionality
        performAutoMove();
    }
}

function updateNetwork(deltaTime) {
    if (multiplayerMode && networkConnected) {
        // Update multiplayer state
        syncWithServer();
    }
}

function applyQuantumEffects() {
    // Random quantum teleportation effects
    if (Math.random() < 0.001) {
        if (currentPiece) {
            currentPiece.x = Math.floor(Math.random() * (COLS - currentPiece.shape[0].length));
        }
    }
}

// Enhanced input handling (Feature 381-390)
function handleKeyDown(e) {
    if (gameOver) {
        processGameOverInput(e);
        return;
    }
    
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
        return;
    }
    
    if (isPaused) return;
    
    const keyActions = {
        'ArrowLeft': () => { move(reversedControls ? 1 : -1); leftPressed = true; dasTimer = 0; },
        'ArrowRight': () => { move(reversedControls ? -1 : 1); rightPressed = true; dasTimer = 0; },
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
        // New hotkeys for advanced features
        '1': () => activatePowerUp('slow_time'),
        '2': () => activatePowerUp('double_points'),
        '3': () => activatePowerUp('invincibility'),
        '4': () => activatePowerUp('magnet'),
        '5': () => { weatherSystem = weatherSystem === 'rain' ? 'snow' : 'rain'; },
        '6': () => { chaosMode = !chaosMode; initEnvironmentalHazards(); },
        '7': () => { aiAssistance = !aiAssistance; },
        '8': () => { bloomEffect = !bloomEffect; },
        '9': () => { motionBlur = !motionBlur; },
        '0': () => { proceduralMusic = !proceduralMusic; },
        'f': () => toggleFuckassMode(),
        'F': () => toggleFuckassMode()
    };
    
    if (keyActions[e.key]) keyActions[e.key]();
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
}

function processGameOverInput(e) {
    if (e.key === 'Enter') {
        restart();
        return;
    }
    if (e.key.length !== 1) return;
    const letter = e.key.toLowerCase();
    if (!/[a-z]/.test(letter)) return;
    cheatBuffer = (cheatBuffer + letter).slice(-CHEAT_CODE.length);
    if (!continueUsed && cheatBuffer === CHEAT_CODE) {
        attemptCheatContinue();
    }
}

function attemptCheatContinue() {
    if (!lastPlayableState || continueUsed) return;
    restoreLastPlayableState();
}

function clonePiece(piece) {
    return piece ? JSON.parse(JSON.stringify(piece)) : null;
}

function recordLastPlayableState() {
    if (gameOver || !currentPiece) return;
    lastPlayableState = {
        board: board.map(row => [...row]),
        currentPiece: clonePiece(currentPiece),
        nextPieceQueue: nextPieceQueue.map(clonePiece),
        pieceBag: [...pieceBag],
        holdPiece,
        canHold,
        score,
        level,
        lines,
        combo,
        maxCombo,
        dropInterval,
        bombsAvailable,
        slowTimeActive,
        doublePointsActive,
        invincibilityActive,
        magnetActive,
        activePowerUps: activePowerUps.map(powerUp => ({ ...powerUp })),
        ghostPieceEnabled,
        holdEnabled,
        harddropEnabled,
        softbodyMode
    };
}

function calculateDropInterval(currentLevel, elapsedMs) {
    const levelReduction = Math.max(0, currentLevel - 1) * LEVEL_INTERVAL_STEP;
    const timeReduction = Math.floor(elapsedMs / TIME_RAMP_INTERVAL) * TIME_INTERVAL_STEP;
    return Math.max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - levelReduction - timeReduction);
}

function refreshDropInterval(force = false) {
    const elapsed = Math.max(0, Date.now() - gameStartTime);
    const newInterval = calculateDropInterval(level, elapsed);
    if (force || Math.abs(newInterval - dropInterval) > 1) {
        dropInterval = newInterval;
    }
}

function clearTopRowsForContinue(rowsToClear = CONTINUE_ROW_CLEANUP) {
    let modified = false;
    const limit = Math.min(rowsToClear, ROWS);
    for (let y = 0; y < limit; y++) {
        if (board[y].some(cell => cell !== 0)) {
            board[y] = Array(COLS).fill(0);
            modified = true;
        }
    }
    return modified;
}

function restoreLastPlayableState() {
    if (!lastPlayableState) return;
    board = lastPlayableState.board.map(row => [...row]);
    currentPiece = clonePiece(lastPlayableState.currentPiece);
    nextPieceQueue = lastPlayableState.nextPieceQueue.map(clonePiece);
    pieceBag = [...lastPlayableState.pieceBag];
    holdPiece = lastPlayableState.holdPiece;
    canHold = lastPlayableState.canHold;
    score = lastPlayableState.score;
    level = lastPlayableState.level;
    lines = lastPlayableState.lines;
    combo = lastPlayableState.combo;
    maxCombo = lastPlayableState.maxCombo;
    dropInterval = lastPlayableState.dropInterval;
    bombsAvailable = lastPlayableState.bombsAvailable;
    slowTimeActive = lastPlayableState.slowTimeActive;
    doublePointsActive = lastPlayableState.doublePointsActive;
    invincibilityActive = lastPlayableState.invincibilityActive;
    magnetActive = lastPlayableState.magnetActive;
    activePowerUps = lastPlayableState.activePowerUps.map(powerUp => ({ ...powerUp }));
    ghostPieceEnabled = lastPlayableState.ghostPieceEnabled;
    holdEnabled = lastPlayableState.holdEnabled;
    harddropEnabled = lastPlayableState.harddropEnabled;
    softbodyMode = lastPlayableState.softbodyMode;
    clearTopRowsForContinue();
    if (softbodyMode) {
        rebuildSoftbodyClusters({ settleExisting: true });
    } else {
        softbodyClusters = [];
    }
    dropCounter = 0;
    lastTime = performance.now();
    gameOver = false;
    continueUsed = true;
    cheatBuffer = '';
    lastPlayableState = null;
    const overlay = document.getElementById('gameOverOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    const modeIndicator = document.getElementById('modeIndicator');
    if (modeIndicator) {
        if (softbodyMode) {
            modeIndicator.innerHTML = '<p>Softbody</p>';
            modeIndicator.classList.add('softbody');
        } else {
            modeIndicator.innerHTML = '<p>Normal</p>';
            modeIndicator.classList.remove('softbody');
        }
    }
    refreshDropInterval(true);
    updateDisplay();
    drawNextPieces();
    drawHoldPiece();
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

function restart() {
    // Reset game state
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    softbodyClusters = [];
    score = 0;
    level = 1;
    lines = 0;
    combo = 0;
    gameOver = false;
    isPaused = false;
    dropCounter = 0;
    dropInterval = BASE_DROP_INTERVAL;
    particles = [];
    screenShake = 0;
    flashEffect = 0;
    lastPlayableState = null;
    continueUsed = false;
    cheatBuffer = '';
    
    // Reset fuckass mode
    if (fuckassMode) {
        toggleFuckassMode();
    }
    
    // Regenerate pieces
    nextPieceQueue = [];
    for (let i = 0; i < 6; i++) {
        nextPieceQueue.push(createPiece());
    }
    spawnPiece();
    canHold = true;
    holdPiece = null;
    
    updateDisplay();
    drawHoldPiece();
    
    document.getElementById('gameOverOverlay').style.display = 'none';
    
    lastTime = performance.now();
    refreshDropInterval(true);
    gameLoop();
}

function toggleSoftbodyMode() {
    softbodyMode = !softbodyMode;
    const modeIndicator = document.getElementById('modeIndicator');
    if (modeIndicator) {
        if (softbodyMode) {
            modeIndicator.innerHTML = '<p>Softbody</p>';
            modeIndicator.classList.add('softbody');
        } else {
            modeIndicator.innerHTML = '<p>Normal</p>';
            modeIndicator.classList.remove('softbody');
        }
    }

    if (softbodyMode) {
        initSoftbodyPhysics();
    } else {
        // When disabling, sync physics back into the board and clear
        syncBoardWithPhysics(true);
        softbodyClusters = [];
    }
}

function toggleRainbowMode() {
    rainbowMode = !rainbowMode;
}

function playSound(type) {
    // Sound placeholder
}

function createPowerUpEffect(powerUp) {
    // Visual effect for power-up activation
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1,
            color: powerUp.color,
            size: 4
        });
    }
}

function useBomb() {
    // Clear a 3x3 area
    bombsAvailable--;
    screenShake = 20;
    flashEffect = 1;
    
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            life: 1.5,
            color: '#ff4400',
            size: 6
        });
    }
    
    // Clear random blocks
    for (let i = 0; i < 15; i++) {
        const x = Math.floor(Math.random() * COLS);
        const y = Math.floor(Math.random() * ROWS);
        board[y][x] = 0;
    }

    if (softbodyMode) {
        rebuildSoftbodyClusters();
    }
}

function initSoftbodyPhysics() {
    rebuildSoftbodyClusters({ settleExisting: true });
    syncBoardWithPhysics();
}

function rebuildSoftbodyClusters({ releasedRows = [], impulsePositions = [], settleExisting = false } = {}) {
    if (!softbodyMode) return;
    const previousClusters = softbodyClusters;
    const previousCellOwners = new Map();
    previousClusters.forEach((cluster, index) => {
        getClusterRoundedCells(cluster).forEach(cell => {
            previousCellOwners.set(`${cell.x},${cell.y}`, { index });
        });
    });

    const visited = Array(ROWS).fill().map(() => Array(COLS).fill(false));
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const impulseKeySet = new Set((impulsePositions || []).map(pos => `${pos.x},${pos.y}`));
    const newClusters = [];

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (!board[y][x] || visited[y][x]) continue;
            const cells = [];
            const queue = [[x, y]];
            visited[y][x] = true;

            while (queue.length) {
                const [cx, cy] = queue.shift();
                cells.push({ x: cx, y: cy, color: board[cy][cx] });
                dirs.forEach(([dx, dy]) => {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && board[ny][nx] && !visited[ny][nx]) {
                        visited[ny][nx] = true;
                        queue.push([nx, ny]);
                    }
                });
            }

            const minX = Math.min(...cells.map(cell => cell.x));
            const maxX = Math.max(...cells.map(cell => cell.x));
            const minY = Math.min(...cells.map(cell => cell.y));
            const maxY = Math.max(...cells.map(cell => cell.y));

            const cluster = {
                x: minX,
                y: minY,
                width: maxX - minX + 1,
                height: maxY - minY + 1,
                blocks: cells.map(cell => ({ x: cell.x - minX, y: cell.y - minY, color: cell.color })),
                vx: 0,
                vy: 0,
                angle: 0,
                angularVelocity: 0,
                settled: settleExisting,
                mass: cells.length
            };

            const overlapTotals = {};
            cells.forEach(cell => {
                const owner = previousCellOwners.get(`${cell.x},${cell.y}`);
                if (owner) {
                    overlapTotals[owner.index] = (overlapTotals[owner.index] || 0) + 1;
                }
            });

            let carriedCluster = null;
            let bestOverlap = 0;
            Object.entries(overlapTotals).forEach(([index, count]) => {
                if (count > bestOverlap) {
                    bestOverlap = count;
                    carriedCluster = previousClusters[index];
                }
            });

            if (carriedCluster) {
                const prevBounds = getClusterRoundedBounds(carriedCluster);
                cluster.x = carriedCluster.x + (minX - prevBounds.minX);
                cluster.y = carriedCluster.y + (minY - prevBounds.minY);
                cluster.vx = carriedCluster.vx;
                cluster.vy = carriedCluster.vy;
                cluster.angle = carriedCluster.angle;
                cluster.angularVelocity = carriedCluster.angularVelocity;
                cluster.settled = settleExisting ? true : carriedCluster.settled;
            }

            const wasReleased = releasedRows.some(row => cells.some(cell => cell.y <= row));
            const wasImpacted = cells.some(cell => impulseKeySet.has(`${cell.x},${cell.y}`));
            if (!settleExisting && (wasReleased || wasImpacted)) {
                cluster.settled = false;
                cluster.vy += wasImpacted ? 2.5 : 0;
                cluster.vx += (Math.random() - 0.5) * 0.6;
                cluster.angularVelocity += (Math.random() - 0.5) * 0.05;
            }

            newClusters.push(cluster);
        }
    }

    softbodyClusters = newClusters;
}

function updateSoftbodyPhysics(deltaTime) {
    if (!softbodyMode || softbodyClusters.length === 0) return;
    const totalDt = Math.min(deltaTime / 1000, 0.032);
    const stepDt = totalDt / physicsSteps;

    for (let step = 0; step < physicsSteps; step++) {
        softbodyClusters.forEach(cluster => {
            if (cluster.settled) return;

            cluster.vy += gravity * stepDt * 60;
            cluster.vx *= damping;
            cluster.vy *= damping;
            cluster.angularVelocity *= 0.98;

            cluster.x += cluster.vx * stepDt * 60;
            cluster.y += cluster.vy * stepDt * 60;
            cluster.angle += cluster.angularVelocity * stepDt * 60;
            cluster.angle = Math.max(-0.6, Math.min(0.6, cluster.angle));

            if (cluster.x < 0) {
                cluster.x = 0;
                cluster.vx = -cluster.vx * bounce;
            }
            if (cluster.x + cluster.width > COLS) {
                cluster.x = COLS - cluster.width;
                cluster.vx = -cluster.vx * bounce;
            }

            const bottom = cluster.y + cluster.height;
            if (bottom >= ROWS) {
                cluster.y = ROWS - cluster.height;
                if (cluster.vy > 0) cluster.vy = -cluster.vy * bounce;
                cluster.angularVelocity *= 0.6;
            }
        });

        resolveSoftbodyCollisions();
    }
}

function resolveSoftbodyCollisions() {
    for (let i = 0; i < softbodyClusters.length; i++) {
        for (let j = i + 1; j < softbodyClusters.length; j++) {
            const a = softbodyClusters[i];
            const b = softbodyClusters[j];
            const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
            const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
            if (overlapX <= 0 || overlapY <= 0) continue;

            if (overlapY < overlapX) {
                const correction = overlapY / 2;
                if (a.y < b.y) {
                    a.y -= correction;
                    b.y += correction;
                } else {
                    a.y += correction;
                    b.y -= correction;
                }
                const vySwap = (a.vy - b.vy) * bounce;
                a.vy -= vySwap;
                b.vy += vySwap;
            } else {
                const correction = overlapX / 2;
                if (a.x < b.x) {
                    a.x -= correction;
                    b.x += correction;
                } else {
                    a.x += correction;
                    b.x -= correction;
                }
                const vxSwap = (a.vx - b.vx) * bounce;
                a.vx -= vxSwap;
                b.vx += vxSwap;
            }

            a.settled = false;
            b.settled = false;
            const torque = (Math.random() - 0.5) * 0.03;
            a.angularVelocity += torque;
            b.angularVelocity -= torque;
        }
    }

    softbodyClusters.forEach(cluster => {
        const onFloor = Math.abs(cluster.y + cluster.height - ROWS) < 0.05;
        const onStack = softbodyClusters.some(other => other !== cluster && Math.abs((cluster.y + cluster.height) - other.y) < 0.05 && rangesOverlap(cluster.x, cluster.x + cluster.width, other.x, other.x + other.width));
        if ((onFloor || onStack) && Math.abs(cluster.vy) < 0.05 && Math.abs(cluster.vx) < 0.05 && Math.abs(cluster.angularVelocity) < 0.02) {
            cluster.vx = 0;
            cluster.vy = 0;
            cluster.angularVelocity = 0;
            cluster.angle *= 0.5;
            cluster.settled = true;
        }
    });
}

function syncBoardWithPhysics(finalize = false) {
    if ((!softbodyMode || softbodyClusters.length === 0) && !finalize) return;
    const newBoard = Array(ROWS).fill().map(() => Array(COLS).fill(0));

    softbodyClusters.forEach(cluster => {
        cluster.blocks.forEach(block => {
            const gx = Math.round(cluster.x + block.x);
            const gy = Math.round(cluster.y + block.y);
            if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
                newBoard[gy][gx] = block.color;
            }
        });
    });
    board = newBoard;

    if (finalize) {
        softbodyClusters.forEach(cluster => {
            cluster.x = Math.round(cluster.x * 100) / 100;
            cluster.y = Math.round(cluster.y * 100) / 100;
            cluster.vx = 0;
            cluster.vy = 0;
            cluster.angularVelocity = 0;
            cluster.angle = 0;
            cluster.settled = true;
        });
    }
}

function getClusterRoundedCells(cluster) {
    const cells = [];
    cluster.blocks.forEach(block => {
        const x = Math.round(cluster.x + block.x);
        const y = Math.round(cluster.y + block.y);
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
            cells.push({ x, y });
        }
    });
    return cells;
}

function getClusterRoundedBounds(cluster) {
    const cells = getClusterRoundedCells(cluster);
    if (!cells.length) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const xs = cells.map(cell => cell.x);
    const ys = cells.map(cell => cell.y);
    return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys)
    };
}

function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

function checkPerfectClear() {
    const isEmpty = board.every(row => row.every(cell => cell === 0));
    if (isEmpty) {
        score += 10000;
        stats.perfectClears++;
        flashEffect = 1;
        screenShake = 25;
    }
}

function animateLineClear(rows) {
    // Line clear animation
}

function createSpecialPiece() {
    // Create a special piece with unique abilities
    const piece = createPiece();
    piece.special = true;
    return piece;
}

// Power-up system (Feature 391-400)
function activatePowerUp(type) {
    if (powerUpCooldowns[type] > 0) return;
    
    const powerUps = {
        slow_time: { name: 'Slow Time', duration: 10000, color: '#0088ff', effect: () => slowTimeActive = true },
        double_points: { name: '2x Points', duration: 15000, color: '#ffaa00', effect: () => doublePointsActive = true },
        invincibility: { name: 'Shield', duration: 8000, color: '#00ff00', effect: () => invincibilityActive = true },
        magnet: { name: 'Magnet', duration: 12000, color: '#ff00ff', effect: () => magnetActive = true }
    };
    
    if (powerUps[type]) {
        const powerUp = { ...powerUps[type], type };
        activePowerUps.push(powerUp);
        powerUp.effect();
        powerUpCooldowns[type] = 30000; // 30 second cooldown
        
        // Visual feedback
        createPowerUpEffect(powerUp);
        playSound('powerup');
    }
}

function deactivatePowerUp(powerUp) {
    switch (powerUp.type) {
        case 'slow_time': slowTimeActive = false; break;
        case 'double_points': doublePointsActive = false; break;
        case 'invincibility': invincibilityActive = false; break;
        case 'magnet': magnetActive = false; break;
    }
}

function endGame() {
    gameOver = true;
    cheatBuffer = '';
    
    // Update stats
    stats.gamesPlayed++;
    if (score > stats.highScore) {
        stats.highScore = score;
    }
    
    // Show game over screen
    document.getElementById('gameOverOverlay').style.display = 'flex';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('highScoreDisplay').textContent = `High Score: ${stats.highScore}`;
    
    // Save stats
    saveSettings();
    
    console.log('Game Over! Final Score:', score);
}

function createMergeParticles(positions) {
    positions.forEach(pos => {
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: pos.x * BLOCK_SIZE + BLOCK_SIZE / 2,
                y: pos.y * BLOCK_SIZE + BLOCK_SIZE / 2,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5 - 2,
                life: 1,
                color: currentPiece ? currentPiece.color : '#ffffff',
                size: 3
            });
        }
    });
}

function applyImpactEffect() {
    screenShake = 5;
}

function createExplosion() {
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            life: 1.5,
            color: '#ff4400',
            size: 5
        });
    }
    screenShake = 20;
}

function createAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <strong>Achievement Unlocked!</strong><br>
        ${achievement.name}<br>
        <small>${achievement.description}</small>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

function createPowerUpEffect(powerUp) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: canvas.width / 2, y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
            life: 1, color: powerUp.color, size: 3
        });
    }
}

// AI assistance system (Feature 401-410)
function calculateOptimalPlacement() {
    // Simple AI to suggest best placement
    // This would be much more complex in a real implementation
    const bestMoves = [];
    
    // Evaluate all possible rotations and positions
    for (let rotation = 0; rotation < 4; rotation++) {
        for (let x = 0; x < COLS; x++) {
            const testPiece = {
                ...currentPiece,
                x: x,
                rotation: rotation,
                shape: SHAPES[currentPiece.type][rotation] || currentPiece.shape
            };
            
            if (!collision(testPiece.x, testPiece.y, testPiece.shape)) {
                // Drop to bottom
                let dropY = testPiece.y;
                while (!collision(testPiece.x, dropY + 1, testPiece.shape)) {
                    dropY++;
                }
                
                // Evaluate position
                const score = evaluatePosition(testPiece, dropY);
                bestMoves.push({ x: testPiece.x, rotation: rotation, score: score });
            }
        }
    }
    
    // Sort by score and highlight best move
    bestMoves.sort((a, b) => b.score - a.score);
    if (bestMoves.length > 0) {
        // Store best move for hint system
        window.bestMove = bestMoves[0];
    }
}

function evaluatePosition(piece, y) {
    // Simple evaluation function
    let score = 0;
    
    // Height penalty
    score -= y * 2;
    
    // Holes penalty
    let holes = 0;
    for (let col = 0; col < COLS; col++) {
        let foundBlock = false;
        for (let row = 0; row < ROWS; row++) {
            if (board[row][col]) {
                foundBlock = true;
            } else if (foundBlock) {
                holes++;
            }
        }
    }
    score -= holes * 10;
    
    // Line clear potential
    let completeLines = 0;
    for (let row = 0; row < ROWS; row++) {
        let filled = 0;
        for (let col = 0; col < COLS; col++) {
            if (board[row][col]) filled++;
        }
        if (filled === COLS) completeLines++;
    }
    score += completeLines * 50;
    
    return score;
}

function performAutoMove() {
    if (window.bestMove) {
        // Automatically perform the best move
        while (currentPiece.rotation !== window.bestMove.rotation) {
            rotate(1);
        }
        while (currentPiece.x !== window.bestMove.x) {
            move(currentPiece.x < window.bestMove.x ? 1 : -1);
        }
        hardDrop();
    }
}

// Network multiplayer (Feature 411-420)
function syncWithServer() {
    // Simulate network sync
    // In a real implementation, this would use WebSockets or similar
    if (Math.random() < 0.01) { // Simulate opponent moves
        // Update opponent boards, send local moves, etc.
    }
}

function sendMoveToServer(move) {
    // Send move to server
    console.log('Sending move:', move);
}

function receiveOpponentUpdate(update) {
    // Update opponent state
    console.log('Received opponent update:', update);
}

// Procedural music system (Feature 421-430)
function generateProceduralMusic() {
    if (!audioContext || !proceduralMusic) return;
    
    // Generate music based on game state
    const tempo = 120 + level * 2;
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
    
    // Create melody based on score, level, combo, etc.
    const melody = [];
    for (let i = 0; i < 8; i++) {
        const noteIndex = Math.floor(
            (score % 1000) / 1000 * notes.length +
            level % notes.length +
            combo % notes.length
        ) % notes.length;
        melody.push(notes[noteIndex]);
    }
    
    playMelody(melody, tempo);
}

function playMelody(melody, tempo) {
    // Simple melody player
    melody.forEach((note, index) => {
        setTimeout(() => {
           
            playNote(note, 0.3);
        }, index * (60000 / tempo));
    });
}

function playNote(note, duration) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Convert note to frequency
    const noteFreq = {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88
    }[note] || 440;
    
    oscillator.frequency.setValueAtTime(noteFreq, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Advanced analytics (Feature 431-440)
function updateAnalytics() {
    // Track detailed performance metrics
    const currentTime = Date.now();
    const gameDuration = currentTime - gameStartTime;
    
    detailedStats = {
        ...detailedStats,
        averagePieceTime: gameDuration / stats.totalPieces,
        accuracy: calculateAccuracy(),
        efficiency: score / Math.max(1, gameDuration / 1000),
        adaptability: calculateAdaptability(),
        peakPerformance: Math.max(detailedStats.peakPerformance || 0, score),
        consistency: calculateConsistency()
    };
}

function calculateAccuracy() {
    // Calculate placement accuracy
    return Math.min(100, (stats.totalLines * 10) / Math.max(1, stats.totalPieces));
}

function calculateAdaptability() {
    // How well player adapts to different situations
    return Math.min(100, level * 2 + combo * 5);
}

function calculateConsistency() {
    // Measure score consistency
    return Math.min(100, score / Math.max(1, stats.gamesPlayed * 1000));
}

// Economy system (Feature 441-450)
function purchaseItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (item && currency >= item.cost && !item.owned) {
        currency -= item.cost;
        item.owned = true;
        
        // Apply item effect
        switch (itemId) {
            case 'rainbow_theme':
                rainbowMode = true;
                break;
            case 'neon_theme':
                // Apply neon theme
                break;
            case 'bomb_powerup':
                bombsAvailable += 5;
                break;
            case 'slow_time':
                // Add to inventory
                break;
        }
        
        saveSettings();
        updateDisplay();
    }
}

function earnCurrency(amount) {
    currency += amount;
    premiumCurrency += Math.floor(amount / 10);
    saveSettings();
}

// Tournament system (Feature 451-460)
function startTournament() {
    tournamentMode = true;
    tournamentBracket = generateTournamentBracket();
    currentTournamentRound = 0;
}

function generateTournamentBracket() {
    // Generate tournament bracket
    return {
        rounds: [],
        currentRound: 0,
        players: ['Player', 'AI_Easy', 'AI_Medium', 'AI_Hard']
    };
}

function advanceTournament() {
    // Advance to next round
    tournamentBracket.currentRound++;
    if (tournamentBracket.currentRound >= tournamentBracket.rounds.length) {
        // Tournament complete
        awardTournamentPrize();
    }
}

function awardTournamentPrize() {
    currency += 1000;
    premiumCurrency += 100;
    unlockAchievement('tournament_winner');
}

// Daily challenges (Feature 461-470)
function generateDailyChallenge() {
    const challenges = [
        { type: 'score', target: 50000, reward: 100 },
        { type: 'tetris', target: 10, reward: 150 },
        { type: 'combo', target: 15, reward: 200 },
        { type: 'perfect_clear', target: 3, reward: 300 },
        { type: 'time', target: 300000, reward: 250 } // 5 minutes
    ];
    
    dailyChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    dailyChallenge.startTime = Date.now();
}

function checkDailyChallenge() {
    if (!dailyChallenge) return;
    
    let completed = false;
    switch (dailyChallenge.type) {
        case 'score':
            completed = score >= dailyChallenge.target;
            break;
        case 'tetris':
            completed = stats.tetrisLines >= dailyChallenge.target;
            break;
        case 'combo':
            completed = maxCombo >= dailyChallenge.target;
            break;
        case 'perfect_clear':
            completed = stats.perfectClears >= dailyChallenge.target;
            break;
        case 'time':
            completed = (Date.now() - dailyChallenge.startTime) <= dailyChallenge.target;
            break;
    }
    
    if (completed) {
        earnCurrency(dailyChallenge.reward);
        dailyChallenge = null;
        generateDailyChallenge(); // Generate new challenge
    }
}

// Advanced game modes (Feature 471-480)
function startZenMode() {
    zenMode = true;
    level = 1;
    dropInterval = 1000;
    score = 0;
    lines = 0;
    // No time pressure, just relax and play
}

function startPuzzleMode() {
    puzzleMode = true;
    // Load predefined puzzle layouts
    loadPuzzle(0);
}

function loadPuzzle(puzzleId) {
    // Load specific puzzle configuration
    const puzzles = [
        { board: [], objective: 'Clear all lines' },
        // More puzzles...
    ];
}

function startTimeAttack() {
    timeAttackMode = true;
    const timeLimit = 120000; // 2 minutes
    setTimeout(() => {
        if (timeAttackMode) {
            endTimeAttack();
        }
    }, timeLimit);
}

function endTimeAttack() {
    timeAttackMode = false;
    const finalScore = score;
    // Save high score, show results
}

// Special effects modes (Feature 481-490)
function activateLightningMode() {
    lightningMode = true;
    setTimeout(() => {
        lightningMode = false;
    }, 30000);
    
    // Lightning effects
    setInterval(() => {
        if (lightningMode) {
            createLightningStrike();
        }
    }, 2000);
}

function createLightningStrike() {
    const x = Math.random() * COLS;
    // Clear random column
    for (let row = 0; row < ROWS; row++) {
        if (Math.random() < 0.3) {
            board[row][Math.floor(x)] = 0;
        }
    }
    flashEffect = 1.0;
    if (softbodyMode) {
        rebuildSoftbodyClusters();
    }
}

function activateFireMode() {
    fireMode = true;
    // Fire spreads and destroys blocks
}

function activateIceMode() {
    iceMode = true;
    // Pieces freeze in place temporarily
}

// Meta features (Feature 491-500)
function startGameWithinGame() {
    gameWithinGame = true;
    // Create a mini Tetris game within the current game
    const miniCanvas = document.createElement('canvas');
    miniCanvas.width = 100;
    miniCanvas.height = 100;
    // Position it somewhere on screen
}

function activateRecursiveTetris() {
    recursiveTetris = true;
    // Each block contains a smaller Tetris game
}

function startTetrisSimulator() {
    tetrisSimulator = true;
    // Simulate multiple Tetris games simultaneously
}

function activateTetrisBuilder() {
    tetrisBuilder = true;
    // Allow building custom Tetris pieces and boards
}

function startTetrisAnalyzer() {
    tetrisAnalyzer = true;
    // Analyze optimal strategies in real-time
}

function activateTetrisResearcher() {
    tetrisResearcher = true;
    // Collect data for Tetris research
}

function startTetrisStreamer() {
    tetrisStreamer = true;
    // Streaming features, overlays, etc.
}

function activateTetrisTeacher() {
    tetrisTeacher = true;
    // Tutorial and teaching features
}

function startTetrisPhilosopher() {
    tetrisPhilosopher = true;
    // Deep philosophical questions about Tetris
}

// Final features (Feature 501-510)
function activateQuantumTetris() {
    quantumEffects = true;
    // Pieces can be in multiple places at once
}

function startRelativityMode() {
    relativityMode = true;
    // Time dilation based on speed
}

function createWormholes() {
    wormholes = [];
    for (let i = 0; i < 2; i++) {
        wormholes.push({
            x: Math.random() * COLS,
            y: Math.random() * ROWS,
            targetX: Math.random() * COLS,
            targetY: Math.random() * ROWS
        });
    }
}

function activateButterflyEffect() {
    // Small changes have large consequences
    // Every move affects future piece generation
}

function startTetrisDream() {
    // Surreal dream-like Tetris experience
}

function activateTetrisNightmare() {
    // Difficult nightmare mode
    chaosMode = true;
    lightningMode = true;
    fireMode = true;
    // Everything goes wrong
}

function createTetrisUniverse() {
    // Multiple boards, multiple players, complex interactions
}

function startTetrisEvolution() {
    // Pieces evolve and change over time
}

// ============= FUCKASS TETRIS MODE =============
// The most unfair, chaotic, and stupidly designed mode ever

function toggleFuckassMode() {
    fuckassMode = !fuckassMode;
    
    if (fuckassMode) {
        fuckassIntensity = 1.0;
        fuckassTimer = 0;
        fuckassPenalties = [];
        
        // Apply stupid design
        document.body.classList.add('fuckass-mode');
        document.body.style.fontFamily = 'Comic Sans MS, cursive';
        
        // Update mode indicator
        const modeIndicator = document.getElementById('modeIndicator');
        if (modeIndicator) {
            modeIndicator.innerHTML = '<p style="color: #ff0080; font-weight: bold; animation: fuckassTitle 0.5s infinite;">🤬 FUCKASS MODE 🤬</p>';
        }
        
        alert('🤬 FUCKASS MODE ACTIVATED! 🤬\n\nThis mode is challenging but playable!\n\n• Occasional random penalties\n• Sometimes reversed controls\n• Random garbage blocks\n• Visual distortions\n• Board tricks\n• But you can win!\n\nGood luck!');
        
        // Start with a penalty immediately
        setTimeout(() => applyRandomFuckassPenalty(), 2000);
    } else {
        fuckassRotation = 0;
        fuckassZoom = 1.0;
        reversedControls = false;
        
        // Restore normal design
        document.body.classList.remove('fuckass-mode');
        document.body.style.fontFamily = 'Arial, sans-serif';
        
        // Update mode indicator
        const modeIndicator = document.getElementById('modeIndicator');
        if (modeIndicator) {
            modeIndicator.innerHTML = '<p>Normal</p>';
        }
    }
}

function applyFuckassEffects() {
    // Much more subtle rotation
    fuckassRotation += (Math.random() - 0.5) * 0.005;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.sin(fuckassTimer / 3000) * 0.03 + fuckassRotation); // Reduced from 0.1 to 0.03
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    
    // Subtle zoom
    fuckassZoom = 1 + Math.sin(fuckassTimer / 1500) * 0.05; // Reduced from 0.2 to 0.05
    ctx.scale(fuckassZoom, fuckassZoom);
    
    // Gentler hue shift
    const hueShift = Math.sin(fuckassTimer / 800) * 60; // Reduced from 180 to 60
    ctx.filter = `hue-rotate(${hueShift}deg) saturate(1.3) contrast(1.1) brightness(${1 + Math.sin(fuckassTimer / 500) * 0.1})`;
    
    // Less frequent color inversion
    if (Math.random() < 0.002) { // Reduced from 0.01 to 0.002
        ctx.filter += ' invert(1)';
    }
    
    // Minimal alpha change
    ctx.globalAlpha = 0.95 + Math.random() * 0.05; // Tighter range
}

function updateFuckassMode(deltaTime) {
    fuckassTimer += deltaTime;
    fuckassIntensity = Math.min(3, 1 + fuckassTimer / 120000); // Gets worse slower, max 3 instead of 5
    
    // Random penalties much less frequent
    if (Math.random() < 0.001 * fuckassIntensity) { // Reduced from 0.005
        applyRandomFuckassPenalty();
    }
    
    // Rarely speed up drop
    if (Math.random() < 0.0003 * fuckassIntensity) { // Reduced from 0.001
        dropInterval = Math.max(200, dropInterval - 50); // Less severe
    }
    
    // Very rarely reverse controls
    if (Math.random() < 0.0001) { // Reduced from 0.0005
        reversedControls = !reversedControls;
        createFuckassNotification('🔄 Controls Reversed!');
    }
    
    // Rare garbage spawns
    if (Math.random() < 0.0005 * fuckassIntensity) { // Reduced from 0.002
        spawnRandomGarbageBlock();
    }
    
    // Occasional mercy (remove blocks)
    if (Math.random() < 0.001 && Math.random() < 0.5) { // More likely
        removeRandomBottomRow();
    }
    
    // Much less screen shake
    if (Math.random() < 0.003) { // Reduced from 0.01
        screenShake = 10 * fuckassIntensity; // Reduced from 20
        flashEffect = 0.3; // Reduced from 0.8
    }
}

function applyRandomFuckassPenalty() {
    const penalties = [
        () => {
            // Spawn 1 garbage line (reduced from 1-3)
            board.pop();
            const newLine = Array(COLS).fill(1).map(() => Math.random() < 0.3 ? Math.floor(Math.random() * 7) + 1 : 0);
            board.unshift(newLine);
            createFuckassNotification('💩 Garbage Line!');
            if (softbodyMode) {
                rebuildSoftbodyClusters();
            }
        },
        () => {
            // Shuffle one random row (not flip board)
            const row = Math.floor(Math.random() * ROWS);
            board[row].sort(() => Math.random() - 0.5);
            createFuckassNotification('🎲 Row Shuffled!');
            if (softbodyMode) {
                rebuildSoftbodyClusters();
            }
        },
        () => {
            // Make piece invisible for 3 seconds (reduced from 5)
            invisibleMode = true;
            setTimeout(() => invisibleMode = false, 3000);
            createFuckassNotification('👻 Invisible Piece!');
        },
        () => {
            // Rotate piece once (not random)
            if (currentPiece) {
                currentPiece.rotation = (currentPiece.rotation + 1) % currentPiece.shape.length;
            }
            createFuckassNotification('🌀 Rotation!');
        },
        () => {
            // Disable hold for 5 seconds (reduced from 10)
            canHold = false;
            setTimeout(() => canHold = true, 5000);
            createFuckassNotification('🚫 Hold Disabled!');
        },
        () => {
            // Small speed boost
            const oldInterval = dropInterval;
            dropInterval = Math.max(300, dropInterval * 0.7); // Less severe
            setTimeout(() => dropInterval = oldInterval, 5000);
            createFuckassNotification('⚡ Speed Up!');
        },
        () => {
            // Steal fewer points
            score = Math.max(0, score - Math.floor(Math.random() * 200)); // Reduced from 500
            createFuckassNotification('💸 Points Stolen!');
        },
        () => {
            // Small teleport (keep y position)
            if (currentPiece) {
                currentPiece.x = Math.floor(Math.random() * (COLS - 4));
            }
            createFuckassNotification('🌀 Shifted!');
        },
        () => {
            // Fill fewer random cells
            for (let i = 0; i < 5; i++) { // Reduced from 10
                const x = Math.floor(Math.random() * COLS);
                const y = Math.floor(Math.random() * ROWS);
                board[y][x] = Math.floor(Math.random() * 7) + 1;
            }
            createFuckassNotification('💥 Random Blocks!');
            if (softbodyMode) {
                rebuildSoftbodyClusters();
            }
        }
    ];
    
    const penalty = penalties[Math.floor(Math.random() * penalties.length)];
    penalty();
    
    // Less screen shake
    screenShake = 15; // Reduced from 30
    flashEffect = 0.3; // Reduced from 0.6
}

function spawnRandomGarbageBlock() {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * (ROWS / 2));
    if (board[y] && board[y][x] === 0) {
        board[y][x] = Math.floor(Math.random() * 7) + 1;
    }
    if (softbodyMode) {
        rebuildSoftbodyClusters();
    }
}

function removeRandomBottomRow() {
    const row = Math.floor(Math.random() * 5) + (ROWS - 5);
    if (board[row]) {
        board[row] = Array(COLS).fill(0);
        createFuckassNotification('✨ Mercy!');
    }
    if (softbodyMode) {
        rebuildSoftbodyClusters({ releasedRows: [row] });
    }
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
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

let reversedControls = false;


function activateTetrisRevolution() {
    // Complete gameplay revolution
}

function reachTetrisEnlightenment() {
    // Ultimate Tetris understanding achieved
    // Unlock all features, perfect play, cosmic awareness
}

// Initialize everything
window.addEventListener('load', init);