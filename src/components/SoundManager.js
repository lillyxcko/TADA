import * as Tone from 'tone';

export const SoundManager = (() => {
  const MAX_SYNTHS = 8; // Maximum number of concurrent synths
  const trumpetGain = new Tone.Gain(0.8).connect(new Tone.Limiter(-6).toDestination());
  const pluckGain = new Tone.Gain(1.5).toDestination(); 

  // Use a PolySynth to handle multiple voices efficiently
  const polySynth = new Tone.PolySynth(Tone.MonoSynth, {
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 1,
      release: 0.2,
    },
  }).connect(trumpetGain);

  const pluckSynths = {}; // Store instances of pluck synths by pitch

  // Pool of active trumpet synths for reuse
  const synthPool = [];
  
  // Get a synth from the pool or create a new one
  const getSynthFromPool = () => {
    return synthPool.length > 0 ? synthPool.pop() : new Tone.MonoSynth().connect(trumpetGain);
  };

  // Return a synth to the pool after use
  const releaseSynthToPool = (synth) => {
    synth.triggerRelease();
    setTimeout(() => synthPool.push(synth), 200); // Return after release
  };

  // Start the sound for a node (trumpet-like sound)
  const startNodeSound = (id, pitch) => {
    if (polySynth.activeVoices >= MAX_SYNTHS) {
      console.warn('Maximum number of active synths reached.');
      return;
    }

    // Use PolySynth to trigger the sound
    Tone.start();
    polySynth.triggerAttack(pitch, Tone.now(), 1); // Velocity 1 for consistent volume
  };

  // Stop the sound for a node (with gradual fade out)
  const stopNodeSound = (id, pitch) => {
    polySynth.triggerRelease(pitch, Tone.now() + 0.2); // Fade out with the release time
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