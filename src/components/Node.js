import React, { useRef, useEffect, useState } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager
import { GestureManager } from './GestureManager'; // Import the Gesture Manager

const Node = ({ cx, cy, r, pitch, value }) => {
  const isInsideRef = useRef(false); // Track if the touch is inside the circle
  const circleRef = useRef(null);
  const [radius, setRadius] = useState(r); // Use state to handle the animated radius
  const touchTimeoutRef = useRef(null); // Ref to handle debouncing

  const { handleTouchStart: gestureTouchStart, handleTouchMove: gestureTouchMove, handleTouchEnd: gestureTouchEnd } = GestureManager({
    cx,
    cy,
    nodeValue: value, // Pass the value to announce via TTS
    radius: r,
  });

  const isInsideCircle = (touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    return (
      touchX > circle.left &&
      touchX < circle.right &&
      touchY > circle.top &&
      touchY < circle.bottom
    );
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    if (e.touches.length === 1 && isInsideCircle(touchX, touchY)) {
      clearTimeout(touchTimeoutRef.current);
      SoundManager.startNodeSound(pitch); // Play sound when touch starts
      isInsideRef.current = true;
      setRadius(r + 10); // Increase radius on touch
    }
    gestureTouchStart(e); // Pass the event to GestureManager
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const isInside = isInsideCircle(touchX, touchY);

    if (e.touches.length === 1 && isInside && !isInsideRef.current) {
      SoundManager.startNodeSound(pitch); // Start sound when touch enters
      isInsideRef.current = true;
      setRadius(r + 10);
    } else if (!isInside && isInsideRef.current) {
      SoundManager.stopNodeSound(pitch); // Stop sound when touch leaves
      isInsideRef.current = false;
      setRadius(r);
    }

    gestureTouchMove(e); // Pass to GestureManager
  };

  // Handle touch end
  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      // Debounce touch end to avoid abrupt cutoffs
      touchTimeoutRef.current = setTimeout(() => {
        SoundManager.stopNodeSound(pitch); // Stop sound after all touches end
        isInsideRef.current = false;
        setRadius(r); // Reset radius
      }, 100);
    }
    gestureTouchEnd(e); // Pass to GestureManager
  };

  useEffect(() => {
    const handleDocumentTouchMove = (e) => handleTouchMove(e);
    const handleDocumentTouchEnd = (e) => handleTouchEnd(e);

    document.addEventListener('touchmove', handleDocumentTouchMove);
    document.addEventListener('touchend', handleDocumentTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleDocumentTouchMove);
      document.removeEventListener('touchend', handleDocumentTouchEnd);
    };
  }, []);

  return (
    <circle
      ref={circleRef}
      cx={cx}
      cy={cy}
      r={radius}
      fill="white"
      fillOpacity={1}
      onTouchStart={handleTouchStart}
      style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
    />
  );
};

export default Node;