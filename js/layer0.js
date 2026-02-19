const Layer0 = {
    config: {
        targets: {
            5: "#addbdb",
            10: "#e1d0bb",
            14: "#d4a373",
            18: "#2f2c35"
        },
        prevMap: { 5: 18, 10: 5, 14: 10, 18: 14 }
    },

    init: () => {
        console.log("[System] Layer 0 (Sky) Initialized.");
    },

    update: (hour) => {
        const sky = document.getElementById('sky-layer');
        if (!sky) return;

        let finalColor;
        let transitionFound = false;
        const targets = [5, 10, 14, 18];

        for (let t of targets) {
            if (hour >= t - 1 && hour < t) {
                transitionFound = true;
                const factor = hour - (t - 1);

                const c1 = Core.utils.hexToRgb(Layer0.config.targets[Layer0.config.prevMap[t]]);
                const c2 = Core.utils.hexToRgb(Layer0.config.targets[t]);

                const r = Math.round(c1.r + (c2.r - c1.r) * factor);
                const g = Math.round(c1.g + (c2.g - c1.g) * factor);
                const b = Math.round(c1.b + (c2.b - c1.b) * factor);

                finalColor = `rgb(${r}, ${g}, ${b})`;
                break;
            }
        }

        if (!transitionFound) {
            if (hour >= 18 || hour < 4) finalColor = Layer0.config.targets[18];
            else if (hour >= 14) finalColor = Layer0.config.targets[14];
            else if (hour >= 10) finalColor = Layer0.config.targets[10];
            else finalColor = Layer0.config.targets[5];
        }

        sky.style.backgroundColor = finalColor;

        const preview = document.getElementById('color-preview');
        if(preview) preview.style.backgroundColor = finalColor;
    }
};