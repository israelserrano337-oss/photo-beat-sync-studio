// js/app.js - Controlador Principal de la Aplicación y Sincronización de Animación
document.addEventListener('DOMContentLoaded', () => {
    window.visualizer.init();

    const audioEl = document.getElementById('audio');
    const audioInput = document.getElementById('audioFile');
    const photoInput = document.getElementById('photoFiles');
    const dropZone = document.getElementById('dropZone');
    const previewBtn = document.getElementById('previewBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const recordBtn = document.getElementById('recordBtn');
    const reloadBtn = document.getElementById('reloadBtn');
    const statusBadge = document.getElementById('status');
    const canvas = document.getElementById('visualizer');

    let analyser = null;
    let isPlaying = false;
    let isRecording = false;
    let startTimeAnimation = 0;
    let mediaRecorder = null;
    let recordedChunks = [];
    let selectedMimeType = '';
    let recordStartTime = 0;
    let targetDuration = 30;
    let currentBpm = 128;

    dropZone.addEventListener('click', () => photoInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = '#6366f1'; });
    dropZone.addEventListener('dragleave', () => dropZone.style.borderColor = '#2e2e42');
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        window.photoManager.addFiles(e.dataTransfer.files);
        statusBadge.textContent = `Fotos cargadas: ${window.photoManager.photos.length}`;
    });

    photoInput.addEventListener('change', (e) => {
        window.photoManager.addFiles(e.target.files);
        statusBadge.textContent = `Fotos cargadas: ${window.photoManager.photos.length}`;
    });

    audioInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            audioEl.src = url;
            analyser = window.bpmAnalyzer.setupAudioElement(audioEl);
            const analysis = await window.bpmAnalyzer.analyze(file);
            currentBpm = analysis.bpm || 128;
            document.getElementById('bpmInput').value = currentBpm;
            statusBadge.textContent = `Música lista • BPM: ${currentBpm}`;
        }
    });

    previewBtn.addEventListener('click', async () => {
        if (window.photoManager.photos.length === 0 || !audioEl.src) {
            statusBadge.textContent = '⚠️ Carga al menos una foto y audio primero';
            return;
        }

        if (window.bpmAnalyzer && window.bpmAnalyzer.audioContext) {
            if (window.bpmAnalyzer.audioContext.state === 'suspended') {
                await window.bpmAnalyzer.audioContext.resume();
            }
        }

        audioEl.currentTime = parseFloat(document.getElementById('startTime').value) || 0;
        
        try {
            await audioEl.play();
            isPlaying = true;
            isRecording = false;
            startTimeAnimation = performance.now();
            requestAnimationFrame(loopAnimation);
            statusBadge.textContent = '▶ Reproduciendo previsualización...';
        } catch (err) {
            statusBadge.textContent = '⚠️ Error al reproducir audio';
        }
    });

    pauseBtn.addEventListener('click', () => {
        audioEl.pause();
        isPlaying = false;
        if(isRecording) stopRecording();
        statusBadge.textContent = '⏸ Pausado';
    });

    reloadBtn.addEventListener('click', () => {
        window.location.reload();
    });

    recordBtn.addEventListener('click', async () => {
        if (window.photoManager.photos.length === 0 || !audioEl.src) {
            statusBadge.textContent = '⚠️ Carga fotos y audio para exportar';
            return;
        }

        if(isRecording) {
            stopRecording();
            return;
        }

        if (window.bpmAnalyzer && window.bpmAnalyzer.audioContext) {
            if (window.bpmAnalyzer.audioContext.state === 'suspended') {
                await window.bpmAnalyzer.audioContext.resume();
            }
        }

        recordedChunks = [];
        const fps = parseInt(document.getElementById('exportFpsSelector').value) || 60;
        const durStr = document.getElementById('durationSelect').value;
        targetDuration = durStr === 'manual' ? 'manual' : parseInt(durStr);

        const canvasStream = canvas.captureStream(fps);
        let audioStream;
        try {
            if (audioEl.captureStream) {
                audioStream = audioEl.captureStream();
            } else if (audioEl.mozCaptureStream) {
                audioStream = audioEl.mozCaptureStream();
            } else {
                const dest = window.bpmAnalyzer.audioContext.createMediaStreamDestination();
                if (window.bpmAnalyzer.sourceNode) {
                    window.bpmAnalyzer.sourceNode.connect(dest);
                }
                audioStream = dest.stream;
            }
        } catch (e) {
            audioStream = new MediaStream();
        }
        
        const audioTracks = audioStream ? audioStream.getAudioTracks() : [];
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...(audioTracks.length > 0 ? audioTracks : [])
        ]);

        let mimeTypes = [
            'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
            'video/mp4;codecs=h264,aac',
            'video/mp4',
            'video/webm;codecs=vp9,opus',
            'video/webm'
        ];

        for (let mt of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mt)) {
                selectedMimeType = mt;
                break;
            }
        }

        try {
            mediaRecorder = new MediaRecorder(combinedStream, { mimeType: selectedMimeType, videoBitsPerSecond: 8000000 });
        } catch (e) {
            selectedMimeType = 'video/webm';
            mediaRecorder = new MediaRecorder(combinedStream, { videoBitsPerSecond: 8000000 });
        }

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = handleExportFinalization;

        audioEl.currentTime = parseFloat(document.getElementById('startTime').value) || 0;
        
        try {
            await audioEl.play();
            mediaRecorder.start(1000);
            isPlaying = true;
            isRecording = true;
            recordStartTime = Date.now();
            startTimeAnimation = performance.now();

            recordBtn.textContent = '⏹ DETENER GRABACIÓN';
            recordBtn.style.background = '#000';
            document.getElementById('rec-indicator').style.display = 'flex';
            
            const isMp4 = selectedMimeType.includes('mp4');
            statusBadge.textContent = `● Grabando por hardware a ${fps} FPS (${isMp4 ? 'MP4' : 'WebM'})...`;
            requestAnimationFrame(loopAnimation);
        } catch (err) {
            statusBadge.textContent = '⚠️ Error al iniciar la grabación';
        }
    });

    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        audioEl.pause();
        isPlaying = false;
        isRecording = false;
        recordBtn.textContent = '● GRABAR / EXPORTAR';
        recordBtn.style.background = '';
        document.getElementById('rec-indicator').style.display = 'none';
        statusBadge.textContent = '✔ Grabación detenida';
    }

    async function handleExportFinalization() {
        const overlay = document.getElementById('overlay-screen');
        const overlayText = document.getElementById('overlay-text');
        overlay.style.display = 'flex';
        
        const isMp4 = selectedMimeType.includes('mp4');
        overlayText.textContent = isMp4 ? 'GUARDANDO VÍDEO MP4...' : 'GUARDANDO VÍDEO WEBM...';

        setTimeout(() => {
            const blob = new Blob(recordedChunks, { type: selectedMimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            const ext = isMp4 ? 'mp4' : 'webm';
            a.download = `Master_Export_${Date.now()}.${ext}`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 100);

            overlay.style.display = 'none';
            statusBadge.textContent = `✔ Archivo ${ext.toUpperCase()} guardado con éxito!`;
        }, 1000);
    }

    function loopAnimation() {
        if (!isPlaying && !isRecording) return;
        
        const durationSec = targetDuration === 'manual' ? 999999 : (parseInt(document.getElementById('durationSelect').value) || 30);
        const elapsed = (performance.now() - startTimeAnimation) / 1000;
        
        // Sincronización de cambio de fotos basada en el BPM (cada 2 beats se cambia de foto con transición fluida)
        const secondsPerBeat = 60 / currentBpm;
        const beatDuration = secondsPerBeat * 2; 
        const totalPhotos = window.photoManager.photos.length || 1;
        
        const photoProgress = (elapsed / beatDuration) % totalPhotos;

        const settings = {
            intensity: parseFloat(document.getElementById('intensity').value),
            spikes: parseInt(document.getElementById('spikes').value),
            radius: parseInt(document.getElementById('radius').value),
            glow: parseInt(document.getElementById('glow').value),
            effect: document.getElementById('effectSelect').value,
            transition: document.getElementById('transitionSelect').value
        };

        window.visualizer.renderFrame(analyser, window.photoManager.photos, photoProgress, settings);

        if (isRecording && targetDuration !== 'manual') {
            const recElapsed = (Date.now() - recordStartTime) / 1000;
            const mins = String(Math.floor(recElapsed / 60)).padStart(2, '0');
            const secs = String(Math.floor(recElapsed % 60)).padStart(2, '0');
            document.getElementById('rec-time').textContent = `REC ${mins}:${secs}`;
            
            if (recElapsed >= targetDuration) {
                stopRecording();
                return;
            }
        } else if (isRecording) {
            const recElapsed = (Date.now() - recordStartTime) / 1000;
            const mins = String(Math.floor(recElapsed / 60)).padStart(2, '0');
            const secs = String(Math.floor(recElapsed % 60)).padStart(2, '0');
            document.getElementById('rec-time').textContent = `REC ${mins}:${secs}`;
        }

        if (!audioEl.ended && isPlaying) {
            requestAnimationFrame(loopAnimation);
        } else if (audioEl.ended && isRecording) {
            stopRecording();
        }
    }

    ['intensity', 'spikes', 'radius', 'glow'].forEach(id => {
        const el = document.getElementById(id);
        const valEl = document.getElementById(id + 'Val');
        if (el && valEl) {
            el.addEventListener('input', () => valEl.textContent = el.value);
        }
    });
});