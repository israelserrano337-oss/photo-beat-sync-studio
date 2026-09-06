// js/visualizer.js - Renderizado Gráfico 9:16 y Análisis de Bajos para Sincronización Extrema
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
            neonAcid: { primary: '#00fbff', shadow: '#ff00aa' },
            cyberGothic: { primary: '#9d00ff', shadow: '#ff0055' },
            laserGreen: { primary: '#00ff66', shadow: '#ccff00' }
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

        // Análisis de Audio optimizado para aislar los bajos (Kicks de Hard Techno)
        if (analyser) {
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            // Tomamos las primeras posiciones del array (bajos / frecuencias graves donde golpea el bombo)
            const bassRangeCount = Math.floor(bufferLength * 0.2); 
            let bassSum = 0;
            for (let i = 0; i < bassRangeCount; i++) {
                bassSum += dataArray[i];
            }
            bassIntensity = (bassSum / bassRangeCount) / 255.0;
        }

        // Renderizado de Fotografías base con Transición
        if (photos.length > 0) {
            const total = photos.length;
            const scaledProgress = progress * total;
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

        // Aplicar efectos visuales gobernados por la intensidad de los bajos
        if (window.effectsAndTransitions) {
            window.effectsAndTransitions.applyBeatEffect(this.ctx, w, h, settings.effect, bassIntensity);
        }

        // Dibujar el ecualizador circular con los datos reales
        if (dataArray) {
            this.drawCircularEQ(w, h, dataArray, settings, bassIntensity);
        }
    }

    drawCircularEQ(w, h, dataArray, settings, bassIntensity) {
        const cx = w / 2;
        const cy = h / 2;
        const radius = settings.radius || 190;
        const spikes = settings.spikes || 112;
        const colors = this.getCurrentPaletteColors();

        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.strokeStyle = colors.primary;
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = settings.glow || 25;
        this.ctx.shadowColor = colors.shadow;

        this.ctx.beginPath();
        for (let i = 0; i < spikes; i++) {
            const angle = (i * 2 * Math.PI) / spikes;
            const val = dataArray[i % dataArray.length] / 255.0;
            const r = radius + (val * 90 * (settings.intensity || 1.45));
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    }
}

window.visualizer = new Visualizer();