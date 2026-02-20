const Layer3 = {
    config: {
        imgOpen: 'assets/bocchi.png',
        imgClosed: 'assets/bocchi_ojos_cerrados.png',
        blinkDuration: 150,
        minInterval: 3000,
        maxInterval: 8000
    },

    sprite: null,

    init: () => {
        Layer3.sprite = document.getElementById('character-sprite');

        if (Layer3.sprite) {
            console.log("Layer 3: Personaje inicializado.");
            Layer3.scheduleNextBlink();
        } else {
            console.error("Layer 3: No se encontró el elemento #character-sprite en el DOM.");
        }
    },

    scheduleNextBlink: () => {
        const min = Layer3.config.minInterval;
        const max = Layer3.config.maxInterval;
        const randomDelay = Math.random() * (max - min) + min;

        setTimeout(Layer3.blink, randomDelay);
    },

    blink: () => {
        if (!Layer3.sprite) return;

        Layer3.sprite.src = Layer3.config.imgClosed;

        setTimeout(() => {
            Layer3.sprite.src = Layer3.config.imgOpen;

            Layer3.scheduleNextBlink();

        }, Layer3.config.blinkDuration);
    },

    update: (hour) => {
        if (!Layer3.sprite) return;

        let brightness = 1.0;
        let sepia = 0;
        let hue = 0;
        let contrast = 1.0;

        if (hour >= 17.5 || hour < 4.5) {
            brightness = 0.55; // Bajamos la luz a la mitad
            sepia = 0.4;       // Activamos un ligero tinte
            hue = -60;         // Rotamos el tinte hacia un azul frío
            saturate = 0.6;
            // contrast = 1.1;    // Subimos un poco el contraste para no perder las líneas
        }

        else if ((hour >= 4.5 && hour < 6) || (hour >= 15 && hour < 17.5)) {
            brightness = 0.8;
            sepia = 0.4;       // El sepia natural le da un tono cálido y naranja
            saturate = 1.2;    // Sobresaturamos ligeramente por la luz rasante del sol
            hue = -15;
            contrast = 1.05;
        }

        else {
            brightness = 1.0;
            sepia = 0;
            hue = 0;
            contrast = 1.0;
        }

        Layer3.sprite.style.filter = `brightness(${brightness}) sepia(${sepia}) hue-rotate(${hue}deg) contrast(${contrast})`;

        const citySprite = document.getElementById('city-sprite');
        if (citySprite) {
            citySprite.style.filter = `brightness(${brightness}) sepia(${sepia}) saturate(${saturate}) hue-rotate(${hue}deg) contrast(${contrast})`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Layer3.init();
});