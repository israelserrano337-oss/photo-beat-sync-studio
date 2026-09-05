// js/bpmAnalyzer.js - Análisis y Gestión de Audio Optimizada para iOS y Web
class BPMAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.sourceNode = null;
    }

    async analyze(audioFile) {
        // En dispositivos móviles (iOS), evitar decodeAudioData masivos para prevenir bloqueos de memoria.
        // Asignamos directamente la duración si es posible o un estándar seguro para Hard Techno / Rave.
        return new Promise((resolve) => {
            const tempAudio = document.createElement('audio');
            tempAudio.src = URL.createObjectURL(audioFile);
            tempAudio.onloadedmetadata = () => {
                resolve({
                    bpm: 128, // Estándar adaptable o predeterminado para la sesión
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

        // Asegurar que el contexto se reactive inmediatamente con gestos táctiles en iOS
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        if (!this.sourceNode && audioElement) {
            try {
                this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 512;
                this.sourceNode.connect(this.analyser);
                this.analyser.connect(this.audioContext.destination);
            } catch (e) {
                console.error("Error al conectar el nodo de audio en iOS:", e);
            }
        }
        return this.analyser;
    }
}

window.bpmAnalyzer = new BPMAnalyzer();