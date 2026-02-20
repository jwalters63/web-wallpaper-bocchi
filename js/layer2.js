const Layer2 = {
    config: {
        dayOpacity: 0.7, nightOpacity: 0.2, transitionOpacity: 0.4,
        textureSize: { w: 1024, h: 512 },

        mid: { id: 'cloud-back', threshold: 0.58, scaleX: 2.2, scaleY: 4.5, seed: 0 },
        far: { id: 'cloud-far', threshold: 0.60, scaleX: 2.8, scaleY: 5.6, seed: 123.45 },

        giant: {
            id: 'cloud-giant',
            threshold: 0.45,
            scaleX: 3.5,
            scaleY: 1.2,
            seed: 888.88,
            isFogBank: true
        }
    },

    init: () => {
        Noise.seed(Math.random());
        Layer2.bake(Layer2.config.mid);
        Layer2.bake(Layer2.config.far);
        Layer2.bake(Layer2.config.giant);
    },

    bake: (layer) => {
        const {w, h} = Layer2.config.textureSize;
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        const img = ctx.createImageData(w, h);
        const data = img.data;

        const TWO_PI = Math.PI * 2;

        for (let y = 0; y < h; y++) {
            const ny = y / h;

            let vWeight = layer.isFogBank ? 1.0 : (ny > 0.55 ? Math.max(0, 1.0 - ((ny - 0.55) / 0.4)) : 1.0);

            for (let x = 0; x < w; x++) {
                const angle = (x / w) * TWO_PI;
                const nx = Math.cos(angle), nz = Math.sin(angle);

                let n = 0, sX = layer.scaleX, sY = layer.scaleY, amp = 1.0, tAmp = 0;

                for (let o = 0; o < 5; o++) {
                    n += ((Noise.perlin3(nx * sX, ny * sY, (nz + layer.seed) * sX) + 1) * 0.5) * amp;
                    tAmp += amp;
                    sX *= 2; sY *= 2; amp *= 0.5;
                }

                let val = (n / tAmp);

                if (layer.isFogBank) {
                    val = val + (ny - 0.25) * 3.0;
                } else {
                    val = val * vWeight;
                }

                let alpha = 0;
                if (val > layer.threshold + 0.01) alpha = 255;
                else if (val > layer.threshold - 0.01) alpha = Math.floor(((val - (layer.threshold - 0.01)) / 0.02) * 255);

                const i = (y * w + x) * 4;
                data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = alpha;
            }
        }
        ctx.putImageData(img, 0, 0);
        const el = document.getElementById(layer.id);
        if (el) el.style.backgroundImage = `url(${canvas.toDataURL()})`;
    },

    update: (hour) => {
        let op = Layer2.config.dayOpacity;
        if (hour >= 19 || hour < 5) op = Layer2.config.nightOpacity;
        else if ((hour >= 17 && hour < 19) || (hour >= 5 && hour < 7)) op = Layer2.config.transitionOpacity;

        const mid = document.getElementById(Layer2.config.mid.id);
        const far = document.getElementById(Layer2.config.far.id);
        const giant = document.getElementById('cloud-giant');

        if (mid) mid.style.opacity = op;
        if (far) far.style.opacity = op * 0.55;
        if (giant) giant.style.opacity = op * 0.8;
    }
};

const Noise={p:new Uint8Array(512),seed:function(s){const perm=Array.from({length:256},(_,i)=>i).sort(()=>Math.random()-0.5);for(let i=0;i<512;i++)this.p[i]=perm[i&255];},fade:t=>t*t*t*(t*(t*6-15)+10),lerp:(t,a,b)=>a+t*(b-a),grad:(h,x,y,z)=>{const i=h&15;const u=i<8?x:y,v=i<4?y:i==12||i==14?x:z;return((i&1)==0?u:-u)+((i&2)==0?v:-v);},perlin3:function(x,y,z){const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=this.fade(x),v=this.fade(y),w=this.fade(z);const A=this.p[X]+Y,AA=this.p[A]+Z,AB=this.p[A+1]+Z,B=this.p[X+1]+Y,BA=this.p[B]+Z,BB=this.p[B+1]+Z;return this.lerp(w,this.lerp(v,this.lerp(u,this.grad(this.p[AA],x,y,z),this.grad(this.p[BA],x-1,y,z)),this.lerp(u,this.grad(this.p[AB],x,y-1,z),this.grad(this.p[BB],x-1,y-1,z))),this.lerp(v,this.lerp(u,this.grad(this.p[AA+1],x,y,z-1),this.grad(this.p[BA+1],x-1,y,z-1)),this.lerp(u,this.grad(this.p[AB+1],x,y-1,z-1),this.grad(this.p[BB+1],x-1,y-1,z-1))));}};