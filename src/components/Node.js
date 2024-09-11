import React, { useRef, useEffect } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager

const Node = ({ cx, cy, r, pitch }) => {
  const isInsideRef = useRef(false); // Track if the touch is inside the circle
  const circleRef = useRef(null);

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

    if (isInside) {
      SoundManager.startNodeSound(pitch); // Use SoundManager to play node sound
      isInsideRef.current = true;
    }
  };

  // Handle when the touch moves across the screen
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