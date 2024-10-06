import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SoundManager } from './SoundManager'; // Import the Sound Manager

const Node = ({ cx, cy, r, pitch, value }) => {
  const isInsideRef = useRef(false);
  const circleRef = useRef(null);
  const [radius, setRadius] = useState(r);
  const touchTimeoutRef = useRef(null);

  const isInsideCircle = useCallback((touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;

    const effectiveRadius = r + 60; 
    return distanceSquared < (effectiveRadius ** 2);
  }, [r]);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    for (let touch of e.touches) {
      const touchX = touch.clientX;
      const touchY = touch.clientY;

      if (isInsideCircle(touchX, touchY)) {
        clearTimeout(touchTimeoutRef.current);
        SoundManager.startNodeSound(pitch);
        isInsideRef.current = true;
        setRadius(r + 10);
      }
    }
  }, [pitch, r, isInsideCircle]);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    for (let touch of e.touches) {
      const touchX = touch.clientX;
      const touchY = touch.clientY;
      const isInside = isInsideCircle(touchX, touchY);

      if (isInside && !isInsideRef.current) {
        SoundManager.startNodeSound(pitch);
        isInsideRef.current = true;
        setRadius(r + 10);
      } else if (!isInside && isInsideRef.current) {
        SoundManager.stopNodeSound(pitch);
        isInsideRef.current = false;
        setRadius(r);
      }
    }
  }, [pitch, r, isInsideCircle]);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length === 0) {
      touchTimeoutRef.current = setTimeout(() => {
        SoundManager.stopNodeSound(pitch);
        isInsideRef.current = false;
        setRadius(r);
      }, 100);
    }
  }, [pitch, r]);

  useEffect(() => {
    const handleDocumentTouchMove = (e) => handleTouchMove(e);
    const handleDocumentTouchEnd = (e) => handleTouchEnd(e);

    document.addEventListener('touchmove', handleDocumentTouchMove);
    document.addEventListener('touchend', handleDocumentTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleDocumentTouchMove);
      document.removeEventListener('touchend', handleDocumentTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return (
    <circle
      ref={circleRef}
      cx={cx}
      cy={cy}
      r={radius}
      fill="white"
      fillOpacity={0.8}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: 'pointer', transition: 'r 0.2s ease', touchAction: 'none' }}
    />
  );
};

export default Node;