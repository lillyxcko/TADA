import React, { useRef } from 'react';

const CircleNode = ({ cx, cy, r, pitch }) => {
  // UseRef to persist the audio context and oscillator across renders
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Function to start playing the sound

  /*
  const startSound = () => {
    // Initialize the AudioContext if it's not already initialized
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Create and start an oscillator if it hasn't been created yet
    if (!oscillatorRef.current) {
      const osc = audioContextRef.current.createOscillator();
      osc.type = 'sine'; // Type of sound wave (sine, square, etc.)
      osc.frequency.setValueAtTime(pitch, audioContextRef.current.currentTime); // Set pitch
      osc.connect(audioContextRef.current.destination); // Connect to speakers
      osc.start();
      oscillatorRef.current = osc;
    }
  };*/

  const startSound = () => {
    // Create the AudioContext after a user gesture if not already initialized
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  
    // Check if the AudioContext is in suspended state and resume it
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  
    // Create and start an oscillator if it hasn't been created yet
    if (!oscillatorRef.current) {
      const osc = audioContextRef.current.createOscillator();
      osc.type = 'sine'; // Type of sound wave (sine, square, etc.)
      osc.frequency.setValueAtTime(pitch, audioContextRef.current.currentTime); // Set pitch
      osc.connect(audioContextRef.current.destination); // Connect to speakers
      osc.start();
      oscillatorRef.current = osc;
    }
  };

  // Function to stop playing the sound
  const stopSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop(); // Stop the sound
      oscillatorRef.current = null; // Clear the oscillator
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