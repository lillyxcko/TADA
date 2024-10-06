import React, { useRef, useEffect, useCallback } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager

const Link = ({ x1, y1, x2, y2, pitch }) => {
  const activeTouches = useRef(new Set()); // Track active touches
  const lineRef = useRef(null); // Ref for the rectangle
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); // Length of the link
  const angle = Math.atan2(y2 - y1, x2 - x1); // Angle in radians
  const linkHeight = 5; // Set a constant height for the link

  // Calculate the position to place the rectangle
  const rectX = x1;
  const rectY = y1;

  const isInsideLink = useCallback((touchX, touchY) => {
    // Translate the touch point relative to the first endpoint of the line
    const dx = touchX - x1;
    const dy = touchY - y1;

    // Project the touch point onto the line by finding the closest point on the line
    const lineDx = x2 - x1;
    const lineDy = y2 - y1;
    const lineLengthSquared = lineDx * lineDx + lineDy * lineDy;

    // Parametric position on the line (0 = start, 1 = end)
    const t = Math.max(0, Math.min(1, (dx * lineDx + dy * lineDy) / lineLengthSquared));

    // Closest point on the line to the touch point
    const closestX = x1 + t * lineDx;
    const closestY = y1 + t * lineDy;

    // Distance from the touch point to the closest point on the line
    const distance = Math.sqrt((touchX - closestX) ** 2 + (touchY - closestY) ** 2);

    // Check if the distance is within the link height (which is half height around the line)
    return distance <= linkHeight / 2;
  }, [x1, y1, x2, y2, linkHeight]);

  const handleTouchStart = useCallback((e) => {
    const svg = lineRef.current.ownerSVGElement;
    for (let i = 0; i < e.touches.length; i++) {
      const point = svg.createSVGPoint();
      point.x = e.touches[i].clientX;
      point.y = e.touches[i].clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

      const touchX = svgPoint.x;
      const touchY = svgPoint.y;

      if (isInsideLink(touchX, touchY)) {
        activeTouches.current.add(e.touches[i].identifier); // Store the touch identifier
        SoundManager.startLinkSound(pitch); // Play sound when touch starts
      }
    }
  }, [pitch, isInsideLink]);

  const handleTouchMove = useCallback((e) => {
    const svg = lineRef.current.ownerSVGElement;
    for (let i = 0; i < e.touches.length; i++) {
      const point = svg.createSVGPoint();
      point.x = e.touches[i].clientX;
      point.y = e.touches[i].clientY;
      const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

      const touchX = svgPoint.x;
      const touchY = svgPoint.y;

      const isInside = isInsideLink(touchX, touchY);
      
      if (isInside && !activeTouches.current.has(e.touches[i].identifier)) {
        activeTouches.current.add(e.touches[i].identifier);
        SoundManager.startLinkSound(pitch); // Start sound when touch enters
      } else if (!isInside && activeTouches.current.has(e.touches[i].identifier)) {
        activeTouches.current.delete(e.touches[i].identifier);
        SoundManager.stopLinkSound(pitch); // Stop sound when touch leaves
      }
    }
  }, [isInsideLink, pitch]);

  const handleTouchEnd = useCallback((e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const identifier = e.changedTouches[i].identifier;
      if (activeTouches.current.has(identifier)) {
        activeTouches.current.delete(identifier); // Remove the touch identifier
        if (activeTouches.current.size === 0) {
          SoundManager.stopLinkSound(pitch); // Stop sound if no active touches remain
        }
      }
    }
  }, [pitch]);

  useEffect(() => {
    const handleDocumentTouchEnd = (e) => handleTouchEnd(e);
    const handleDocumentTouchMove = (e) => handleTouchMove(e);

    document.addEventListener('touchend', handleDocumentTouchEnd);
    document.addEventListener('touchmove', handleDocumentTouchMove);

    return () => {
      document.removeEventListener('touchend', handleDocumentTouchEnd);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
    };
  }, [handleTouchEnd, handleTouchMove]); // Include dependencies here

  return (
    <rect
      ref={lineRef}
      x={rectX}
      y={rectY}
      width={length}
      height={linkHeight}
      fill="white"
      transform={`rotate(${angle * (180 / Math.PI)}, ${x1}, ${y1})`} // Rotate around the start point
      onTouchStart={handleTouchStart} // Handle touch start
      onTouchEnd={handleTouchEnd} // Handle touch end
      style={{ cursor: 'pointer', transition: 'width 0.2s ease', touchAction: 'none' }} // Add transition effects
    />
  );
};

export default Link;