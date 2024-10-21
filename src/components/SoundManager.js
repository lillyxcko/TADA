import * as Tone from 'tone';

export const SoundManager = (() => {
  const MAX_SYNTHS = 8; // Maximum number of synths
  const trumpetSynths = {}; // Store synths by node ID
  const pluckSynths = {}; // Store instances of pluck synths keyed by pitch
  const pluckGain = new Tone.Gain(3.5).toDestination(); // Set the gain for smoother sound

  // Pool to manage active synths
  const activeSynths = new Set(); 

  // Initialize the trumpet synth for node sounds
  const initializeTrumpetSynth = () => {
    return new Tone.MonoSynth({
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 1,
        release: 2, // Gradual release over 2 seconds
      },
    }).toDestination();
  };

  const startNodeSound = (id, pitch) => {
    if (activeSynths.size >= MAX_SYNTHS) {
      console.warn('Maximum number of active synths reached.');
      return;
    }

    // Reuse existing synth if available, otherwise create a new one
    let synth = trumpetSynths[id];
    if (!synth) {
      synth = initializeTrumpetSynth();
      trumpetSynths[id] = synth;
      activeSynths.add(synth);
    }

    Tone.start();
    synth.triggerAttack(pitch);
  };

  const stopNodeSound = (id) => {
    const synth = trumpetSynths[id];
    if (synth) {
      synth.triggerRelease();

      // Delay removal to allow the release envelope to complete
      setTimeout(() => {
        activeSynths.delete(synth);
        delete trumpetSynths[id]; // Remove the synth after release
      }, 2000); // Match the release duration
    }
  };

  return {
    startNodeSound,
    stopNodeSound,
    startLinkSound,
    stopLinkSound,
  };
})();