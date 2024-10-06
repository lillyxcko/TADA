import * as Tone from 'tone';

export const SoundManager = (() => {
  let trumpetSynths = {}; // Store instances of trumpet synths keyed by pitch
  let pluckSynths = {}; // Store instances of pluck synths keyed by pitch
  let pluckGain = new Tone.Gain(3.5).toDestination(); // Set the gain for smoother sound

  // Initialize the trumpet synth for node sounds
  const initializeTrumpetSynth = (pitch) => {
    const synth = new Tone.MonoSynth({
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 1,
        release: 2,
      },
    }).toDestination();

    if (Tone.context.state === 'suspended') {
      Tone.context.resume();
    }
    return synth;
  };

  // Start the sound for a node (trumpet-like sound)
  const startNodeSound = (pitch) => {
    if (!trumpetSynths[pitch]) {
      trumpetSynths[pitch] = initializeTrumpetSynth(pitch);
    }
    Tone.start();
    trumpetSynths[pitch].triggerAttack(pitch); // Sustain the sound while the touch persists
  };

  // Stop the sound for a node (with gradual fade out)
  const stopNodeSound = (pitch) => {
    const synth = trumpetSynths[pitch];
    if (synth) {
      synth.triggerRelease(); // Gradual release of sound
      // Do not delete synth from trumpetSynths, allowing it to be reused
    }
  };

  // Initialize the guitar pluck sound for link sounds
  const initializePluckSynth = (pitch) => {
    const synth = new Tone.PluckSynth().connect(pluckGain); // Connect pluck synth to gain
    pluckSynths[pitch] = synth; // Store the synth keyed by pitch
    if (Tone.context.state === 'suspended') {
      Tone.context.resume();
    }
    return synth;
  };

  // Start the sound for a link (guitar pluck sound with controlled timing)
  const startLinkSound = (pitch) => {
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