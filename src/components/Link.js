import React, { useRef, useEffect } from 'react';
import { SoundManager } from './SoundManager'; // Import SoundManager for link sounds

const Link = ({ x1, y1, x2, y2, pitch }) => {
  const lastTouchPositionRef = useRef(null); // Store the last touch position
  const lastCrossDirectionRef = useRef(null); // Store the last crossing direction
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

    if (isInside) {
      const lastTouchPosition = lastTouchPositionRef.current;
      
      // If this is the first touch, initialize the last position
      if (!lastTouchPosition) {
        lastTouchPositionRef.current = { x: touchX, y: touchY };
        return;
      }

      // Calculate the movement direction across the link (horizontal)
      const movingLeftToRight = touchX > lastTouchPosition.x;
      const movingRightToLeft = touchX < lastTouchPosition.x;

      // Trigger sound when crossing the link in either direction
      if (movingLeftToRight && lastCrossDirectionRef.current !== "right") {
        SoundManager.startLinkSound(pitch); // Pluck when moving right
        lastCrossDirectionRef.current = "right";
        console.log("Plucked right across the link");
      } else if (movingRightToLeft && lastCrossDirectionRef.current !== "left") {
        SoundManager.startLinkSound(pitch); // Pluck when moving left
        lastCrossDirectionRef.current = "left";
        console.log("Plucked left across the link");
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

  // Calculate the properties of the rectangle
  const width = calculateDistance(x1, y1, x2, y2);
  const height = 8; // You can adjust this value for the thickness of the link
  const angle = calculateAngle(x1, y1, x2, y2);

  // Increase the touch-sensitive area by making the background area larger
  const touchPadding = 20; // Extra padding around the link for more reliable detection
  const expandedWidth = width + touchPadding; // Larger width for touch detection
  const expandedHeight = height + touchPadding; // Larger height for touch detection

  return (
    <>
      {/* Transparent background for touch detection area */}
      <rect
        x={x1 - touchPadding / 2} // Offset to center the expanded area
        y={y1 - height / 2 - touchPadding / 2} // Center the expanded area on the link
        width={expandedWidth}
        height={expandedHeight}
        fill="transparent" // Invisible touch area
        transform={`rotate(${angle} ${x1} ${y1})`} // Rotate to align with the link
      />

      {/* Render the actual link */}
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