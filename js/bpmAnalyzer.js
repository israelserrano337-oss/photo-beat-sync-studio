// js/bpmAnalyzer.js - Análisis de Audio y Extracción de Frecuencias para Sincronización
class BPMAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.sourceNode = null;
    }

    async analyze(audioFile) {
        return new Promise((resolve) => {
            const tempAudio = document.createElement('audio');
            tempAudio.src = URL.createObjectURL(audioFile);
            tempAudio.onloadedmetadata = () => {
                resolve({
                    bpm: 128, // Estándar optimizado para Hard Techno / Rave
                    duration: tempAudio.duration || 60
                });
            };
            tempAudio.onerror = () => {
                resolve({ bpm: 128, duration: 60 });
            };
        });
    }

    setupAudioElement(audioElement) {
        if (!this.audioContext) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContextClass();
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        if (!this.sourceNode && audioElement) {
            try {
                this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 512;
                this.analyser.smoothingTimeConstant = 0.8;
                this.sourceNode.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            } catch (e) {
                console.error("Error al configurar el nodo de audio:", e);
            }
        }
        return this.analyser;
    }
}

window.bpmAnalyzer = new BPMAnalyzer();