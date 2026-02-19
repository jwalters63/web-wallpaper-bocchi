const Layer1 = {
    config: {
        density: 0.02,
        speed: 0.002,
        chars: ['.', '.', '+', '*'],
        fontSize: 13
    },
    stars: [],
    ctx: null,
    canvas: null,
    offsetX: 0,

    init: () => {
        const canvas = document.getElementById('stars-canvas');
        if (!canvas) return;

        Layer1.canvas = canvas;
        Layer1.ctx = canvas.getContext('2d');

        Layer1.canvas.width = window.innerWidth;
        Layer1.canvas.height = window.innerHeight;

        console.log("[System] Layer 1 (Stars) Engine Starting...");

        const totalStars = Math.floor((canvas.width * canvas.height) * (Layer1.config.density / 100));

        for (let i = 0; i < totalStars; i++) {
            Layer1.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                char: Layer1.config.chars[Math.floor(Math.random() * Layer1.config.chars.length)],
                opacity: Math.random() * 0.8 + 0.2
            });
        }

        Layer1.animate();
    },

    animate: () => {
        const { ctx, canvas, stars, config } = Layer1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = `${config.fontSize}px monospace`;

        stars.forEach(star => {
            star.x -= config.speed;

            if (star.x < -10) star.x = canvas.width + 10;

            ctx.globalAlpha = star.opacity;
            ctx.fillText(star.char, star.x, star.y);
        });

        requestAnimationFrame(Layer1.animate);
    },

    update: (hour) => {
        let opacity = 0;
        if (hour >= 18 || hour < 4) opacity = 1.0;
        else if (hour >= 17 && hour < 18) opacity = (hour - 17) * 0.3;
        else if (hour >= 4 && hour < 5) opacity = 1.0 - (hour - 4);

        if (Layer1.canvas) Layer1.canvas.style.opacity = opacity;
    }
};