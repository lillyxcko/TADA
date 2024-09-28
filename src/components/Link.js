import React, { useRef, useEffect, useCallback } from 'react';
import { SoundManager } from './SoundManager'; // Import SoundManager for link sounds

const Link = ({ nodeA, nodeB, pitch }) => {
  const isInsideRef = useRef(false); // Track if the touch is inside the link
  const lastTouchPositionRef = useRef(null); // Store the last touch position for swiping
  const touchTimeoutRef = useRef(null); // Ref to handle debouncing

  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const calculateDistanceToLine = (x, y, x1, y1, x2, y2) => {
    const A = y - y1;
    const B = x1 - x;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * D - B * C;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let closestX, closestY;

    if (param < 0) {
      closestX = x1;
      closestY = y1;
    } else if (param > 1) {
      closestX = x2;
      closestY = y2;
    } else {
      closestX = x1 + param * C;
      closestY = y1 + param * D;
    }

    return calculateDistance(x, y, closestX, closestY);
  };

  const calculateLinkEnds = useCallback(() => {
    if (!nodeA || !nodeB || isNaN(nodeA.cx) || isNaN(nodeA.cy) || isNaN(nodeA.r) || 
        isNaN(nodeB.cx) || isNaN(nodeB.cy) || isNaN(nodeB.r)) {
      console.error('Invalid nodeA or nodeB properties', { nodeA, nodeB });
      return { startX: 0, startY: 0, endX: 0, endY: 0 };
    }

    const dx = nodeB.cx - nodeA.cx;
    const dy = nodeB.cy - nodeA.cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0 || isNaN(distance)) {
      console.error('Invalid distance between nodes', { nodeA, nodeB });
      return { startX: 0, startY: 0, endX: 0, endY: 0 };
    }

    const unitVectorX = dx / distance;
    const unitVectorY = dy / distance;

    const startX = nodeA.cx + unitVectorX * nodeA.r;
    const startY = nodeA.cy + unitVectorY * nodeA.r;

    const endX = nodeB.cx - unitVectorX * nodeB.r;
    const endY = nodeB.cy - unitVectorY * nodeB.r;

    return { startX, startY, endX, endY };
  }, [nodeA, nodeB]);

  const convertToSVGCoords = (clientX, clientY) => {
    const svgElement = document.querySelector('svg'); // Assuming there's only one SVG
    const pt = svgElement.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgPoint = pt.matrixTransform(svgElement.getScreenCTM().inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  };

  const handleTouchStart = useCallback((e) => {
    const { startX, startY, endX, endY } = calculateLinkEnds();
    const touch = e.touches[0];
    const { x: touchX, y: touchY } = convertToSVGCoords(touch.clientX, touch.clientY);

    const distanceToLink = calculateDistanceToLine(touchX, touchY, startX, startY, endX, endY);
    const proximityThreshold = 5; // Threshold for proximity detection

    if (distanceToLink <= proximityThreshold) {
      isInsideRef.current = true; // Mark as inside the link
      lastTouchPositionRef.current = { x: touchX, y: touchY }; // Set the last touch position

      clearTimeout(touchTimeoutRef.current); // Clear any existing timeout
      SoundManager.startLinkSound(pitch); // Start sound when touch enters
    }
  }, [calculateLinkEnds, pitch]);

  const handleTouchMove = useCallback((e) => {
    const { startX, startY, endX, endY } = calculateLinkEnds();
    const touch = e.touches[0];
    const { x: touchX, y: touchY } = convertToSVGCoords(touch.clientX, touch.clientY);

    const distanceToLink = calculateDistanceToLine(touchX, touchY, startX, startY, endX, endY);
    const proximityThreshold = 20; // Threshold for proximity detection

    // Check if touch is near the link
    if (distanceToLink <= proximityThreshold) {
      // If we're still inside the link, just handle swipe logic
      if (isInsideRef.current) {
        // Calculate the distance moved since the last touch position
        if (lastTouchPositionRef.current) {
          const distanceMoved = calculateDistance(
            lastTouchPositionRef.current.x,
            lastTouchPositionRef.current.y,
            touchX,
            touchY
          );

          const swipeThreshold = 10; // Distance threshold to trigger sound
          if (distanceMoved >= swipeThreshold) {
            clearTimeout(touchTimeoutRef.current); // Clear existing timeout
            SoundManager.startLinkSound(pitch); // Start sound for swiping
            lastTouchPositionRef.current = { x: touchX, y: touchY }; // Update last touch position
          }
        }
      } else {
        // Touch entered the link area
        isInsideRef.current = true; // Mark as inside the link
        lastTouchPositionRef.current = { x: touchX, y: touchY }; // Set the last touch position
        clearTimeout(touchTimeoutRef.current); // Clear any existing timeout
        SoundManager.startLinkSound(pitch); // Start sound when touch enters
      }
    } else if (isInsideRef.current) {
      // If touch leaves the link area, stop the sound
      clearTimeout(touchTimeoutRef.current); // Clear timeout to prevent overlap
      SoundManager.stopLinkSound(); // Stop sound when touch leaves
      isInsideRef.current = false; // Mark as outside the link
    }
  }, [calculateLinkEnds, pitch]);

  const handleTouchEnd = useCallback(() => {
    if (isInsideRef.current) {
      touchTimeoutRef.current = setTimeout(() => {
        SoundManager.stopLinkSound(); // Stop sound when touch ends
        isInsideRef.current = false; // Mark as outside the link
        lastTouchPositionRef.current = null; // Reset last touch position
      }, 100); // Debounce to avoid abrupt cutoffs
    }
  }, []);

  useEffect(() => {
    const handleDocumentTouchMove = (e) => handleTouchMove(e);
    const handleDocumentTouchEnd = (e) => handleTouchEnd(e);
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleDocumentTouchMove);
    document.addEventListener('touchend', handleDocumentTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
      document.removeEventListener('touchend', handleDocumentTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Calculate link visual properties
  const { startX, startY, endX, endY } = calculateLinkEnds();
  const width = !isNaN(startX) && !isNaN(endX) ? calculateDistance(startX, startY, endX, endY) : 0;
  const height = 8;
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2;

  return (
    <>
      {/* Diagonal touch detection area */}
      <rect
        x={centerX - width / 2}
        y={centerY - height / 2}
        width={width}
        height={height}
        onTouchStart={handleTouchStart} // Listen to touch start
        onTouchMove={handleTouchMove} // Listen to touch movements
        onTouchEnd={handleTouchEnd} // Listen to touch end
        transform={`rotate(${angle} ${centerX} ${centerY})`} // Rotate to align with the link
      />

      {/* Render the actual link */}
      <rect
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