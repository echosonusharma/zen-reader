import "./AudioPlayer.css";

function AudioPlayer({ src, autoPlay = false }) {
  return (
    <audio 
      controls 
      src={src} 
      class="audio"
      autoplay={autoPlay}
    >
      Your browser does not support the audio element.
    </audio>
  );
}

export default AudioPlayer; 