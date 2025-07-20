import { createSignal, onMount, onCleanup } from "solid-js";
import workerpool from 'workerpool';
import MainTab from "./components/MainTab";
import StatsTab from "./components/StatsTab";
import SettingsTab from "./components/SettingsTab";
import "./App.css";

/** @ts-ignore */
import WorkerURL from './workers/tts.worker.js?worker&url';

const ttsPool = workerpool.pool(WorkerURL, {
  maxWorkers: 2,
  workerOpts: {
    type: "module"
  }
});

const MAX_CHARS = 500;

async function getCacheSize() {
  const cacheItems = []
  const cacheNames = await caches.keys();
  let totalBytes = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const buffer = await response.clone().arrayBuffer();
        const sizeKB = buffer.byteLength / 1024;
        totalBytes += buffer.byteLength;
        cacheItems.push({
          url: request.url,
          size: sizeKB
        })
      }
    }
  }

  return {
    cacheItems,
    totalSizeInMB: (totalBytes / 1024 / 1024).toFixed(3)
  };
}

async function clearCache() {
  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    await caches.delete(name);
  }
}

function App() {
  const [inputText, setInputText] = createSignal("");
  const [audioUrl, setAudioUrl] = createSignal(null);
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [usedCacheSize, setUsedCacheSize] = createSignal(0);
  const [cacheItems, setCacheItems] = createSignal([]);
  const [activeTab, setActiveTab] = createSignal("main");
  const [generationCount, setGenerationCount] = createSignal(0);
  const [maxChars, setMaxChars] = createSignal(MAX_CHARS);
  const [autoPlay, setAutoPlay] = createSignal(true);
  
  onMount(async() => {
    await updateCacheStats();
    if (usedCacheSize() < 10) {
      const userConfirmed = confirm("Model is not downloaded. Do you want to download it now?");
      if (userConfirmed) {
        ttsPool.exec('initializeTTS', []);
      } else {
        window.close();
      }
    } else {
      ttsPool.exec('initializeTTS', []);
    }
  });

  onCleanup(() => {
    if (audioUrl()) {
      URL.revokeObjectURL(audioUrl());
    }
    if (ttsPool) {
      ttsPool.terminate();
    }
  });

  const updateCacheStats = async () => {
    const cacheSize = await getCacheSize();
    setUsedCacheSize(cacheSize.totalSizeInMB);
    setCacheItems(cacheSize.cacheItems);
  };

  const generate = async () => {
    const text = inputText().trim();
    if (!text || isGenerating() || text.length > maxChars()) return;
  
    setIsGenerating(true);
    setAudioUrl(null);
    try {
      const blob = await ttsPool.exec('generateAudio', [text]);
      
      if (!blob) {
        throw new Error("Worker returned undefined/null blob");
      }
      
      const url = URL.createObjectURL(blob);
  
      if (audioUrl()) {
        URL.revokeObjectURL(audioUrl());
        setAudioUrl(null);
      }
      setAudioUrl(url);
      setGenerationCount(prev => prev + 1);
      await updateCacheStats();
    } catch (error) {
      console.error("Generation failed:", error);
      if (error && typeof error === 'object') {
        console.error("Error details:", error.message, error.stack);
      } else {
        console.error("Error is not an object:", typeof error, error);
      }
      alert(`Failed to generate audio: ${error.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const clear = () => {
    setInputText("");
    if (audioUrl()) {
      URL.revokeObjectURL(audioUrl());
      setAudioUrl(null);
    }
  };

  const handleClearCache = async () => {
    if (confirm("Are you sure you want to clear all cached data? You'll need to re-download the model.")) {
      await clearCache();
      await updateCacheStats();
      alert("Cache cleared successfully!");
    }
  };

  return (
    <div class="app">
      <div class="container">
        <div class="tabs">
          <div class="tab-nav">
            <button 
              class={`tab-btn ${activeTab() === "main" ? "active" : ""}`}
              onClick={() => setActiveTab("main")}
            >
              Text to Speech
            </button>
            <button 
              class={`tab-btn ${activeTab() === "stats" ? "active" : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              Stats
            </button>
            <button 
              class={`tab-btn ${activeTab() === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              Settings
            </button>
          </div>

          <div class="tab-content">
            {activeTab() === "main" && (
              <MainTab 
                inputText={inputText}
                setInputText={setInputText}
                maxChars={maxChars}
                generate={generate}
                isGenerating={isGenerating}
                clear={clear}
                audioUrl={audioUrl}
                autoPlay={autoPlay}
              />
            )}
            {activeTab() === "stats" && (
              <StatsTab 
                usedCacheSize={usedCacheSize}
                cacheItems={cacheItems}
                handleClearCache={handleClearCache}
              />
            )}
            {activeTab() === "settings" && (
              <SettingsTab 
                maxChars={maxChars}
                setMaxChars={setMaxChars}
                autoPlay={autoPlay}
                setAutoPlay={setAutoPlay}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
