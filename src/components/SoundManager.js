import * as Tone from 'tone';

export const SoundManager = (() => {
  let audioContext;
  let oscillator;
  let pluckSynth;

  // Initialize AudioContext for the oscillator (used for node sounds)
  const initializeAudioContext = () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  };

  // Initialize the PluckSynth for link sounds (guitar pluck)
  const initializePluckSynth = () => {
    if (!pluckSynth) {
      pluckSynth = new Tone.PluckSynth().toDestination();
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

  // Start the guitar pluck sound for a link
  const startLinkSound = (pitch = 'C4') => {
    initializePluckSynth(); // Ensure PluckSynth is initialized
    pluckSynth.triggerAttack(pitch); // Play the pluck sound for the link
  };

  const stopLinkSound = () => {
    // No explicit stop needed for PluckSynth, it decays naturally
  };

  return {
    startNodeSound,
    stopNodeSound,
    startLinkSound,
    stopLinkSound,
  };
})();