// js/photoManager.js - Gestión y Carga de Fotografías (Hasta 120)
class PhotoManager {
    constructor() {
        this.photos = [];
        this.maxPhotos = 120;
    }

    async addFiles(fileList) {
        const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
        for (const file of validFiles) {
            if (this.photos.length >= this.maxPhotos) break;
            const url = URL.createObjectURL(file);
            const img = await this.loadImage(url);
            this.photos.push({ file, url, img });
        }
        this.updateUI();
    }

    loadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = url;
        });
    }

    clear() {
        this.photos = [];
        this.updateUI();
    }

    updateUI() {
        const countSpan = document.getElementById('photoCount');
        const container = document.getElementById('thumbnailContainer');
        if (countSpan) countSpan.textContent = this.photos.length;
        if (container) {
            container.innerHTML = '';
            this.photos.forEach((p, idx) => {
                const thumb = document.createElement('div');
                thumb.style.cssText = 'width: 45px; height: 45px; border-radius: 4px; overflow: hidden; flex-shrink: 0; border: 1px solid #2e2e42;';
                thumb.innerHTML = `<img src="${p.url}" style="width:100%; height:100%; object-fit:cover;">`;
                container.appendChild(thumb);
            });
        }
    }
}
window.photoManager = new PhotoManager();