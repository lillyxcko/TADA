import * as Tone from 'tone';

export const SoundManager = (() => {
  let trumpetSynths = [];
  let pluckSynths = [];

  // Initialize the trumpet/horn-like synth for node sounds
  const initializeTrumpetSynth = () => {
    const synth = new Tone.MonoSynth({
        envelope: {
          attack: 0.1,  // Time for sound to reach full volume (can be adjusted)
          decay: 0.2,   // Time for sound to transition from full volume to sustain level
          sustain: 0.8, // Sustain level (can adjust to control the body of the sound)
          release: 2,   // Release time (2 seconds for gradual stop)
        }
      }).toDestination();
    trumpetSynths.push(synth);
    if (Tone.context.state === 'suspended') {
      Tone.context.resume();
    }
    return synth;
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
    const synth = initializeTrumpetSynth();
    Tone.start();
    synth.triggerAttackRelease(pitch); // Trigger trumpet sound on node touch
  };

  // Stop the sound for a node
  const stopNodeSound = () => {
    trumpetSynths.forEach(synth => synth.triggerRelease()); // Gradual release
    setTimeout(() => {
      trumpetSynths.forEach(synth => synth.dispose()); // Dispose of the synths after release
      trumpetSynths = []; // Clear array for new synths
    }, 3000); // Delay disposal to allow release to complete (matching the release time)
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