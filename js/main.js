// =============================================================================
// OPTIMIZACIÓN: Loop dividido en Fast (rAF ~30fps) y Slow (setInterval 1s)
// + Page Visibility API para pausar cuando la ventana está oculta
// =============================================================================

let lastTimestamp = Date.now();

// Framerate del loop de animación visual: 30 FPS
const fps = 30;
const fpsInterval = 1000 / fps;
let then = Date.now();

// Handle del rAF para poder cancelarlo
let rafId = null;

// Handle del interval lento para poder cancelarlo
let slowIntervalId = null;

// ------------------------------------------------------------------
// LOOP LENTO (1 vez por segundo) — solo cosas que dependen de la hora
// El cielo, el sol, la luna, los filtros de Bocchi: cambian en minutos,
// no en frames. No tiene ningún sentido recalcularlos 30 veces/segundo.
// ------------------------------------------------------------------
function slowUpdate() {
    if (typeof Layer0 !== 'undefined') Layer0.update(AppState.currentHour);
    if (typeof Layer2 !== 'undefined') Layer2.update(AppState.currentHour);
    if (typeof Layer3 !== 'undefined') Layer3.update(AppState.currentHour);

    // El debug text también: no necesita actualizarse 30fps
    updateDebugText();
}

// ------------------------------------------------------------------
// LOOP RÁPIDO (rAF ~30fps) — solo tiempo y Layer1 (estrellas en canvas)
// Layer1 tiene su propia animación interna; aquí solo actualizamos su opacity.
// ------------------------------------------------------------------
function gameLoop() {
    rafId = requestAnimationFrame(gameLoop);

    const now = Date.now();
    const elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);

        const deltaTime = (now - lastTimestamp) / 1000;
        lastTimestamp = now;

        // El tiempo sí necesita actualizarse en el loop rápido (para simulación)
        Core.updateTime(deltaTime);

        // Layer1 solo actualiza el opacity del canvas (transición CSS);
        // su animación interna es independiente
        if (typeof Layer1 !== 'undefined') Layer1.update(AppState.currentHour);
    }
}

// ------------------------------------------------------------------
// PAGE VISIBILITY API — pausa TODO cuando la ventana está cubierta
// Un wallpaper SIEMPRE está debajo de otras ventanas. Sin esto, el engine
// corre a full speed aunque no se vea absolutamente nada.
// ------------------------------------------------------------------
function pauseEngine() {
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    if (slowIntervalId !== null) {
        clearInterval(slowIntervalId);
        slowIntervalId = null;
    }
}

function resumeEngine() {
    if (rafId === null) {
        lastTimestamp = Date.now();
        then = Date.now();
        rafId = requestAnimationFrame(gameLoop);
    }
    if (slowIntervalId === null) {
        slowIntervalId = setInterval(slowUpdate, 1000);
        // Ejecutar una vez inmediatamente al reanudar
        slowUpdate();
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        pauseEngine();
    } else {
        resumeEngine();
    }
});

// ------------------------------------------------------------------
// Debug text — llamado desde slowUpdate, no desde gameLoop
// ------------------------------------------------------------------
function updateDebugText() {
    const timeStr = Core.utils.secondsToTimeStr(AppState.virtualTime);
    const timeEl = document.getElementById('debug-time');
    if (timeEl) timeEl.innerText = timeStr;
}

// ------------------------------------------------------------------
// Eventos del panel de debug
// ------------------------------------------------------------------
function setupEvents() {
    const ui = {
        btnMode: document.getElementById('btn-mode-toggle'),
        simContainer: document.getElementById('sim-controls'),
        modeLabel: document.getElementById('mode-indicator'),
        btnPause: document.getElementById('btn-play-pause'),
        statusText: document.getElementById('sim-status-text'),
        timeInput: document.getElementById('sim-time-input'),
        slider: document.getElementById('speed-slider'),
        speedLabel: document.getElementById('speed-label')
    };

    ui.btnMode.onclick = () => {
        if (AppState.mode === 'REAL') {
            AppState.mode = 'SIM';
            AppState.isPaused = false;

            const now = new Date();
            const h = String(now.getHours()).padStart(2, '0');
            const m = String(now.getMinutes()).padStart(2, '0');
            ui.timeInput.value = `${h}:${m}`;

            ui.btnMode.innerText = 'VOLVER A REAL';
            ui.btnMode.classList.add('active');
            ui.simContainer.classList.remove('disabled');
            ui.modeLabel.innerText = 'SIMULACIÓN';
            ui.modeLabel.style.color = '#ffaa00';
        } else {
            AppState.mode = 'REAL';

            ui.btnMode.innerText = 'ACTIVAR SIMULACIÓN';
            ui.btnMode.classList.remove('active');
            ui.simContainer.classList.add('disabled');
            ui.modeLabel.innerText = 'TIEMPO REAL';
            ui.modeLabel.style.color = '#00ff9d';
        }
    };

    ui.btnPause.onclick = () => {
        AppState.isPaused = !AppState.isPaused;
        if (AppState.isPaused) {
            ui.btnPause.innerText = '▶';
            ui.statusText.innerText = 'PAUSED';
            ui.statusText.style.color = '#ff5555';
        } else {
            ui.btnPause.innerText = '⏸';
            ui.statusText.innerText = 'RUN';
            ui.statusText.style.color = '#e0e0e0';
        }
    };

    ui.timeInput.oninput = function () {
        if (AppState.mode === 'SIM') {
            const [h, m] = this.value.split(':').map(Number);
            AppState.virtualTime = h * 3600 + m * 60;
        }
    };

    ui.slider.oninput = function () {
        AppState.speed = parseInt(this.value);
        ui.speedLabel.innerText = `x${AppState.speed}`;
    };
}

// ------------------------------------------------------------------
// BOOT — un solo window.onload (el original tenía DOS, bug real)
// ------------------------------------------------------------------
let debugEnabled = false;

window.onload = () => {
    console.log('[System] Boot Sequence Initiated...');

    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel && !debugEnabled) {
        debugPanel.style.display = 'none';
    }

    Core.init();
    if (typeof Layer0 !== 'undefined') Layer0.init();
    if (typeof Layer1 !== 'undefined') Layer1.init();
    if (typeof Layer2 !== 'undefined') Layer2.init();

    setupEvents();

    // Arrancar ambos loops
    resumeEngine();

    console.log('[System] Systems Nominal. Loops started (fast: 30fps, slow: 1fps).');
};

// Shortcut Shift+D para mostrar/ocultar el debug panel
window.addEventListener('keydown', (event) => {
    if (event.shiftKey && event.key.toLowerCase() === 'd') {
        const debugPanel = document.getElementById('debug-panel');
        if (!debugPanel) return;

        debugEnabled = !debugEnabled;
        debugPanel.style.display = debugEnabled ? 'block' : 'none';
        console.log(`[System] Debug Interface: ${debugEnabled ? 'ENABLED' : 'DISABLED'}`);
    }
});