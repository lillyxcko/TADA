import React, { useRef, useEffect, useCallback } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager

const Link = ({ x1, y1, x2, y2, pitch }) => {
  const isInsideRef = useRef(false); // Track if the touch is inside the circle
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

    // Squared distance from the touch point to the closest point on the line
    const distanceSquared = (touchX - closestX) ** 2 + (touchY - closestY) ** 2;

    // Check if the distance is within the link height (squared)
    return distanceSquared <= (linkHeight / 2) ** 2;
  }, [x1, y1, x2, y2, linkHeight]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    isInsideRef.current = false;
    SoundManager.stopLinkSound(pitch); // Stop sound after touch ends
  }, [pitch]);

  const handleTouchStart = useCallback((e) => {
    const svg = lineRef.current.ownerSVGElement;
    const point = svg.createSVGPoint();

    point.x = e.touches[0].clientX;
    point.y = e.touches[0].clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    const touchX = svgPoint.x;
    const touchY = svgPoint.y;

    if (isInsideLink(touchX, touchY)) {
      isInsideRef.current = true;
      SoundManager.startLinkSound(pitch); // Play sound when touch starts
    }
  }, [pitch, isInsideLink]);

  // Debounce function for touchmove
  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const handleTouchMove = useCallback(debounce((e) => {
    const svg = lineRef.current.ownerSVGElement;
    const point = svg.createSVGPoint();

    point.x = e.touches[0].clientX;
    point.y = e.touches[0].clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());

    const touchX = svgPoint.x;
    const touchY = svgPoint.y;

    const isInside = isInsideLink(touchX, touchY);

    if (isInside && !isInsideRef.current) {
      isInsideRef.current = true;
      SoundManager.startLinkSound(pitch);
    } else if (!isInside && isInsideRef.current) {
      isInsideRef.current = false;
      SoundManager.stopLinkSound(pitch);
    }
  }, 5), [isInsideLink, pitch]); // debounce delay

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