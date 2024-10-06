import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager
import { GestureManager } from './GestureManager'; // Import the Gesture Manager

const Node = ({ cx, cy, r, pitch, value }) => {
  const activeTouches = useRef(new Set()); // Track active touches
  const circleRef = useRef(null);
  const [radius, setRadius] = useState(r); // Use state to handle the animated radius
  const touchTimeoutRef = useRef(null); // Ref to handle debouncing

  const isInsideCircle = useCallback((touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2; // Center x-coordinate of the circle
    const centerY = circle.top + circle.height / 2; // Center y-coordinate of the circle
    const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;

    const effectiveRadius = r + 60; 
    return distanceSquared < (effectiveRadius ** 2); 
  }, [r]);

  const { handleTouchStart: gestureTouchStart, handleTouchMove: gestureTouchMove, handleTouchEnd: gestureTouchEnd } = GestureManager({
    cx,
    cy,
    nodeValue: value, // Pass the value to announce via TTS
    isInsideCircle,
  });

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touchX = e.touches[i].clientX;
      const touchY = e.touches[i].clientY;

      if (isInsideCircle(touchX, touchY)) {
        activeTouches.current.add(e.touches[i].identifier); // Store the touch identifier
        SoundManager.startNodeSound(pitch); // Play sound when touch starts
        setRadius(r + 10); // Increase radius on touch
      }
    }
    gestureTouchStart(e); // Pass the event to GestureManager
  }, [gestureTouchStart, pitch, r, isInsideCircle]); // Add dependencies

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touchX = e.touches[i].clientX;
      const touchY = e.touches[i].clientY;
      const isInside = isInsideCircle(touchX, touchY);

      if (isInside && !activeTouches.current.has(e.touches[i].identifier)) {
        activeTouches.current.add(e.touches[i].identifier);
        SoundManager.startNodeSound(pitch); // Start sound when touch enters
        setRadius(r + 10);
      } else if (!isInside && activeTouches.current.has(e.touches[i].identifier)) {
        activeTouches.current.delete(e.touches[i].identifier);
        SoundManager.stopNodeSound(pitch); // Stop sound when touch leaves
        setRadius(r); // Reset radius
      }
    }
    gestureTouchMove(e); // Pass the event to GestureManager
  }, [gestureTouchMove, pitch, r, isInsideCircle]);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const identifier = e.changedTouches[i].identifier;
      if (activeTouches.current.has(identifier)) {
        activeTouches.current.delete(identifier); // Remove the touch identifier
        if (activeTouches.current.size === 0) {
          SoundManager.stopNodeSound(pitch); // Stop sound if no active touches remain
          setRadius(r); // Reset radius
        }
      }
    }
    gestureTouchEnd(e); // Pass the event to GestureManager
  }, [gestureTouchEnd, pitch, r]);

  // Use Effect to clean up event listeners for touch events
  useEffect(() => {
    const handleDocumentTouchEnd = (e) => handleTouchEnd(e);
    const handleDocumentTouchMove = (e) => handleTouchMove(e);

    document.addEventListener('touchend', handleDocumentTouchEnd);
    document.addEventListener('touchmove', handleDocumentTouchMove);

    return () => {
      document.removeEventListener('touchend', handleDocumentTouchEnd);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
    };
  }, [handleTouchEnd, handleTouchMove]);

  return (
    <circle
      ref={circleRef}
      cx={cx}
      cy={cy}
      r={radius}
      fill="lightblue"
      onTouchStart={handleTouchStart} // Handle touch start
      onTouchEnd={handleTouchEnd} // Handle touch end
      onTouchMove={handleTouchMove} // Handle touch move
      style={{ cursor: 'pointer', transition: 'r 0.2s ease' }} // Add transition effects
    />
  );
};

export default Node;