import React, { useRef } from 'react';

const CircleNode = ({ cx, cy, r, pitch }) => {
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);
  const isInsideRef = useRef(false); // Track if the touch is inside the circle

  // Function to create AudioContext if not already created
  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(err => console.log('AudioContext resume failed', err));
    }
  };

  const startSound = () => {
    initializeAudioContext();
    if (!oscillatorRef.current && audioContextRef.current) {
      const osc = audioContextRef.current.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, audioContextRef.current.currentTime);
      osc.connect(audioContextRef.current.destination);
      osc.start();
      oscillatorRef.current = osc;
    }
  };

  const stopSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
  };

  // Handle touch move (enter/leave behavior)
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const circle = e.target.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    // Check if touch is inside the circle
    const isInside = (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );

    console.log(`Touch coordinates: X=${touchX}, Y=${touchY}`);
    console.log(`Circle bounding box: Left=${circle.left}, Right=${circle.right}, Top=${circle.top}, Bottom=${circle.bottom}`);
    console.log(`isInside: ${isInside}, isInsideRef.current: ${isInsideRef.current}`);

    // If the touch enters the circle (from outside), start the sound
    if (isInside && !isInsideRef.current) {
      console.log('Touch entered the circle');
      startSound();
      isInsideRef.current = true;
    } 
    // If the touch leaves the circle, stop the sound
    else if (!isInside && isInsideRef.current) {
      console.log('Touch left the circle');
      stopSound();
      isInsideRef.current = false;
    }
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    startSound();
    isInsideRef.current = true;
    console.log('Touch started');
  };

  // Handle touch end
  const handleTouchEnd = () => {
    stopSound();
    isInsideRef.current = false; // Reset state after touch ends
    console.log('Touch ended');
  };

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="white"
      fillOpacity={0.9}
      onMouseDown={startSound}    // Start sound on mouse down
      onMouseUp={stopSound}       // Stop sound on mouse up
      onMouseEnter={startSound}   // Start sound when mouse enters the circle
      onMouseLeave={stopSound}    // Stop sound when mouse leaves the circle
      onTouchStart={handleTouchStart} // Log when touch starts
      onTouchEnd={handleTouchEnd} // Stop sound on touch end for mobile
      onTouchMove={handleTouchMove} // Start/stop sound when dragging over/away from the circle (enter/leave behavior)
      style={{ cursor: 'pointer' }}
    />
  );
};

export default CircleNode;