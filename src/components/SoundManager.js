import * as Tone from 'tone';

export const SoundManager = (() => {
  let trumpetSynths = [];
  let pluckSynths = [];
  let pluckGain = new Tone.Gain(3.5).toDestination(); // Set the gain for smoother sound

  // Initialize the trumpet synth for node sounds
  const initializeTrumpetSynth = (pitch) => {
    if (!trumpetSynths[pitch]) {
      const synth = new Tone.MonoSynth({
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 1,
          release: 2,
        }
      }).toDestination();
      trumpetSynths[pitch] = synth;
    }
    if (Tone.context.state === 'suspended') {
      Tone.context.resume();
    }
    return trumpetSynths[pitch];
  };

  // Initialize the guitar pluck sound for link sounds
  const initializePluckSynth = () => {
    const synth = new Tone.PluckSynth().connect(pluckGain); // Connect pluck synth to gain
    pluckSynths.push(synth);
    if (Tone.context.state === 'suspended') {
      Tone.context.resume();
    }
    return synth;
  };

  // Start the sound for a node (trumpet-like sound)
  const startNodeSound = (pitch) => {
    const synth = initializeTrumpetSynth(pitch);
    Tone.start();
    synth.triggerAttack(pitch); // Sustain the sound while the touch persists
  };

  // Stop the sound for a node (with gradual fade out)
  const stopNodeSound = (pitch) => {
    const synth = trumpetSynths[pitch];
    if (synth) {
      synth.triggerRelease(); // Gradual release of sound
    }
  };

  // Start the sound for a link (guitar pluck sound with controlled timing)
  const startLinkSound = (pitch) => {
    const synth = initializePluckSynth();
    Tone.start();
    synth.triggerAttackRelease(pitch, "8n"); // Trigger pluck sound
  };

  // Stop the sound for a link
  const stopLinkSound = (pitch) => {
    const synth = pluckSynths[pitch];
    if (synth) {
      synth.triggerRelease(); // Gradual release of sound
    }
  };

  return {
    startNodeSound,
    stopNodeSound,
    startLinkSound,
    stopLinkSound,
  };
})();