import React, { useState } from 'react';
import * as Tone from 'tone';

const CircleNode = ({ cx, cy, r, pitch }) => {
  const [synth, setSynth] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Function to start playing the sound
  const startSound = async () => {
    await Tone.start(); // Ensure the AudioContext is resumed
    if (!isPlaying) {
      const newSynth = new Tone.Synth().toDestination();
      newSynth.triggerAttack(pitch); // Start the sound and hold it
      setSynth(newSynth);
      setIsPlaying(true);
    }
  };

  // Function to stop playing the sound
  const stopSound = () => {
    if (synth && isPlaying) {
      synth.triggerRelease(); // Stop the sound
      setIsPlaying(false);
      setSynth(null);
    }
  };

  // Handle touch move to detect if the user moves out of the circle
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const circle = e.target.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Check if the touch is outside the circle's bounding box
    if (
      touchX < circle.left ||
      touchX > circle.right ||
      touchY < circle.top ||
      touchY > circle.bottom
    ) {
      stopSound(); // Stop the sound if touch moves out
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
      onTouchMove={handleTouchMove} // Check for touch move outside the circle and stop sound
      style={{ cursor: 'pointer' }}
    />
  );
};

export default CircleNode;