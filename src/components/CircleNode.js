import React, { useRef, useState } from 'react';

const CircleNode = ({ cx, cy, r, pitch }) => {
  // UseRef to persist the audio context and oscillator across renders
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const [isInsideCircle, setIsInsideCircle] = useState(false); // Track touch status inside the circle

  // Function to create AudioContext if not already created and handle Safari/iOS issues
  const initializeAudioContext = () => {
    // Create the AudioContext after a user gesture if not already initialized
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Check if the AudioContext is in suspended state and resume it - for mobile/Safari
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(err => console.log('AudioContext resume failed', err));
    }
  };

  // Function to start playing the sound
  const startSound = () => {
    initializeAudioContext();

    // Create and start an oscillator if not created yet
    if (!oscillatorRef.current && audioContextRef.current) {
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

  // Check if the touch is inside the circle
  const isTouchInsideCircle = (touchX, touchY, circle) => {
    return (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );
  };

  // Handle touch start: Do nothing until they drag into the circle
  const handleTouchStart = () => {
    setIsInsideCircle(false); // Initially, the touch is outside the circle
  };

  // Handle touch move: Start sound when finger moves into the circle
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const circle = e.target.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    if (isTouchInsideCircle(touchX, touchY, circle)) {
      if (!isInsideCircle) {
        startSound();  // Start sound when the finger enters the circle
        setIsInsideCircle(true);  // Mark as inside the circle
      }
    } else {
      if (isInsideCircle) {
        stopSound();  // Stop sound if the finger leaves the circle
        setIsInsideCircle(false);  // Mark as outside the circle
      }
    }
  };

  // Handle touch end: Stop sound when the finger is lifted
  const handleTouchEnd = () => {
    stopSound();
    setIsInsideCircle(false);  // Reset when the finger is lifted
  };

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="white"
      fillOpacity={0.9}
      // Maintain current mouse functionality
      onMouseDown={startSound}    // Start sound on mouse down
      onMouseUp={stopSound}       // Stop sound on mouse up
      onMouseEnter={startSound}   // Start sound when dragging over the circle with the mouse
      onMouseLeave={stopSound}    // Stop sound when the mouse leaves the circle
      // Handle touch events for mobile devices
      onTouchStart={handleTouchStart}  // Detect touch but don't trigger sound yet
      onTouchMove={handleTouchMove}    // Track movement, start sound if finger enters the circle
      onTouchEnd={handleTouchEnd}      // Stop sound when the finger is lifted
      style={{ cursor: 'pointer' }}
    />
  );
};

export default CircleNode;