import React, { useRef, useEffect } from 'react';
import { SoundManager } from './SoundManager'; // Import SoundManager for link sounds

const Link = ({ nodeA, nodeB, pitch }) => {
  const lastTouchPositionRef = useRef(null); // Store the last touch position
  const lastCrossDirectionRef = useRef(null); // Store the last crossing direction
  const linkRef = useRef(null);

  // Helper function to calculate the angle between two points
  const calculateAngle = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  };

  // Calculate the distance between two points
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  // Calculate the start and end points of the link based on node positions and radius
  const calculateLinkEnds = () => {
    const angle = calculateAngle(nodeA.cx, nodeA.cy, nodeB.cx, nodeB.cy);
    const startX = nodeA.cx + Math.cos(angle * (Math.PI / 180)) * nodeA.r;
    const startY = nodeA.cy + Math.sin(angle * (Math.PI / 180)) * nodeA.r;
    const endX = nodeB.cx - Math.cos(angle * (Math.PI / 180)) * nodeB.r;
    const endY = nodeB.cy - Math.sin(angle * (Math.PI / 180)) * nodeB.r;

    return { startX, startY, endX, endY };
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const { startX, startY, endX, endY } = calculateLinkEnds();

    // Check if the touch is inside the bounding rectangle of the link
    const rect = linkRef.current.getBoundingClientRect();
    const isInsideLink = (
      touchX >= rect.left &&
      touchX <= rect.right &&
      touchY >= rect.top &&
      touchY <= rect.bottom
    );


    // Proceed only if the touch is inside the link
    if (isInsideLink) {
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
  const { startX, startY, endX, endY } = calculateLinkEnds();
  const width = calculateDistance(startX, startY, endX, endY);
  const height = 8; // Thickness of the link
  const angle = calculateAngle(startX, startY, endX, endY);

  return (
    <>
      {/* Diagonal touch detection area */}
      <rect
        x={startX}
        y={startY - height / 2}
        width={width}
        height={height}
        fill="transparent" // Set to transparent to avoid visual interference
        onTouchMove={handleTouchMove} // Listen to touch movements
        onTouchEnd={handleTouchEnd} // Listen to touch end
        transform={`rotate(${angle} ${startX} ${startY})`} // Rotate to align with the link
      />

      {/* Render the actual link */}
      <rect
        ref={linkRef}
        x={startX}
        y={startY - height / 2} // Adjust y position to center the rectangle on the line
        width={width}
        height={height}
        fill="white"
        fillOpacity={0.9}
        transform={`rotate(${angle} ${startX} ${startY})`} // Rotate to align with the line
      />
    </>
  );
};

export default Link;