import React, { useRef, useEffect } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager
import { GestureManager } from './GestureManager'; // Import the Gesture Manager

const Node = ({ cx, cy, r, pitch, value }) => {
  const isInsideRef = useRef(false); // Track if the touch is inside the circle
  const circleRef = useRef(null);
  const { handleTouchStart: gestureTouchStart, handleTouchMove: gestureTouchMove, handleTouchEnd: gestureTouchEnd } = GestureManager({
    cx,
    cy,
    nodeValue: value,
  });

  // Handle touch start and check if the touch is inside the circle
  const handleTouchStart = (e) => {
    const circle = circleRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    const isInside = (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );

    // Check if it's a single touch and the touch is inside the circle
    if (e.touches.length === 1 && isInside) {
      SoundManager.startNodeSound(pitch); // Use SoundManager to play node sound
      isInsideRef.current = true;
    } else if (e.touches.length === 2) {
      // When the second finger is involved, skip node sound and handle TTS
      gestureTouchStart(e); // Pass to GestureManager for TTS without triggering node sound
    }
  };

  // Handle touch move across the screen
  const handleTouchMove = (e) => {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const circle = circleRef.current.getBoundingClientRect();

    const isInside = (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );

    // Only trigger sound for the first touch
    if (e.touches.length === 1 && isInside && !isInsideRef.current) {
      SoundManager.startNodeSound(pitch); // Start sound when touch enters
      isInsideRef.current = true;
    } else if (!isInside && isInsideRef.current) {
      SoundManager.stopNodeSound(); // Stop sound when touch leaves
      isInsideRef.current = false;
    }

    gestureTouchMove(e); // Pass to GestureManager
  };

  // Stop the sound when touch ends
  const handleTouchEnd = (e) => {
    // Only stop the sound if no touches remain
    if (e.touches.length === 0) {
      SoundManager.stopNodeSound();
      isInsideRef.current = false;
    }
    gestureTouchEnd(e); // Pass to GestureManager to handle multi-touch end logic
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