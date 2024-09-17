export const SoundManager = (() => {
    let audioContext;
    let nodeOscillator;
    let linkOscillator;
  
    // Initialize AudioContext for the oscillator (used for node sounds)
    const initializeAudioContext = () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
    };
  
    // Start the sound for a node
    const startNodeSound = (pitch) => {
      initializeAudioContext();
      if (!nodeOscillator) {
        nodeOscillator = audioContext.createOscillator();
        nodeOscillator.type = 'sine';
        nodeOscillator.frequency.setValueAtTime(pitch, audioContext.currentTime);
        nodeOscillator.connect(audioContext.destination);
        nodeOscillator.start();
      }
    };
  
    // Stop the sound for a node
    const stopNodeSound = () => {
      if (nodeOscillator) {
        nodeOscillator.stop();
        nodeOscillator = null;
      }
    };
  
    // Start the sound for a link
    const startLinkSound = (pitch) => {
      initializeAudioContext();
      if (!linkOscillator) {
        linkOscillator = audioContext.createOscillator();
        linkOscillator.type = 'triangle'; // Use a different waveform for the link sound
        linkOscillator.frequency.setValueAtTime(pitch, audioContext.currentTime);
        linkOscillator.connect(audioContext.destination);
        linkOscillator.start();
      }
    };
  
    // Stop the sound for a link, ensuring the oscillator exists before trying to stop
    const stopLinkSound = () => {
      if (linkOscillator) {
        linkOscillator.stop();
        linkOscillator = null;
      }
    };
  
    return {
      startNodeSound,
      stopNodeSound,
      startLinkSound,
      stopLinkSound,
    };
  })();