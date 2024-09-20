import React, { useRef, useEffect } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager
import { GestureManager } from './GestureManager'; // Import the Gesture Manager

const Node = ({ cx, cy, r, pitch, value }) => {
  const isInsideRef = useRef(false); // Track if the touch is inside the circle
  const circleRef = useRef(null);
  const { handleTouchStart: gestureTouchStart, handleTouchMove: gestureTouchMove } = GestureManager({
    cx,
    cy,
    nodeValue: value,
  });

  // Handle touch start and check if the touch is inside the circle
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const circle = circleRef.current.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const isInside = (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );

    // Only play the sound for the first finger (single touch)
    if (e.touches.length === 1 && isInside) {
      SoundManager.startNodeSound(pitch); // Use SoundManager to play node sound
      isInsideRef.current = true;
    }
    gestureTouchStart(e); // Pass to GestureManager (this handles the second finger for TTS)
  };

  // Handle touch move across the screen
  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const circle = circleRef.current.getBoundingClientRect();
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const isInside = (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );

    if (isInside && !isInsideRef.current) {
      SoundManager.startNodeSound(pitch); // Start sound when touch enters
      isInsideRef.current = true;
    } else if (!isInside && isInsideRef.current) {
      SoundManager.stopNodeSound(); // Stop sound when touch leaves
      isInsideRef.current = false;
    }

    gestureTouchMove(e); // Pass to GestureManager
  };

  // Stop the sound when touch ends
  const handleTouchEnd = () => {
    SoundManager.stopNodeSound();
    isInsideRef.current = false;
  };

  useEffect(() => {
    const handleDocumentTouchMove = (e) => {
      handleTouchMove(e);
    };

    document.addEventListener('touchmove', handleDocumentTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleDocumentTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <circle
      ref={circleRef}
      cx={cx}
      cy={cy}
      r={r}
      fill="white"
      fillOpacity={0.9}
      onTouchStart={handleTouchStart}
      style={{ cursor: 'pointer' }}
    />
  );
};

export default Node;