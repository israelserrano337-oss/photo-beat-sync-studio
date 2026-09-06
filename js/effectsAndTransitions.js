// js/effectsAndTransitions.js - Production Grade Motion Design Engine with Multi-Transition Support
class EffectsAndTransitions {
    constructor() {
        this.transitionCache = {};
    }

    // Apply high-end professional transitions between photo frames based on user selection
    applyTransition(ctx, img1, img2, progress, type, w, h, vizInstance) {
        ctx.save();
        
        const clampedProgress = Math.max(0, Math.min(1, progress));
        const activeType = type || 'Crossfade';

        switch(activeType) {
            case 'Crossfade':
                vizInstance.drawImageCover(ctx, img1, w, h, 1);
                ctx.globalAlpha = clampedProgress;
                vizInstance.drawImageCover(ctx, img2, w, h, 1);
                break;
                
            case 'Zoom':
                vizInstance.drawImageCover(ctx, img1, w, h, 1 + (clampedProgress * 0.12));
                ctx.globalAlpha = clampedProgress;
                ctx.save();
                ctx.translate(w / 2, h / 2);
                const scale = 0.85 + (clampedProgress * 0.15);
                ctx.scale(scale, scale);
                ctx.translate(-w / 2, -h / 2);
                vizInstance.drawImageCover(ctx, img2, w, h, 1);
                ctx.restore();
                break;
                
            case 'Cut':
                if (clampedProgress < 0.5) {
                    vizInstance.drawImageCover(ctx, img1, w, h, 1);
                } else {
                    vizInstance.drawImageCover(ctx, img2, w, h, 1);
                }
                break;
                
            case 'FlashCut':
                if (clampedProgress < 0.82) {
                    vizInstance.drawImageCover(ctx, img1, w, h, 1);
                } else {
                    vizInstance.drawImageCover(ctx, img2, w, h, 1);
                    const flashAlpha = Math.sin((clampedProgress - 0.82) / 0.18 * Math.PI);
                    ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.9})`;
                    ctx.fillRect(0, 0, w, h);
                }
                break;

            case 'ChromaticGlitch':
                if (clampedProgress < 0.5) {
                    vizInstance.drawImageCover(ctx, img1, w, h, 1);
                } else {
                    vizInstance.drawImageCover(ctx, img2, w, h, 1);
                    if (clampedProgress > 0.78) {
                        ctx.fillStyle = 'rgba(0, 251, 255, 0.25)';
                        ctx.fillRect(-18, 0, w, h);
                        ctx.fillStyle = 'rgba(255, 0, 170, 0.25)';
                        ctx.fillRect(18, 0, w, h);
                    }
                }
                break;
                
            default:
                vizInstance.drawImageCover(ctx, img1, w, h, 1);
                ctx.globalAlpha = clampedProgress;
                vizInstance.drawImageCover(ctx, img2, w, h, 1);
                break;
        }
        
        ctx.restore();
    }

    // Apply intense audio-reactive VFX layers
    applyBeatEffect(ctx, w, h, effectType, bassIntensity) {
        if (!effectType || effectType === 'None') return;

        ctx.save();
        
        switch(effectType) {
            case 'Beat Pulse':
                if (bassIntensity > 0.1) {
                    const scale = 1 + (bassIntensity * 0.12);
                    ctx.translate(w / 2, h / 2);
                    ctx.scale(scale, scale);
                    ctx.translate(-w / 2, -h / 2);
                }
                break;
                
            case 'Flash':
                if (bassIntensity > 0.25) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${bassIntensity * 0.45})`;
                    ctx.fillRect(0, 0, w, h);
                }
                break;
                
            case 'Shake':
                if (bassIntensity > 0.3) {
                    const intensityFactor = bassIntensity * 28;
                    const offsetX = (Math.random() - 0.5) * intensityFactor;
                    const offsetY = (Math.random() - 0.5) * intensityFactor;
                    ctx.translate(offsetX, offsetY);
                }
                break;
                
            case 'NeonGlowPulse':
                if (bassIntensity > 0.18) {
                    const gradient = ctx.createRadialGradient(w/2, h/2, w*0.1, w/2, h/2, w*0.8);
                    gradient.addColorStop(0, `rgba(0, 251, 255, ${bassIntensity * 0.35})`);
                    gradient.addColorStop(1, 'transparent');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, w, h);
                }
                break;
                
            case 'Strobe':
                if (bassIntensity > 0.4) {
                    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 0, 170, 0.5)';
                    ctx.fillRect(0, 0, w, h);
                }
                break;
                
            default:
                break;
        }
        
        ctx.restore();
    }
}

window.effectsAndTransitions = new EffectsAndTransitions();