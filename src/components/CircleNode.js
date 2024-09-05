import React, { useState } from 'react';

const CircleNode = ({ cx, cy, r, pitch }) => {
  const [audioContext, setAudioContext] = useState(null);
  const [oscillator, setOscillator] = useState(null);

  // Function to start playing the sound
  const startSound = () => {
    // Initialize the AudioContext on the first interaction
    if (!audioContext) {
      const newAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(newAudioContext);
    }

    // Create an oscillator (if not already created)
    if (!oscillator && audioContext) {
      const osc = audioContext.createOscillator();
      osc.type = 'sine'; // Type of sound wave (sine, square, etc.)
      osc.frequency.setValueAtTime(pitch, audioContext.currentTime); // Frequency determines the pitch
      osc.connect(audioContext.destination); // Connect to speakers
      osc.start();
      setOscillator(osc);
    }
  };

  // Function to stop playing the sound
  const stopSound = () => {
    if (oscillator) {
      oscillator.stop(); // Stop the sound
      setOscillator(null); // Clear the oscillator
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
      onTouchMove={(e) => {       // Handle dragging over the circle on touch
        const touch = e.touches[0];
        const circle = e.target.getBoundingClientRect();
        const touchX = touch.clientX;
        const touchY = touch.clientY;

        if (
          touchX > circle.left &&
          touchX < circle.right &&
          touchY > circle.top &&
          touchY < circle.bottom
        ) {
          startSound();
        } else {
          stopSound();
        }
      }}
      style={{ cursor: 'pointer' }}
    />
  );
};

export default CircleNode;