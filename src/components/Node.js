import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SoundManager } from './SoundManager'; // Import Sound Manager
import { GestureManager } from './GestureManager'; // Import Gesture Manager

const Node = ({ id, cx, cy, r, pitch, value }) => {
  const activeTouches = useRef(new Set()); // Track active touches
  const circleRef = useRef(null); // Ref to circle element
  const [radius, setRadius] = useState(r); // State to handle radius
  const infoIndex = useRef(0); // Keep track of which piece of information to announce

  // Helper function to determine if a touch is inside the circle
  const isInsideCircle = useCallback((touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;

    const effectiveRadius = r + 60; // Adjusted radius for touch detection
    return distanceSquared < effectiveRadius ** 2;
  }, [r]);

  // Initialize GestureManager and destructure gesture handlers
  const {
    handleTouchStart: gestureTouchStart,
    handleTouchMove: gestureTouchMove,
    handleTouchEnd: gestureTouchEnd,
    speakValue, // Include speakValue function from GestureManager
  } = GestureManager({
    cx,
    cy,
    nodeValue: value, // For gesture handling and TTS announcements
    isInsideCircle,
    infoIndex, // Pass infoIndex to track the current index of info
  });

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touchX = e.touches[i].clientX;
      const touchY = e.touches[i].clientY;

      if (isInsideCircle(touchX, touchY)) {
        activeTouches.current.add(e.touches[i].identifier); // Add touch ID
        SoundManager.startNodeSound(id, pitch); // Start sound with node ID
        setRadius(r + 10); // Increase radius
      }
    }
    gestureTouchStart(e); // Forward event to GestureManager
  }, [id, pitch, r, isInsideCircle, gestureTouchStart]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touchX = e.touches[i].clientX;
      const touchY = e.touches[i].clientY;
      const isInside = isInsideCircle(touchX, touchY);

      if (isInside && !activeTouches.current.has(e.touches[i].identifier)) {
        activeTouches.current.add(e.touches[i].identifier);
        SoundManager.startNodeSound(id, pitch); // Start sound
        setRadius(r + 10); // Increase radius
      } else if (!isInside && activeTouches.current.has(e.touches[i].identifier)) {
        activeTouches.current.delete(e.touches[i].identifier);
        SoundManager.stopNodeSound(id); // Stop sound
        setRadius(r); // Reset radius
      }
    }
    gestureTouchMove(e); // Forward event to GestureManager
  }, [id, pitch, r, isInsideCircle, gestureTouchMove]);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const identifier = e.changedTouches[i].identifier;
      if (activeTouches.current.has(identifier)) {
        activeTouches.current.delete(identifier); // Remove touch ID
        if (activeTouches.current.size === 0) {
          SoundManager.stopNodeSound(id); // Stop sound if no active touches
          setRadius(r); // Reset radius
        }
      }
    }
    gestureTouchEnd(e); // Forward event to GestureManager
  }, [id, r, gestureTouchEnd]);

  // Effect to manage global touch events (cleanup on unmount)
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
      style={{ cursor: 'pointer', transition: 'r 0.2s ease' }} // Smooth transition
    />
  );
};

export default Node;