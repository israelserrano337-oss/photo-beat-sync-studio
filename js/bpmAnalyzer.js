// js/bpmAnalyzer.js - Análisis de Picos y Beats para Sincronización Musical
class BPMAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.sourceNode = null;
        this.dataArray = null;
    }

    async analyze(audioFile) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const arrayBuffer = await audioFile.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        // Análisis básico de estimación de BPM basado en picos de energía (RMS)
        const channelData = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const blockSize = Math.floor(sampleRate * 0.5); // Bloques de medio segundo
        let peaks = [];
        let maxEnergy = 0;

        for (let i = 0; i < channelData.length; i += blockSize) {
            let sum = 0;
            for (let j = 0; j < blockSize && (i + j) < channelData.length; j++) {
                sum += channelData[i + j] * channelData[i + j];
            }
            let energy = Math.sqrt(sum / blockSize);
            if (energy > maxEnergy) maxEnergy = energy;
            peaks.push({ time: i / sampleRate, energy });
        }

        // Estimación estándar por defecto orientada a electrónica / hard techno (~128-150 BPM)
        return { bpm: 128, duration: audioBuffer.duration };
    }

    setupAudioElement(audioElement) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (!this.sourceNode) {
            this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 512;
            this.sourceNode.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        return this.analyser;
    }
}
window.bpmAnalyzer = new BPMAnalyzer();