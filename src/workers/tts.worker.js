import workerpool from 'workerpool';

let ttsInstance = null;
const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

async function initializeTTS() {
    try {
        if (!ttsInstance) {
            // Import kokoro-js in the worker context
            const { KokoroTTS } = await import("kokoro-js");
            
            ttsInstance = await KokoroTTS.from_pretrained(MODEL_ID, {
                dtype: "q8",
                device: "wasm",
                progress_callback: (event) => {
                    // Progress callback without logging
                }   
            });
        }
        return ttsInstance;
    } catch (error) {
        console.error('[Worker] Error initializing TTS:', error);
        // Re-throw with more context
        throw new Error(`Failed to initialize TTS: ${error.message}`);
    }
}

async function generateAudio(text) {
    try {
        const tts = await initializeTTS();
        
        if (!tts) {
            throw new Error('TTS instance is null after initialization');
        }
        
        const audio = await tts.generate(text);
        
        if (!audio) {
            throw new Error('Audio generation returned null');
        }
        
        const blob = audio.toBlob();
        
        if (!blob) {
            throw new Error('Audio.toBlob() returned null');
        }
        
        return blob;
    } catch (error) {
        console.error('[Worker] Error generating audio:', error);
        // Re-throw with more context
        throw new Error(`Failed to generate audio: ${error.message}`);
    }
}

// Expose functions to workerpool
workerpool.worker({
    generateAudio,
    initializeTTS
}); 