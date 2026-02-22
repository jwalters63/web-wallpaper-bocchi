const Layer0 = {
    config: {
        targets: {
            5: "#addbdb",    // Amanecer
            10: "#e1d0bb",   // Día
            14: "#d4a373",   // Tarde (Beige)
            17.5: "#73506c", // Crepúsculo (Ajustado a 5:30 PM)
            18: "#2f2c35"    // Noche (6:00 PM)
        },
        // Actualizamos el mapa para reflejar el 17.5
        prevMap: { 5: 18, 10: 5, 14: 10, 17.5: 14, 18: 17.5 }
    },

    init: () => {
        console.log("[System] Layer 0 (Sky & Celestials) Initialized.");
    },

    update: (hour) => {
        const sky = document.getElementById('sky-layer');
        if (!sky) return;

        // --- 1. LÓGICA DEL COLOR DEL CIELO ---
        let finalColor;
        let transitionFound = false;

        // Actualizamos el array con el nuevo objetivo
        const targets = [5, 10, 14, 17.5, 18];

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
            else if (hour >= 17.5) finalColor = Layer0.config.targets[17.5]; // Actualizado
            else if (hour >= 14) finalColor = Layer0.config.targets[14];
            else if (hour >= 10) finalColor = Layer0.config.targets[10];
            else finalColor = Layer0.config.targets[5];
        }

        sky.style.backgroundColor = finalColor;

        const preview = document.getElementById('color-preview');
        if(preview) preview.style.backgroundColor = finalColor;

        // --- 2. EL SOL (Visión de Túnel - Atardecer Wakandiano 4x) ---
        const sun = document.getElementById('sun');

        if (sun) {
            // Activo de 4:00 AM a 5:40 PM (17.66)
            if (hour >= 4.0 && hour <= 17.66) {
                // Total: 13.66 horas de ciclo.
                const t = (hour - 4.0) / 13.66;

                const x = 85;
                const y = 100 - (Math.sin(t * Math.PI) * 90);

                // El cénit ahora es a las 10:50 AM (10.83)
                let distFromZenith = Math.abs(hour - 10.83);

                // Multiplicador ajustado a 0.064
                // A las 17:40 (distancia = 6.83): 6.83^2 = ~46.6.
                // 46.6 * 0.064 = ~2.98. Escala total = 1 + 2.98 = ~4.0x
                let scale = 1 + (Math.pow(distFromZenith, 2) * 0.064);

                // Transición de opacidad. Empieza a apagarse a las 17:10 (17.16)
                let op = 1;
                if (hour < 4.5) op = (hour - 4.0) * 2;
                else if (hour > 17.16) op = 1 - ((hour - 17.16) * 2);

                sun.style.transform = `translate(-50%, -50%) translate(${x}vw, ${y}vh) scale(${scale})`;
                sun.style.opacity = op;
            } else {
                sun.style.opacity = 0;
            }
        }

        // 🌙 LA LUNA (Luna Llena Estática en Cénit)
        if (moon) {
            let moonHour = hour <= 12 ? hour + 24 : hour;

            // Activa de 7:00 PM (19.0) a 3:00 AM (27.0)
            if (moonHour >= 19.0 && moonHour <= 27.0) {
                const x = 80;
                const y = 20;
                const scale = 2;

                let op = 1;
                if (moonHour < 21.0) op = (moonHour - 19.0) / 2;
                else if (moonHour > 26.0) op = 1 - (moonHour - 26.0);

                moon.style.transform = `translate(-50%, -50%) translate(${x}vw, ${y}vh) scale(${scale})`;
                moon.style.opacity = op;

                // NUEVO: Avisamos al CSS que la luna está activa para encender el contraluz
                document.body.classList.add('moonlight-active');
            } else {
                moon.style.opacity = 0;

                // NUEVO: Apagamos el contraluz cuando la luna desaparece
                document.body.classList.remove('moonlight-active');
            }
        }
    }
};