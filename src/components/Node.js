import React, { useRef, useEffect, useState } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager
import { GestureManager } from './GestureManager'; // Import the Gesture Manager

const Node = ({ cx, cy, r, pitch, value, blockLinkSound }) => {
  const [radius, setRadius] = useState(r); // State to manage node radius
  const isInsideRef = useRef(false); // Track if the touch is inside the circle
  const circleRef = useRef(null);
  const { handleTouchStart: gestureTouchStart, handleTouchMove: gestureTouchMove, handleTouchEnd: gestureTouchEnd } = GestureManager({
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

    // If touch is inside the node, grow the node and block link sounds in this radius
    if (e.touches.length === 1 && isInside) {
      setRadius(r + 10); // Increase radius by 10px
      blockLinkSound(true); // Signal to block link sounds
      SoundManager.startNodeSound(pitch); // Play node sound
      isInsideRef.current = true;
    }

    gestureTouchStart(e); // Handle multi-touch gestures like TTS
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

    // Maintain node size while being touched
    if (isInside && !isInsideRef.current) {
      SoundManager.startNodeSound(pitch);
      isInsideRef.current = true;
    } else if (!isInside && isInsideRef.current) {
      SoundManager.stopNodeSound();
      isInsideRef.current = false;
    }

    gestureTouchMove(e); // Handle gestures
  };

  // Stop the sound and reset the radius when the touch ends
  const handleTouchEnd = (e) => {
    setRadius(r); // Reset the radius back to normal
    SoundManager.stopNodeSound();
    isInsideRef.current = false;
    blockLinkSound(false); // Allow link sounds again
    gestureTouchEnd(e); // Handle gesture end
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
      r={radius} // Use the dynamic radius
      fill="white"
      fillOpacity={0.9}
      onTouchStart={handleTouchStart}
      style={{ cursor: 'pointer' }}
    />
  );
};

export default Node;