import React, { useRef, useEffect } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager
import { GestureManager } from './GestureManager'; // Import the Gesture Manager

const Node = ({ cx, cy, r, pitch, value }) => {
  const isInsideRef = useRef(false); // Track if the touch is inside the circle
  const circleRef = useRef(null);
  const { handleTouchStart: gestureTouchStart, handleTouchMove: gestureTouchMove, handleTouchEnd: gestureTouchEnd } = GestureManager({
    cx,
    cy,
    nodeValue: value, // Pass the value to announce via TTS
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

    // Trigger the node sound only on a single touch
    if (e.touches.length === 1 && isInside) {
      SoundManager.startNodeSound(pitch); // Play node sound
      isInsideRef.current = true;
    }

    // Always handle the touch with GestureManager, especially for second tap TTS
    gestureTouchStart(e); // Pass the event to GestureManager to handle multi-touch
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

    // Trigger the node sound only if inside and with a single touch
    if (e.touches.length === 1 && isInside && !isInsideRef.current) {
      SoundManager.startNodeSound(pitch); // Start sound when touch enters
      isInsideRef.current = true;
    } else if (!isInside && isInsideRef.current) {
      SoundManager.stopNodeSound(); // Stop sound when touch leaves
      isInsideRef.current = false;
    }

    gestureTouchMove(e); // Pass to GestureManager to handle multi-touch logic
  };

  // Stop the sound when touch ends
  const handleTouchEnd = (e) => {
    // Stop node sound if no touches remain
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