export const SoundManager = (() => {
    let audioContext;
    let oscillator;
  
    // Initialize AudioContext if not already created
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
      if (!oscillator) {
        oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(pitch, audioContext.currentTime);
        oscillator.connect(audioContext.destination);
        oscillator.start();
      }
    };
  
    // Stop the sound for a node
    const stopNodeSound = () => {
      if (oscillator) {
        oscillator.stop();
        oscillator = null;
      }
    };
  
    // Placeholder for link sound management
    const startLinkSound = (soundType) => {
      // Implement link sound logic here
    };
  
    const stopLinkSound = () => {
      // Implement link stop sound logic here
    };
  
    return {
      startNodeSound,
      stopNodeSound,
      startLinkSound,
      stopLinkSound,
    };
  })();