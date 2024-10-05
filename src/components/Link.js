import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager

const Link = ({ x1, y1, x2, y2, pitch }) => {
  const lineRef = useRef(null); // Ref for the rectangle
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); // Length of the link
  const angle = Math.atan2(y2 - y1, x2 - x1); // Angle in radians
  const linkHeight = 5; // Set a constant height for the link

  // Calculate the position to place the rectangle
  const rectX = x1;
  const rectY = y1;

  // Check if the touch is inside the link
  const isInsideLink = useCallback((touchX, touchY) => {
    if (!lineRef.current) return false;

    // Get the bounding rectangle of the transformed link
    const rect = lineRef.current.getBoundingClientRect();

    // Calculate the center of the link
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Translate the touch coordinates to the link's local space
    const translatedX = (touchX - centerX) * Math.cos(-angle) - (touchY - centerY) * Math.sin(-angle);
    const translatedY = (touchX - centerX) * Math.sin(-angle) + (touchY - centerY) * Math.cos(-angle);

    // Check if the touch coordinates are within the bounds of the rectangle considering its height
    return (
      translatedX >= 0 &&
      translatedX <= length &&
      Math.abs(translatedY) <= linkHeight 
    );
  }, [length, linkHeight, angle]);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    console.log("handletouch");
    if (isInsideLink(touchX, touchY)) {
      console.log("Touch is inside the link");
      SoundManager.startLinkSound(pitch); // Play sound when touch starts
    }
  }, [pitch, isInsideLink]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    SoundManager.stopLinkSound(pitch); // Stop sound after touch ends
  }, [pitch]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    console.log("handlemove");

    const isInside = isInsideLink(touchX, touchY);

    if (isInside) {
      console.log('Touch is inside the link');
      SoundManager.startLinkSound(pitch); 
    } else {
      SoundManager.stopLinkSound(pitch);
    }
  }, [isInsideLink, pitch]);

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