import * as Tone from 'tone';

export const SoundManager = (() => {
  let trumpetSynths = [];
  let pluckSynths = [];

  // Initialize the trumpet/horn-like synth for node sounds
  const initializeTrumpetSynth = (pitch) => {
    if (!trumpetSynths[pitch]) {
      const synth = new Tone.MonoSynth({
        envelope: {
          attack: 0.1,  // Time for sound to reach full volume
          decay: 0.2,   // Time for sound to transition from full volume to sustain level
          sustain: 0.8, // Sustain level (how loud the sound stays during the hold)
          release: 2,   // Release time for gradual fade out
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
    const synth = new Tone.PluckSynth().toDestination();
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
  // Start the sound for a link (guitar pluck sound with sustained duration)
  const startLinkSound = (pitch) => {
    const synth = initializePluckSynth();
    Tone.start();
    synth.triggerAttackRelease(pitch, '8n'); // Trigger guitar pluck sound, but let it play for an eighth note
  };

  // Stop the sound for a link
  const stopLinkSound = () => {
    pluckSynths.forEach(synth => synth.dispose()); // Dispose of the synths after use
    pluckSynths = []; // Clear the array for new synths
  };

  return {
    startNodeSound,
    stopNodeSound,
    startLinkSound,
    stopLinkSound,
  };
})();