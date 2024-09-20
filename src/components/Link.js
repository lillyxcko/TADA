import React, { useRef, useEffect } from 'react';
import { SoundManager } from './SoundManager'; // Import SoundManager for link sounds

const Link = ({ x1, y1, x2, y2, pitch, blockLinkSound }) => {
  const lastTouchPositionRef = useRef(null); // Store the last touch position
  const lastCrossDirectionRef = useRef(null); // Track the last crossing direction
  const linkRef = useRef(null);

  // Helper function to calculate the angle between two points
  const calculateAngle = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  };

  // Calculate the distance between two points (width of the rectangle)
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const rect = linkRef.current.getBoundingClientRect();
    const isInside = (
      touchX >= rect.left &&
      touchX <= rect.right &&
      touchY >= rect.top &&
      touchY <= rect.bottom
    );

    // Check if the node is blocking link sound within the node's radius
    if (!blockLinkSound() && isInside) {
      const lastTouchPosition = lastTouchPositionRef.current;

      // Calculate the movement direction across the link (like a guitar pluck)
      const movingLeftToRight = lastTouchPosition ? touchX > lastTouchPosition.x : false;
      const movingRightToLeft = lastTouchPosition ? touchX < lastTouchPosition.x : false;

      // Trigger link sound only when crossing the link in either direction
      if (movingLeftToRight && lastCrossDirectionRef.current !== "right") {
        SoundManager.startLinkSound(pitch); // Pluck when moving right
        lastCrossDirectionRef.current = "right";
      } else if (movingRightToLeft && lastCrossDirectionRef.current !== "left") {
        SoundManager.startLinkSound(pitch); // Pluck when moving left
        lastCrossDirectionRef.current = "left";
      }

      // Update the last touch position
      lastTouchPositionRef.current = { x: touchX, y: touchY };
    }
  };

  const handleTouchEnd = () => {
    SoundManager.stopLinkSound();
    lastTouchPositionRef.current = null; // Reset the last touch position on touch end
    lastCrossDirectionRef.current = null; // Reset the direction to allow new crossings
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

  // Calculate the properties of the rectangle (link) to display
  const width = calculateDistance(x1, y1, x2, y2);
  const height = 8; // Adjust this value for the thickness of the link
  const angle = calculateAngle(x1, y1, x2, y2);

  return (
    <>
      {/* Transparent background for touch detection area */}
      <rect
        ref={linkRef}
        x={x1}
        y={y1 - height / 2} // Adjust y position to center the rectangle on the line
        width={width}
        height={height}
        fill="white"
        transform={`rotate(${angle} ${x1} ${y1})`} // Rotate to align with the line
      />
    </>
  );
};

export default Link;