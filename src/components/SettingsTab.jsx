const MAX_CHARS = 500;

function SettingsTab({ 
  maxChars, 
  setMaxChars, 
  autoPlay, 
  setAutoPlay 
}) {
  return (
    <div class="settings-content">
      <div class="setting-group">
        <h3>Text Settings</h3>
        <div class="setting-item">
          <label class="setting-label">Max Characters:</label>
          <input 
            type="number" 
            class="setting-input"
            value={maxChars()} 
            onInput={(e) => setMaxChars(parseInt(e.target.value) || MAX_CHARS)}
            min="100"
            max="2000"
          />
        </div>
      </div>

      <div class="setting-group">
        <h3>Audio Settings</h3>
        <div class="setting-item">
          <label class="setting-label">
            <input 
              type="checkbox" 
              checked={autoPlay()}
              onChange={(e) => setAutoPlay(e.target.checked)}
            />
            Auto-play generated audio
          </label>
        </div>
      </div>

      <div class="setting-group">
        <h3>About</h3>
        <div class="about-text">
          <p>Text-to-Speech (TTS) App</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsTab;

