// js/effectsAndTransitions.js - Transiciones y Efectos Sincronizados al Ritmo Hard Techno
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
                const scale = 1 + (progress * 0.2);
                ctx.scale(scale, scale);
                ctx.translate(-w / 2, -h / 2);
                vizInstance.drawImageCover(ctx, img2, w, h, 1);
                ctx.restore();
                break;
                
            case 'Slide':
                vizInstance.drawImageCover(ctx, img1, w, h, 1);
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, w, h);
                ctx.clip();
                const slideX = (1 - progress) * w;
                ctx.translate(slideX, 0);
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
                
            case 'BlurFade':
                vizInstance.drawImageCover(ctx, img1, w, h, 1);
                ctx.globalAlpha = Math.max(0, Math.min(1, progress * 0.9));
                vizInstance.drawImageCover(ctx, img2, w, h, 1);
                break;
                
            case 'FlashCut':
                if (progress < 0.85) {
                    vizInstance.drawImageCover(ctx, img1, w, h, 1);
                } else {
                    vizInstance.drawImageCover(ctx, img2, w, h, 1);
                    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - progress) * 6})`;
                    ctx.fillRect(0, 0, w, h);
                }
                break;
                
            default:
                vizInstance.drawImageCover(ctx, img1, w, h, 1);
                ctx.globalAlpha = progress;
                vizInstance.drawImageCover(ctx, img2, w, h, 1);
        }
        
        ctx.restore();
    }

    applyBeatEffect(ctx, w, h, effectType, bassIntensity) {
        if (!effectType || effectType === 'None') return;

        ctx.save();
        
        // bassIntensity viene normalizado de 0 a 1 enfocado en los graves (kicks)
        switch(effectType) {
            case 'Beat Pulse':
                if (bassIntensity > 0.15) {
                    const scale = 1 + (bassIntensity * 0.12);
                    ctx.translate(w / 2, h / 2);
                    ctx.scale(scale, scale);
                    ctx.translate(-w / 2, -h / 2);
                }
                break;
                
            case 'Flash':
                if (bassIntensity > 0.35) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${bassIntensity * 0.55})`;
                    ctx.fillRect(0, 0, w, h);
                }
                break;
                
            case 'Shake':
                if (bassIntensity > 0.4) {
                    const intensityFactor = bassIntensity * 25;
                    const offsetX = (Math.random() - 0.5) * intensityFactor;
                    const offsetY = (Math.random() - 0.5) * intensityFactor;
                    ctx.translate(offsetX, offsetY);
                }
                break;
                
            case 'NeonGlowPulse':
                if (bassIntensity > 0.25) {
                    ctx.fillStyle = `rgba(0, 251, 255, ${bassIntensity * 0.4})`;
                    ctx.fillRect(0, 0, w, h);
                }
                break;
                
            case 'Strobe':
                if (bassIntensity > 0.5) {
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