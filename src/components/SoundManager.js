import * as Tone from 'tone';

export const SoundManager = (() => {
  const MAX_SYNTHS = 8; // Maximum number of synths
  const trumpetSynths = {}; // Store synths by node ID
  const pluckSynths = {}; // Store instances of pluck synths keyed by pitch
  const pluckGain = new Tone.Gain(2.5).toDestination(); // Set the gain for smoother sound

  // Pool to manage active synths
  const activeSynths = new Set(); 

  // Initialize the trumpet synth for node sounds
  const initializeTrumpetSynth = () => {
    return new Tone.MonoSynth({
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 1,
        release: 2,
      },
    }).toDestination();
  };

  // Start the sound for a node (trumpet-like sound)
  const startNodeSound = (id, pitch) => {
    if (activeSynths.size >= MAX_SYNTHS) {
      console.warn('Maximum number of active synths reached.');
      return;
    }

    // If the synth already exists for this node, don't create another
    if (!trumpetSynths[id]) {
      const synth = initializeTrumpetSynth();
      trumpetSynths[id] = synth;
      activeSynths.add(synth);

      Tone.start();
      synth.triggerAttack(pitch);
    }
  };

  // Stop the sound for a node (with gradual fade out)
  const stopNodeSound = (id) => {
    const synth = trumpetSynths[id];
    if (synth) {
      synth.triggerRelease();
      activeSynths.delete(synth);
      delete trumpetSynths[id]; // Remove the synth from storage
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