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

    update: () => {

    }
};

document.addEventListener('DOMContentLoaded', () => {
    Layer3.init();
});