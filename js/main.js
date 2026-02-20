let lastTimestamp = Date.now();

function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - lastTimestamp) / 1000;
    lastTimestamp = now;

    Core.updateTime(deltaTime);

    if (typeof Layer0 !== 'undefined') Layer0.update(AppState.currentHour);
    if (typeof Layer1 !== 'undefined') Layer1.update(AppState.currentHour);
    if (typeof Layer2 !== 'undefined') Layer2.update(AppState.currentHour);
    if (typeof Layer3 !== 'undefined') Layer3.update(AppState.currentHour);

    updateDebugText();

    requestAnimationFrame(gameLoop);
}

function updateDebugText() {
    const timeStr = Core.utils.secondsToTimeStr(AppState.virtualTime);
    const timeEl = document.getElementById('debug-time');
    if (timeEl) timeEl.innerText = timeStr;
}

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
            const h = String(now.getHours()).padStart(2,'0');
            const m = String(now.getMinutes()).padStart(2,'0');
            ui.timeInput.value = `${h}:${m}`;

            ui.btnMode.innerText = "VOLVER A REAL";
            ui.btnMode.classList.add('active');
            ui.simContainer.classList.remove('disabled');
            ui.modeLabel.innerText = "SIMULACIÓN";
            ui.modeLabel.style.color = "#ffaa00";
        } else {
            AppState.mode = 'REAL';

            ui.btnMode.innerText = "ACTIVAR SIMULACIÓN";
            ui.btnMode.classList.remove('active');
            ui.simContainer.classList.add('disabled');
            ui.modeLabel.innerText = "TIEMPO REAL";
            ui.modeLabel.style.color = "#00ff9d";
        }
    };

    ui.btnPause.onclick = () => {
        AppState.isPaused = !AppState.isPaused;
        if (AppState.isPaused) {
            ui.btnPause.innerText = "▶";
            ui.statusText.innerText = "PAUSED";
            ui.statusText.style.color = "#ff5555";
        } else {
            ui.btnPause.innerText = "⏸";
            ui.statusText.innerText = "RUN";
            ui.statusText.style.color = "#e0e0e0";
        }
    };

    ui.timeInput.oninput = function() {
        if (AppState.mode === 'SIM') {
            const [h, m] = this.value.split(':').map(Number);
            AppState.virtualTime = (h * 3600) + (m * 60);
        }
    };

    ui.slider.oninput = function() {
        AppState.speed = parseInt(this.value);
        ui.speedLabel.innerText = `x${AppState.speed}`;
    };
}

window.onload = () => {
    console.log("[System] Boot Sequence Initiated...");

    Core.init();
    if (typeof Layer0 !== 'undefined') Layer0.init();
    if (typeof Layer1 !== 'undefined') Layer1.init();
    if (typeof Layer2 !== 'undefined') Layer2.init();

    setupEvents();

    console.log("[System] Systems Nominal. Starting Loop.");
    requestAnimationFrame(gameLoop);
};

let debugEnabled = false;

window.onload = () => {
    console.log("[System] Boot Sequence Initiated...");

    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel && !debugEnabled) {
        debugPanel.style.display = 'none';
    }

    Core.init();
    if (typeof Layer0 !== 'undefined') Layer0.init();
    if (typeof Layer1 !== 'undefined') Layer1.init();
    if (typeof Layer2 !== 'undefined') Layer2.init();

    setupEvents();

    console.log("[System] Systems Nominal. Starting Loop.");
    requestAnimationFrame(gameLoop);
};

window.addEventListener('keydown', (event) => {
    if (event.shiftKey && event.key.toLowerCase() === 'd') {
        const debugPanel = document.getElementById('debug-panel');
        if (!debugPanel) return;

        debugEnabled = !debugEnabled;

        if (debugEnabled) {
            debugPanel.style.display = 'block';
            console.log("[System] Debug Interface: ENABLED");
        } else {
            debugPanel.style.display = 'none';
            console.log("[System] Debug Interface: DISABLED");
        }
    }
});