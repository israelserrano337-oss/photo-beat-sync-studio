// js/visualizer.js - Renderizado Gráfico 9:16 con Ecualizador Circular Estilo Láser Neón de Alta Gama
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
            neonAcid: { primary: '#00fbff', secondary: '#ff00aa', glow: '#00fbff' },
            cyberGothic: { primary: '#9d00ff', secondary: '#ff0055', glow: '#ff0055' },
            laserGreen: { primary: '#00ff66', secondary: '#ccff00', glow: '#00ff66' }
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

            const bassRangeCount = Math.floor(bufferLength * 0.3);
            let bassSum = 0;
            for (let i = 0; i < bassRangeCount; i++) {
                bassSum += dataArray[i];
            }
            bassIntensity = (bassSum / bassRangeCount) / 255.0;
        }

        // Renderizado de Fotografías con Transición Segura y Limpia
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
        const baseRadius = settings.radius || 180;
        const radius = baseRadius * (1 + bassIntensity * 0.2); // Pulso dinámico con los bajos
        const spikes = settings.spikes || 128;
        const colors = this.getCurrentPaletteColors();

        this.ctx.save();
        this.ctx.translate(cx, cy);

        // Halo de luz central de fondo con alta intensidad en los graves
        const gradient = this.ctx.createRadialGradient(0, 0, radius * 0.2, 0, 0, radius * 1.4);
        gradient.addColorStop(0, colors.primary + '30');
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 1.4, 0, Math.PI * 2);
        this.ctx.fill();

        // Anillo Neón Principal (Ecualizador Circular Simétrico)
        this.ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const angle = (i * 2 * Math.PI) / spikes;
            const val = dataArray[i % dataArray.length] / 255.0;
            const r = radius + (val * 110 * (settings.intensity || 1.3));
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();

        this.ctx.strokeStyle = colors.primary;
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = (settings.glow || 25) + (bassIntensity * 30);
        this.ctx.shadowColor = colors.glow;
        this.ctx.stroke();

        // Anillo Secundario en Contrafase para Efecto Láser Pro
        this.ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const angle = (i * 2 * Math.PI) / spikes;
            const val = dataArray[(i + 32) % dataArray.length] / 255.0;
            const r = (radius * 0.9) + (val * 50 * (settings.intensity || 1.3));
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = colors.secondary;
        this.ctx.lineWidth = 1.5;
        this.ctx.globalAlpha = 0.8;
        this.ctx.stroke();

        this.ctx.restore();
    }
}

window.visualizer = new Visualizer();