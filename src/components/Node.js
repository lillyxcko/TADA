import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SoundManager } from './SoundManager';
import { GestureManager } from './GestureManager';

const Node = ({ id, cx, cy, r, pitch, value }) => {
  const activeTouches = useRef(new Set()); // Track active touches
  const circleRef = useRef(null); // Ref to circle element
  const [radius, setRadius] = useState(r); // State to handle radius
  const infoIndex = useRef(0); // Track which piece of info to announce

  const isInsideCircle = useCallback((touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;
    const effectiveRadius = r + 60;
    return distanceSquared < effectiveRadius ** 2;
  }, [r]);

  // Initialize GestureManager with necessary properties
  const {
    handleTouchStart: gestureTouchStart,
    handleTouchMove: gestureTouchMove,
    handleTouchEnd: gestureTouchEnd,
    handleSecondTouch,
  } = GestureManager({
    nodeId: id,
    nodeValue: value,
    isInsideCircle,
    infoIndex,
  });

  const handleTouchStart = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touchX = e.touches[i].clientX;
      const touchY = e.touches[i].clientY;
      if (isInsideCircle(touchX, touchY)) {
        activeTouches.current.add(e.touches[i].identifier);
        SoundManager.startNodeSound(id, pitch);
        setRadius(r + 10);
        gestureTouchStart(id, e.touches[i]); // Pass node ID and touch
      }
    }
  }, [id, pitch, r, isInsideCircle, gestureTouchStart]);

  const handleTouchMove = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touchX = e.touches[i].clientX;
      const touchY = e.touches[i].clientY;
      const isInside = isInsideCircle(touchX, touchY);

      if (isInside && !activeTouches.current.has(e.touches[i].identifier)) {
        activeTouches.current.add(e.touches[i].identifier);
        SoundManager.startNodeSound(id, pitch);
        setRadius(r + 10);
      } else if (!isInside && activeTouches.current.has(e.touches[i].identifier)) {
        activeTouches.current.delete(e.touches[i].identifier);
        SoundManager.stopNodeSound(id);
        setRadius(r);
      }
    }
    gestureTouchMove(id, e); // Pass node ID to GestureManager
  }, [id, pitch, r, isInsideCircle, gestureTouchMove]);

  const handleTouchEnd = useCallback((e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const identifier = e.changedTouches[i].identifier;
      if (activeTouches.current.has(identifier)) {
        activeTouches.current.delete(identifier);
        if (activeTouches.current.size === 0) {
          SoundManager.stopNodeSound(id);
          setRadius(r);
        }
      }
    }
    gestureTouchEnd(id, e); // Pass node ID to GestureManager
  }, [id, r, gestureTouchEnd]);

  useEffect(() => {
    const handleDocumentTouchEnd = (e) => handleTouchEnd(e);
    const handleDocumentTouchMove = (e) => handleTouchMove(e);

    document.addEventListener('touchend', handleDocumentTouchEnd);
    document.addEventListener('touchmove', handleDocumentTouchMove);

    return () => {
      document.removeEventListener('touchend', handleDocumentTouchEnd);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
    };
  }, [handleTouchEnd, handleTouchMove]);

  return (
    <circle
      ref={circleRef}
      cx={cx}
      cy={cy}
      r={radius}
      fill="lightblue"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
    />
  );
};

export default Node;