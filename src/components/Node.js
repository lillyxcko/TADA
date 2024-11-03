import React, { useRef, useState, useCallback } from 'react';
import { SoundManager } from './SoundManager';
import { GestureManager } from './GestureManager';

const Node = ({ id, cx, cy, r, pitch, value }) => {
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

  const handleTouchStart = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const { clientX, clientY, identifier } = touch;

      if (isInsideCircle(clientX, clientY)) {
        SoundManager.startNodeSound(id, pitch);
        setRadius(r + 10);
        gestureManager.handleTouchStart(id, touch);
        gestureManager.handleSecondTouch(id, touch);
      }
    }
  }, [id, pitch, r, isInsideCircle, gestureManager]);

  const handleTouchEnd = useCallback((e) => {
    gestureManager.handleTouchEnd(e);
  }, [gestureManager]);

  return (
    <circle
      ref={circleRef}
      cx={cx}
      cy={cy}
      r={radius}
      fill="lightblue"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
    />
  );
};

export default Node;