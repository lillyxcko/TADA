import React, { useRef, useEffect, useCallback } from 'react';
import { SoundManager } from './SoundManager'; // Import SoundManager for link sounds

const Link = ({ nodeA, nodeB, pitch }) => {
  const isInsideRef = useRef(false); // Track if the touch is inside the link
  const lastTouchPositionRef = useRef(null); // Store the last touch position for swiping

  // Function to calculate the distance between two points
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  // Calculate the link's start and end coordinates
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
    const svgElement = document.querySelector('svg');
    const pt = svgElement.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const svgPoint = pt.matrixTransform(svgElement.getScreenCTM().inverse());
    return { x: svgPoint.x, y: svgPoint.y };
  };

  // Create a bounding box for the link
  const createBoundingBox = (startX, startY, endX, endY, thickness) => {
    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;
    const width = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) + thickness; // Add some buffer for touch detection
    const height = thickness;

    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

    return {
      x: centerX - width / 2,
      y: centerY - height / 2,
      width,
      height,
      angle,
    };
  };

  const handleTouchStart = useCallback((e) => {
    const { startX, startY, endX, endY } = calculateLinkEnds();
    const touch = e.touches[0];
    const { x: touchX, y: touchY } = convertToSVGCoords(touch.clientX, touch.clientY);

    const boundingBox = createBoundingBox(startX, startY, endX, endY, 20); // Thickness for touch detection

    if (touchX >= boundingBox.x && touchX <= boundingBox.x + boundingBox.width &&
        touchY >= boundingBox.y && touchY <= boundingBox.y + boundingBox.height) {
      isInsideRef.current = true; // Mark as inside the link
      lastTouchPositionRef.current = { x: touchX, y: touchY }; // Set the last touch position
      SoundManager.startLinkSound(pitch); // Start sound when touch enters
    }
  }, [calculateLinkEnds, pitch]);

  const handleTouchMove = useCallback((e) => {
    const { startX, startY, endX, endY } = calculateLinkEnds();
    const touch = e.touches[0];
    const { x: touchX, y: touchY } = convertToSVGCoords(touch.clientX, touch.clientY);

    // Record the path of the touch
    if (lastTouchPositionRef.current) {
      const lastTouchX = lastTouchPositionRef.current.x;
      const lastTouchY = lastTouchPositionRef.current.y;

      // Check if the current touch position intersects with the link bounding box
      const boundingBox = createBoundingBox(startX, startY, endX, endY, 20);

      // Interpolating between last touch and current touch
      const interpolationSteps = Math.ceil(calculateDistance(lastTouchX, lastTouchY, touchX, touchY) / 5); // Interpolating every 5 units

      for (let i = 1; i <= interpolationSteps; i++) {
        const t = i / interpolationSteps;
        const interpolatedX = lastTouchX + t * (touchX - lastTouchX);
        const interpolatedY = lastTouchY + t * (touchY - lastTouchY);

        if (interpolatedX >= boundingBox.x && interpolatedX <= boundingBox.x + boundingBox.width &&
            interpolatedY >= boundingBox.y && interpolatedY <= boundingBox.y + boundingBox.height) {
          SoundManager.startLinkSound(pitch); // Play sound if the interpolated point crosses the bounding box
          break; // Stop further checks since we've detected an intersection
        }
      }
    }

    // Finally, update last touch position to the current one
    lastTouchPositionRef.current = { x: touchX, y: touchY };
  }, [calculateLinkEnds, pitch]);

  const handleTouchEnd = useCallback(() => {
    isInsideRef.current = false; // Mark as outside the link
    lastTouchPositionRef.current = null; // Reset last touch position
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
  const height = 8; // Width of the visual link
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  
  return (
    <>
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