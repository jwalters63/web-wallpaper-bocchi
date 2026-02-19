const AppState = {
    mode: 'REAL',
    isPaused: false,
    speed: 1,
    virtualTime: 0,
    currentHour: 0
};

const Core = {
    init: () => {
        const now = new Date();
        AppState.virtualTime = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
        AppState.currentHour = AppState.virtualTime / 3600;
    },

    updateTime: (deltaTime) => {
        if (AppState.mode === 'REAL') {
            const now = new Date();
            AppState.virtualTime = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
        } else {
            if (!AppState.isPaused) {
                AppState.virtualTime += deltaTime * AppState.speed;
            }
            if (AppState.virtualTime >= 86400) AppState.virtualTime = 0;
        }

        AppState.currentHour = AppState.virtualTime / 3600;
    },

    utils: {
        hexToRgb: (hex) => {
            const bigint = parseInt(hex.slice(1), 16);
            return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
        },

        secondsToTimeStr: (totalSeconds) => {
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = Math.floor(totalSeconds % 60);
            return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
    }
};