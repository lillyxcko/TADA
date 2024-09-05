import React from 'react';
import * as Tone from 'tone';

const CircleNode = ({ cx, cy, r, pitch }) => {
  // Function to play the specified pitch when the circle is clicked
  const playSound = () => {
    const synth = new Tone.Synth().toDestination();
    synth.triggerAttackRelease(pitch, '8n');
  };

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="black"
      onClick={playSound} // Play sound on click
      style={{ cursor: 'pointer' }} // Change cursor on hover
    />
  );
};

export default CircleNode;