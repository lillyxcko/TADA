import React, { useState } from 'react';
import * as Tone from 'tone';

const CircleNode = ({ cx, cy, r, pitch }) => {
  const [synth, setSynth] = useState(null);

  // Function to start playing the sound when the button is pressed
  const startSound = () => {
    const newSynth = new Tone.Synth().toDestination();
    newSynth.triggerAttack(pitch); // Starts the sound without releasing it
    setSynth(newSynth);
  };

  // Function to stop playing the sound when the button is released
  const stopSound = () => {
    if (synth) {
      synth.triggerRelease(); // Stops the sound when the mouse/touch is released
      setSynth(null);
    }
  };

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="black"
      onMouseDown={startSound}   // Start sound on mouse down
      onMouseUp={stopSound}      // Stop sound on mouse up
      onMouseLeave={stopSound}   // Stop sound if the mouse leaves the circle while holding
      onTouchStart={startSound}  // Start sound on touch start (for mobile)
      onTouchEnd={stopSound}     // Stop sound on touch end (for mobile)
      style={{ cursor: 'pointer' }} // Optional: change cursor when hovering
    />
  );
};

export default CircleNode;