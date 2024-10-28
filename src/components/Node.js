import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SoundManager } from './SoundManager';
import { GestureManager } from './GestureManager';

const Node = ({ id, cx, cy, r, pitch, value }) => {
  const activeTouches = useRef(new Set());
  const circleRef = useRef(null);
  const [radius, setRadius] = useState(r);
  const infoIndex = useRef(0);

  const gestureManager = GestureManager({ nodeId: id, nodeValue: value, infoIndex, r });

  const isInsideCircle = useCallback((touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;
    const effectiveRadius = r + 60;
    return distanceSquared < effectiveRadius ** 2;
  }, [r]);

  const handleNodeTouchStart = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const { clientX, clientY, identifier } = touch;

      if (isInsideCircle(clientX, clientY)) {
        activeTouches.current.add(identifier);
        SoundManager.startNodeSound(id, pitch);
        setRadius(r + 10);
        gestureManager.handleTouchStart(id, touch);
        gestureManager.handleSecondTouch(id, touch); // Check for valid second touch immediately
      }
    }
  }, [id, pitch, r, isInsideCircle, gestureManager]);

  const handleNodeTouchMove = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const { clientX, clientY, identifier } = touch;
      const isInside = isInsideCircle(clientX, clientY);

      if (isInside && !activeTouches.current.has(identifier)) {
        activeTouches.current.add(identifier);
        SoundManager.startNodeSound(id, pitch);
        setRadius(r + 10);
        gestureManager.handleTouchStart(id, touch); 
      } else if (!isInside && activeTouches.current.has(identifier)) {
        activeTouches.current.delete(identifier);
        SoundManager.stopNodeSound(id);
        setRadius(r);
      }

      if (e.touches.length === 2) {
        gestureManager.handleSecondTouch(id, e.touches[1]); // Pass node id to handleSecondTouch
      }
    }
  }, [id, pitch, r, isInsideCircle, gestureManager]);

  const handleNodeTouchEnd = useCallback((e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const { identifier } = e.changedTouches[i];
      activeTouches.current.delete(identifier);

      if (activeTouches.current.size === 0) {
        SoundManager.stopNodeSound(id);
        setRadius(r);
      }
    }
    gestureManager.handleTouchEnd(e); // This handles TTS logic
  }, [id, r, gestureManager]);

  useEffect(() => {
    const handleDocumentTouchEnd = (e) => handleNodeTouchEnd(e);
    const handleDocumentTouchMove = (e) => handleNodeTouchMove(e);

    document.addEventListener('touchend', handleDocumentTouchEnd);
    document.addEventListener('touchmove', handleDocumentTouchMove);

    return () => {
      document.removeEventListener('touchend', handleDocumentTouchEnd);
      document.removeEventListener('touchmove', handleDocumentTouchMove);
    };
  }, [handleNodeTouchEnd, handleNodeTouchMove]);

  return (
    <circle
      ref={circleRef}
      cx={cx}
      cy={cy}
      r={radius}
      fill="lightblue"
      onTouchStart={handleNodeTouchStart}
      onTouchEnd={handleNodeTouchEnd}
      onTouchMove={handleNodeTouchMove}
      style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
    />
  );
};

export default Node;