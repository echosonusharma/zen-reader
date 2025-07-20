import AudioPlayer from "./AudioPlayer";

function MainTab({ 
  inputText, 
  setInputText, 
  maxChars, 
  generate, 
  isGenerating, 
  clear, 
  audioUrl, 
  autoPlay 
}) {
  return (
    <div class="input-section">
      <textarea 
        class="textarea"
        placeholder="Enter text to convert to speech..."
        value={inputText()}
        onInput={(e) => setInputText(e.target.value)}
      />
      
      <div class="char-count">
        {inputText().length} / {maxChars()} characters
      </div>
      
      <div class="buttons">
        <button 
          class="btn btn-primary" 
          onClick={generate}
          disabled={isGenerating() || !inputText().trim()}
        >
          {isGenerating() ? "Generating..." : "Generate Audio"}
        </button>
        
        {inputText() && (
          <button 
            class="btn btn-secondary"
            onClick={clear}
            disabled={isGenerating()}
          >
            Clear
          </button>
        )}
      </div>

      {audioUrl() && <AudioPlayer src={audioUrl()} key={audioUrl()} autoPlay={autoPlay()} />}
    </div>
  );
}

export default MainTab; 