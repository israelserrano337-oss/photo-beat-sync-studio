// js/visualizer.js - Professional 9:16 Canvas Audio Visualizer & Multi-Pass Rendering Engine
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
            neonAcid: { primary: '#00fbff', secondary: '#ff00aa', glow: '#00fbff', accent: '#38bdf8' },
            cyberGothic: { primary: '#9d00ff', secondary: '#ff0055', glow: '#ff0055', accent: '#c084fc' },
            laserGreen: { primary: '#00ff66', secondary: '#ccff00', glow: '#00ff66', accent: '#4ade80' }
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

        // Clear canvas with deep cinematic dark background
        this.ctx.fillStyle = '#030305';
        this.ctx.fillRect(0, 0, w, h);

        let bassIntensity = 0;
        let dataArray = null;

        if (analyser) {
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            // Isolate sub-bass frequencies for heavy club responsiveness
            const bassRangeCount = Math.floor(bufferLength * 0.3);
            let bassSum = 0;
            for (let i = 0; i < bassRangeCount; i++) {
                bassSum += dataArray[i];
            }
            bassIntensity = (bassSum / bassRangeCount) / 255.0;
        }

        // Render photo sequence with perfectly synchronized transition progress
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

        // Apply global audio reactive beat VFX
        if (window.effectsAndTransitions) {
            window.effectsAndTransitions.applyBeatEffect(this.ctx, w, h, settings.effect, bassIntensity);
        }

        // Render dual-layer high-end neon circular audio visualizer EQ
        if (dataArray) {
            this.drawCircularEQ(w, h, dataArray, settings, bassIntensity);
        }
    }

    drawCircularEQ(w, h, dataArray, settings, bassIntensity) {
        const cx = w / 2;
        const cy = h / 2;
        const baseRadius = settings.radius || 190;
        const radius = baseRadius * (1 + bassIntensity * 0.18); // Dynamic bass expansion
        const spikes = settings.spikes || 128;
        const colors = this.getCurrentPaletteColors();

        this.ctx.save();
        this.ctx.translate(cx, cy);

        // 1. Core Background Volumetric Glow (After Effects Glow Effect layer)
        const radialGrad = this.ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius * 1.5);
        radialGrad.addColorStop(0, colors.primary + '33');
        radialGrad.addColorStop(0.7, colors.secondary + '15');
        radialGrad.addColorStop(1, 'transparent');
        this.ctx.fillStyle = radialGrad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
        this.ctx.fill();

        // 2. Primary Neon Waveform Equalizer Ring
        this.ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const angle = (i * 2 * Math.PI) / spikes;
            const val = dataArray[i % dataArray.length] / 255.0;
            const r = radius + (val * 120 * (settings.intensity || 1.35));
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();

        this.ctx.strokeStyle = colors.primary;
        this.ctx.lineWidth = 3.5;
        this.ctx.shadowBlur = (settings.glow || 30) + (bassIntensity * 35);
        this.ctx.shadowColor = colors.glow;
        this.ctx.stroke();

        // 3. Secondary Counter-Phase Laser Ring for 3D Depth
        this.ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const angle = (i * 2 * Math.PI) / spikes;
            const val = dataArray[(i + 40) % dataArray.length] / 255.0;
            const r = (radius * 0.88) + (val * 60 * (settings.intensity || 1.35));
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = colors.secondary;
        this.ctx.lineWidth = 1.8;
        this.ctx.globalAlpha = 0.85;
        this.ctx.stroke();

        this.ctx.restore();
    }
}

window.visualizer = new Visualizer();