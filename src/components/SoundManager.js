import * as Tone from 'tone';

export const SoundManager = (() => {
  const MAX_SYNTHS = 8; // Maximum number of synths
  const trumpetSynths = {}; // Store arrays of trumpet synths keyed by pitch
  const pluckSynths = {}; // Store instances of pluck synths keyed by pitch
  const pluckGain = new Tone.Gain(3.5).toDestination(); // Set the gain for smoother sound

  // Pool to manage active synths
  const activeSynths = new Set(); 

  // Initialize the trumpet synth for node sounds
  const initializeTrumpetSynth = () => {
    const synth = new Tone.MonoSynth({
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 1,
        release: 2,
      },
    }).toDestination();
    return synth;
  };

  // Start the sound for a node (trumpet-like sound)
  const startNodeSound = (pitch) => {
    if (activeSynths.size >= MAX_SYNTHS) {
      console.warn('Maximum number of active synths reached. Please release a synth before playing another sound.');
      return; // Exit if max synths are in use
    }

    // Initialize the synth array if it doesn't exist for the pitch
    if (!trumpetSynths[pitch]) {
      trumpetSynths[pitch] = [];
    }

    // Create a new synth instance for each touch
    const synth = initializeTrumpetSynth();
    trumpetSynths[pitch].push(synth);
    activeSynths.add(synth); // Add to active synths set

    Tone.start();
    synth.triggerAttack(pitch); // Sustain the sound while the touch persists
  };

  // Stop the sound for a node (with gradual fade out)
  const stopNodeSound = (pitch) => {
    const synthArray = trumpetSynths[pitch];
    if (synthArray) {
      const synth = synthArray.pop(); // Remove the last synth instance for the pitch
      if (synth) {
        synth.triggerRelease(); // Gradual release of sound
        activeSynths.delete(synth); // Remove from active synths set
      }
    }
  };

  // Initialize the guitar pluck sound for link sounds
  const initializePluckSynth = (pitch) => {
    const synth = new Tone.PluckSynth().connect(pluckGain); // Connect pluck synth to gain
    if (Tone.context.state === 'suspended') {
      Tone.context.resume();
    }
    return synth; 
  };

  // Start the sound for a link (guitar pluck sound with controlled timing)
  const startLinkSound = (pitch) => {
    // Initialize the synth only once for each pitch
    if (!pluckSynths[pitch]) {
      pluckSynths[pitch] = initializePluckSynth(pitch); // Initialize and store if not already present
    }
    Tone.start();
    pluckSynths[pitch].triggerAttackRelease(pitch, "8n"); // Trigger pluck sound
  };

  // Stop the sound for a link
  const stopLinkSound = (pitch) => {
    const synth = pluckSynths[pitch];
    if (synth) {
      synth.triggerRelease(); // Gradual release of sound
      // Do not delete synth from pluckSynths, allowing it to be reused
    }
  };

  return {
    startNodeSound,
    stopNodeSound,
    startLinkSound,
    stopLinkSound,
  };
})();