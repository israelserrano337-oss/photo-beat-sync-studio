// js/effectsAndTransitions.js - Transiciones Limpias y Efectos de Rave Dinámicos
class EffectsAndTransitions {
    
    applyTransition(ctx, img1, img2, progress, type, w, h, vizInstance) {
        ctx.save();
        
        switch(type) {
            case 'Crossfade':
                vizInstance.drawImageCover(ctx, img1, w, h, 1);
                ctx.globalAlpha = Math.max(0, Math.min(1, progress));
                vizInstance.drawImageCover(ctx, img2, w, h, 1);
                break;
                
            case 'Zoom':
                vizInstance.drawImageCover(ctx, img1, w, h, 1);
                ctx.save();
                ctx.globalAlpha = Math.max(0, Math.min(1, progress));
                ctx.translate(w / 2, h / 2);
                const scale = 0.8 + (progress * 0.2);
                ctx.scale(scale, scale);
                ctx.translate(-w / 2, -h / 2);
                vizInstance.drawImageCover(ctx, img2, w, h, 1);
                ctx.restore();
                break;
                
            case 'Cut':
                if (progress < 0.5) {
                    vizInstance.drawImageCover(ctx, img1, w, h, 1);
                } else {
                    vizInstance.drawImageCover(ctx, img2, w, h, 1);
                }
                break;
                
            case 'FlashCut':
                if (progress < 0.8) {
                    vizInstance.drawImageCover(ctx, img1, w, h, 1);
                } else {
                    vizInstance.drawImageCover(ctx, img2, w, h, 1);
                    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - progress) * 5})`;
                    ctx.fillRect(0, 0, w, h);
                }
                break;
                
            default:
                // Previene cualquier error de slide lateral y usa crossfade limpio por defecto
                vizInstance.drawImageCover(ctx, img1, w, h, 1);
                ctx.globalAlpha = progress;
                vizInstance.drawImageCover(ctx, img2, w, h, 1);
        }
        
        ctx.restore();
    }

    applyBeatEffect(ctx, w, h, effectType, bassIntensity) {
        if (!effectType || effectType === 'None') return;

        ctx.save();
        
        switch(effectType) {
            case 'Beat Pulse':
                if (bassIntensity > 0.12) {
                    const scale = 1 + (bassIntensity * 0.1);
                    ctx.translate(w / 2, h / 2);
                    ctx.scale(scale, scale);
                    ctx.translate(-w / 2, -h / 2);
                }
                break;
                
            case 'Flash':
                if (bassIntensity > 0.3) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${bassIntensity * 0.5})`;
                    ctx.fillRect(0, 0, w, h);
                }
                break;
                
            case 'Shake':
                if (bassIntensity > 0.35) {
                    const intensityFactor = bassIntensity * 22;
                    const offsetX = (Math.random() - 0.5) * intensityFactor;
                    const offsetY = (Math.random() - 0.5) * intensityFactor;
                    ctx.translate(offsetX, offsetY);
                }
                break;
                
            case 'NeonGlowPulse':
                if (bassIntensity > 0.2) {
                    ctx.fillStyle = `rgba(0, 251, 255, ${bassIntensity * 0.35})`;
                    ctx.fillRect(0, 0, w, h);
                }
                break;
                
            case 'Strobe':
                if (bassIntensity > 0.45) {
                    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 0, 170, 0.45)';
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