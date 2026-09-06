// js/visualizer.js - Renderizado Gráfico 9:16 con Ecualizador Circular Estilo Festival y Partículas/Brillos de Neón
class Visualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    init() {
        this.canvas = document.getElementById('visualizer');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    }

    getCurrentPaletteColors() {
        const paletteSelect = document.getElementById('colorPalette');
        const val = paletteSelect ? paletteSelect.value : 'neonAcid';
        
        const palettes = {
            neonAcid: { primary: '#00fbff', secondary: '#ff00aa', shadow: '#ff00aa' },
            cyberGothic: { primary: '#9d00ff', secondary: '#ff0055', shadow: '#ff0055' },
            laserGreen: { primary: '#00ff66', secondary: '#ccff00', shadow: '#ccff00' }
        };
        
        return palettes[val] || palettes.neonAcid;
    }

    drawImageCover(ctx, img, w, h, scaleMultiplier = 1) {
        if (!img) return;
        const imgRatio = img.width / img.height;
        const canvasRatio = w / h;
        let drawW, drawH, offsetX, offsetY;

        if (imgRatio > canvasRatio) {
            drawH = h * scaleMultiplier;
            drawW = drawH * imgRatio;
        } else {
            drawW = w * scaleMultiplier;
            drawH = drawW / imgRatio;
        }
        offsetX = (w - drawW) / 2;
        offsetY = (h - drawH) / 2;

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    }

    renderFrame(analyser, photos, progress, settings) {
        if (!this.ctx || !this.canvas) return;
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.fillStyle = '#050509';
        this.ctx.fillRect(0, 0, w, h);

        let bassIntensity = 0;
        let dataArray = null;

        if (analyser) {
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            const bassRangeCount = Math.floor(bufferLength * 0.25);
            let bassSum = 0;
            for (let i = 0; i < bassRangeCount; i++) {
                bassSum += dataArray[i];
            }
            bassIntensity = (bassSum / bassRangeCount) / 255.0;
        }

        // Renderizado de Fotografías base con Transición fluida sincronizada
        if (photos.length > 0) {
            const total = photos.length;
            const scaledProgress = progress;
            const currentIndex = Math.floor(scaledProgress) % total;
            const nextIndex = (currentIndex + 1) % total;
            const transitionProgress = scaledProgress - Math.floor(scaledProgress);

            const img1 = photos[currentIndex].img;
            const img2 = photos[nextIndex].img;

            if (img1 && window.effectsAndTransitions) {
                window.effectsAndTransitions.applyTransition(
                    this.ctx, img1, img2, transitionProgress, 
                    settings.transition || 'Crossfade', w, h, this
                );
            }
        }

        if (window.effectsAndTransitions) {
            window.effectsAndTransitions.applyBeatEffect(this.ctx, w, h, settings.effect, bassIntensity);
        }

        if (dataArray) {
            this.drawCircularEQ(w, h, dataArray, settings, bassIntensity);
        }
    }

    drawCircularEQ(w, h, dataArray, settings, bassIntensity) {
        const cx = w / 2;
        const cy = h / 2;
        const radius = (settings.radius || 190) * (1 + bassIntensity * 0.15); // El radio pulsa con el bajo
        const spikes = settings.spikes || 96;
        const colors = this.getCurrentPaletteColors();

        this.ctx.save();
        this.ctx.translate(cx, cy);

        // Capa de Relleno Translúcido Neon Interior
        this.ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const angle = (i * 2 * Math.PI) / spikes;
            const val = dataArray[i % dataArray.length] / 255.0;
            const r = radius + (val * 80 * (settings.intensity || 1.45));
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        
        this.ctx.fillStyle = colors.primary + '15'; // Relleno muy suave transparente
        this.ctx.fill();

        // Línea de Contorno Principal con Brillo Intenso
        this.ctx.strokeStyle = colors.primary;
        this.ctx.lineWidth = 3.5;
        this.ctx.shadowBlur = (settings.glow || 30) + (bassIntensity * 20);
        this.ctx.shadowColor = colors.shadow;
        this.ctx.stroke();

        // Anillo interior secundario con ondas en contrafase para dar profundidad 3D
        this.ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const angle = (i * 2 * Math.PI) / spikes;
            const val = dataArray[(i + 15) % dataArray.length] / 255.0;
            const r = (radius * 0.85) + (val * 40 * (settings.intensity || 1.45));
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = colors.secondary;
        this.ctx.lineWidth = 1.5;
        this.ctx.globalAlpha = 0.7;
        this.ctx.stroke();

        this.ctx.restore();
    }
}

window.visualizer = new Visualizer();