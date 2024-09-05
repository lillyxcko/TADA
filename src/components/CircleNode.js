import React, { useState } from 'react';
import * as Tone from 'tone';

const CircleNode = ({ cx, cy, r, pitch }) => {
  const [synth, setSynth] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to start playing the sound
  const startSound = () => {
    if (!isPlaying) {
      const newSynth = new Tone.Synth().toDestination();
      newSynth.triggerAttack(pitch); // Start the sound
      setSynth(newSynth);
      setIsPlaying(true);
    }
  };

  // Function to stop playing the sound
  const stopSound = () => {
    if (synth) {
      synth.triggerRelease(); // Stop the sound
      setIsPlaying(false);
      setSynth(null);
    }
  };

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="blue"
      onMouseDown={startSound}    // Start sound on mouse down
      onMouseUp={stopSound}       // Stop sound on mouse up
      onMouseEnter={startSound}   // Trigger sound when dragging over the circle
      onMouseLeave={stopSound}    // Stop sound when the cursor/finger leaves the circle
      onTouchStart={startSound}   // Start sound on touch start for mobile
      onTouchEnd={stopSound}      // Stop sound on touch end for mobile
      style={{ cursor: 'pointer' }}
    />
  );
};

export default CircleNode;