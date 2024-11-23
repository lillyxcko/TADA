import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SoundManager } from './SoundManager';
import { GestureManager } from './GestureManager';

const Node = ({ id, cx, cy, r, pitch, value }) => {
  const activeTouches = useRef(new Map()); // Maps fingerId to nodeId
  const circleRef = useRef(null);
  const [radius, setRadius] = useState(r);
  const infoIndex = useRef(0);
  const gestureManager = GestureManager({ nodeId: id, nodeValue: value, infoIndex, r, activeTouches });

  const isInsideCircle = useCallback(
    (touchX, touchY) => {
      const circle = circleRef.current.getBoundingClientRect();
      const centerX = circle.left + circle.width / 2;
      const centerY = circle.top + circle.height / 2;
      const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;
      const extendedRadius = r + 25;
      return distanceSquared <= extendedRadius ** 2;
    },
    [r]
  );

  const isWithinRadius = useCallback(
    (touchX, touchY) => {
      const circle = circleRef.current.getBoundingClientRect();
      const centerX = circle.left + circle.width / 2;
      const centerY = circle.top + circle.height / 2;
      const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;
      const extendedRadius = r + 50;
      return distanceSquared <= extendedRadius ** 2;
    },
    [r]
  );

  const handleNodeTouchStart = useCallback(
    (e) => {
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const { clientX, clientY, identifier } = touch;

        if (isInsideCircle(clientX, clientY)) {
          activeTouches.current.set(identifier, id);
          SoundManager.startNodeSound(id, pitch);
          setRadius(r + 10);
          gestureManager.handleTouchStart(id, touch);
        }
      }
    },
    [id, pitch, r, isInsideCircle, gestureManager]
  );

  const handleNodeTouchMove = useCallback(
    (e) => {
      for (const touch of e.touches) {
        const { clientX, clientY, identifier } = touch;
        const isInside = isInsideCircle(clientX, clientY);
        const isNearby = isWithinRadius(clientX, clientY);

        if (isInside) {
          activeTouches.current.set(identifier, id);
          SoundManager.startNodeSound(id, pitch);
          setRadius(r + 10);
          gestureManager.handleTouchMove(id, touch);
        } else if (activeTouches.current.has(identifier)) {
          activeTouches.current.delete(identifier);
          SoundManager.stopNodeSound(id);
          setRadius(r);
        }

        if (isNearby && activeTouches.current.size > 0) {
          gestureManager.handleAdditionalTouch(id, touch);
        }
      }
    },
    [id, pitch, r, isInsideCircle, isWithinRadius, gestureManager]
  );

  const handleNodeTouchEnd = useCallback(
    (e) => {
      for (const changedTouch of e.changedTouches) {
        const { identifier } = changedTouch;
        activeTouches.current.delete(identifier);

        if (activeTouches.current.size === 0) {
          SoundManager.stopNodeSound(id);
          setRadius(r);
          infoIndex.current = 0;
        }
      }
      gestureManager.handleTouchEnd(e);
    },
    [id, r, gestureManager]
  );

  useEffect(() => {
    document.addEventListener('touchend', handleNodeTouchEnd);
    document.addEventListener('touchmove', handleNodeTouchMove);

    return () => {
      document.removeEventListener('touchend', handleNodeTouchEnd);
      document.removeEventListener('touchmove', handleNodeTouchMove);
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