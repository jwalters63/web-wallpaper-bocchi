/**
 * ATMOSPHERE ENGINE v3.5 - CORE LOGIC
 * Arquitectura: Estados Finitos (Real vs Simulación)
 * Capas: Cielo (0), Estrellas (1), Nubes 3D (2)
 */

// ==========================================
// 1. CONFIGURACIÓN DEL SISTEMA
// ==========================================

// Paleta de colores del ciclo día/noche
const SKY_TARGETS = {
    5:  "#addbdb", // Amanecer (05:00)
    10: "#e1d0bb", // Día (10:00)
    14: "#d4a373", // Tarde (14:00)
    18: "#2f2c35"  // Noche (18:00)
};

// Mapa de precedencia (Para saber desde qué color venimos)
const SKY_PREV_MAP = { 5: 18, 10: 5, 14: 10, 18: 14 };

// Configuración de Estrellas Procedimentales
const STARS_CFG = {
    density: 0.02,
    rows: 60,
    chars: ['.', '.', '+', '*']
};

// ==========================================
// 2. ESTADO GLOBAL (STATE MANAGEMENT)
// ==========================================

let appState = {
    mode: 'REAL',       // 'REAL' o 'SIM'
    isPaused: false,    // Solo aplica en modo SIM
    speed: 1,           // Multiplicador de velocidad (x1 a x10)
    virtualTime: 0      // Segundos acumulados del día (0 a 86400)
};

let lastTimestamp = Date.now();

// ==========================================
// 3. UTILIDADES MATEMÁTICAS
// ==========================================

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function getSecondsFromDate(date) {
    return (date.getHours() * 3600) + (date.getMinutes() * 60) + date.getSeconds();
}

// ==========================================
// 4. GENERADORES DE RECURSOS (SE EJECUTAN UNA VEZ)
// ==========================================

// --- Generador de Estrellas (Texto Dinámico) ---
function generateStarField() {
    const charWidth = 9;
    const screenWidth = window.innerWidth;
    // Calculamos columnas para cubrir el 75% de la pantalla + margen
    const dynamicCols = Math.ceil((screenWidth * 0.75) / charWidth) + 5;

    console.log(`[System] Generando Cosmos: ${dynamicCols} columnas.`);

    let field = "";
    for (let r = 0; r < STARS_CFG.rows; r++) {
        let line = "";
        for (let c = 0; c < dynamicCols; c++) {
            if (Math.random() < STARS_CFG.density) {
                line += STARS_CFG.chars[Math.floor(Math.random() * STARS_CFG.chars.length)];
            } else {
                line += " ";
            }
        }
        field += line + "\n";
    }
    return field;
}

// --- Generador de Nubes (Textura Horneada) ---
function bakeCloudTexture() {
    console.log("[System] Horneando nubes en Canvas...");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Pintamos 40 nubes difusas
    for (let i = 0; i < 40; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * 60 + 30;

        const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
        grd.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        grd.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    const plane = document.getElementById('cloud-plane');
    if (plane) plane.style.backgroundImage = `url(${canvas.toDataURL()})`;
}

// ==========================================
// 5. MOTOR PRINCIPAL (UPDATE LOOP)
// ==========================================

function update() {
    const now = Date.now();
    const deltaTime = (now - lastTimestamp) / 1000; // Segundos reales por frame
    lastTimestamp = now;

    // --- A. GESTIÓN DEL TIEMPO ---
    let currentTotalSeconds;

    if (appState.mode === 'REAL') {
        // Modo Real: Sincronización absoluta con el sistema
        const date = new Date();
        currentTotalSeconds = getSecondsFromDate(date);

        // Mantenemos el reloj virtual sincronizado para transiciones suaves
        appState.virtualTime = currentTotalSeconds;
    } else {
        // Modo Simulación
        if (!appState.isPaused) {
            // Avanzamos el tiempo según el slider de velocidad
            // Multiplicamos por 100 para que sea notable (1 seg real = X min virtuales)
            // Ojo: Si quieres x1 = 1 seg real, quita el * 100.
            // Para debug visual rápido, recomiendo velocidad base alta.
            // Ajuste solicitado: x1 a x10 velocidad de reloj.
            appState.virtualTime += deltaTime * appState.speed;
        }

        // Bucle de 24 horas (86400 segundos)
        if (appState.virtualTime >= 86400) appState.virtualTime = 0;
        currentTotalSeconds = appState.virtualTime;
    }

    const currentHour = currentTotalSeconds / 3600;

    // --- B. LÓGICA VISUAL (SKY LAYER) ---
    let finalColor, statusText = "Estático";
    let transitionFound = false;
    const targets = [5, 10, 14, 18];

    for (let t of targets) {
        // Buscamos si estamos en la hora previa al objetivo (Ventana de transición)
        if (currentHour >= t - 1 && currentHour < t) {
            transitionFound = true;
            const factor = currentHour - (t - 1); // 0.0 a 1.0

            const c1 = hexToRgb(SKY_TARGETS[SKY_PREV_MAP[t]]);
            const c2 = hexToRgb(SKY_TARGETS[t]);

            const r = Math.round(c1.r + (c2.r - c1.r) * factor);
            const g = Math.round(c1.g + (c2.g - c1.g) * factor);
            const b = Math.round(c1.b + (c2.b - c1.b) * factor);

            finalColor = `rgb(${r}, ${g}, ${b})`;
            statusText = `Transición -> ${t}:00`;
            break;
        }
    }

    if (!transitionFound) {
        if (currentHour >= 18 || currentHour < 4) finalColor = SKY_TARGETS[18];
        else if (currentHour >= 14) finalColor = SKY_TARGETS[14];
        else if (currentHour >= 10) finalColor = SKY_TARGETS[10];
        else finalColor = SKY_TARGETS[5];
    }
    document.getElementById('sky-layer').style.backgroundColor = finalColor;

    // --- C. LÓGICA DE CAPAS (OPACIDAD) ---

    // 1. Estrellas (Visibles de noche: 18:00 - 05:00)
    let starOp = 0;
    if (currentHour >= 18 || currentHour < 4) starOp = 1.0;
    else if (currentHour >= 17 && currentHour < 18) starOp = (currentHour - 17) * 0.3; // Fade in tarde
    else if (currentHour >= 4 && currentHour < 5) starOp = 1.0 - (currentHour - 4);   // Fade out mañana

    const starView = document.getElementById('stars-viewport');
    if (starView) starView.style.opacity = starOp;

    // 2. Nubes (Más visibles de día, tenues de noche)
    let cloudOp = 0.5; // Base día
    if (currentHour >= 19 || currentHour < 5) cloudOp = 0.2; // Base noche
    else if (currentHour >= 17 && currentHour < 19) cloudOp = 0.3; // Transición

    const cloudPlane = document.getElementById('cloud-plane');
    if (cloudPlane) cloudPlane.style.opacity = cloudOp;

    // --- D. ACTUALIZACIÓN UI ---
    const h = Math.floor(currentHour);
    const m = Math.floor((currentHour * 60) % 60);
    const s = Math.floor((currentHour * 3600) % 60);
    const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    document.getElementById('debug-time').innerText = timeStr;
    document.getElementById('debug-status').innerText = statusText;
    document.getElementById('color-preview').style.backgroundColor = finalColor;
}

// ==========================================
// 6. EVENTOS DEL PANEL DE CONTROL
// ==========================================

function initEvents() {
    const btnMode = document.getElementById('btn-mode-toggle');
    const simControls = document.getElementById('sim-controls');
    const modeLabel = document.getElementById('mode-indicator');

    const btnPause = document.getElementById('btn-play-pause');
    const slider = document.getElementById('speed-slider');
    const speedLabel = document.getElementById('speed-label');
    const statusText = document.getElementById('sim-status-text');

    // [NUEVO] Referencia al input de tiempo
    const timeInput = document.getElementById('sim-time-input');

    // 1. Toggle Modo Real / Simulación
    btnMode.onclick = () => {
        if (appState.mode === 'REAL') {
            // Cambiar a SIMULACIÓN
            appState.mode = 'SIM';

            // Sincronizar input con hora actual al entrar
            const date = new Date();
            const hStr = String(date.getHours()).padStart(2, '0');
            const mStr = String(date.getMinutes()).padStart(2, '0');

            appState.virtualTime = getSecondsFromDate(date);
            timeInput.value = `${hStr}:${mStr}`; // Setear el input visualmente

            // UI Updates
            btnMode.innerText = "VOLVER A TIEMPO REAL";
            btnMode.classList.add('active');
            simControls.classList.remove('disabled');
            modeLabel.innerText = "SIMULACIÓN";
            modeLabel.style.color = "#ffaa00";
        } else {
            // Volviendo a REAL
            appState.mode = 'REAL';
            appState.isPaused = false;

            btnMode.innerText = "ACTIVAR SIMULACIÓN";
            btnMode.classList.remove('active');
            simControls.classList.add('disabled');
            modeLabel.innerText = "TIEMPO REAL";
            modeLabel.style.color = "#00ff9d";

            btnPause.innerText = "⏸";
            statusText.innerText = "EJECUTANDO";
        }
    };

    // 2. Play / Pause
    btnPause.onclick = () => {
        appState.isPaused = !appState.isPaused;
        if (appState.isPaused) {
            btnPause.innerText = "▶";
            statusText.innerText = "PAUSADO";
            statusText.style.color = "#ff5555";
        } else {
            btnPause.innerText = "⏸";
            statusText.innerText = "EJECUTANDO";
            statusText.style.color = "#e0e0e0";
        }
    };

    // [NUEVO] 3. Salto de Tiempo Manual (Time Input)
    timeInput.oninput = function() {
        if (appState.mode === 'SIM') {
            const [hours, minutes] = this.value.split(':').map(Number);
            // Convertir HH:MM a segundos totales (y reseteamos segundos a 0 para limpieza)
            appState.virtualTime = (hours * 3600) + (minutes * 60);

            // Opcional: Si estaba pausado, actualizar visualmente un frame para ver el cambio
            if (appState.isPaused) {
                // Forzar un update visual inmediato sin esperar al loop
                // (O simplemente esperar 50ms al siguiente tick, que es imperceptible)
            }
        }
    };

    // 4. Slider Velocidad
    slider.oninput = function() {
        appState.speed = parseInt(this.value);
        speedLabel.innerText = `x${appState.speed}`;
    };
}

// ==========================================
// 7. INICIALIZACIÓN
// ==========================================

function init() {
    console.log("[System] Iniciando Atmosphere Engine v3.5...");

    // 1. Generar Estrellas
    const sContent = document.getElementById('stars-content');
    if(sContent) {
        const stars = generateStarField();
        // Duplicamos para el wrapping infinito
        sContent.innerHTML = `<span>${stars}</span><span>${stars}</span>`;
    }

    // 2. Generar Textura de Nubes
    bakeCloudTexture();

    // 3. Conectar Botones
    initEvents();

    // 4. Arrancar Motor (50ms = 20 FPS para lógica, animaciones van por CSS a 60 FPS)
    setInterval(update, 50);
    update(); // Primera llamada inmediata
}

// Ejecutar
init();