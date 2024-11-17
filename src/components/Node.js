import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SoundManager } from './SoundManager';
import { GestureManager } from './GestureManager';

// Calculate distance between two touches
const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const Node = ({ id, cx, cy, r, pitch, value }) => {
  const activeTouches = useRef(new Set());
  const circleRef = useRef(null);
  const [radius, setRadius] = useState(r);
  const infoIndex = useRef(0);
  const gestureManager = GestureManager({ nodeId: id, nodeValue: value, infoIndex, r, activeTouches });

  // Check if a touch is inside the node's main area
  const isInsideCircle = useCallback((touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;
    const extendedRadius = r + 25;
    return distanceSquared <= extendedRadius ** 2;
  }, [r]);

  // Check if a touch is within an extended radius around the node
  const isWithinRadius = useCallback((touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;
    const extendedRadius = r + 10;
    return distanceSquared <= extendedRadius ** 2;
  }, [r]);

  // Handle initial touch events on the node
  const handleNodeTouchStart = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const { clientX, clientY, identifier } = touch;
      const isInside = isInsideCircle(clientX, clientY);
      
      if (isInside) {
        activeTouches.current.add(identifier);
        SoundManager.startNodeSound(id, pitch);
        setRadius(r + 10);
        gestureManager.handleTouchStart(id, touch);     
      }
    }
  }, [id, pitch, r, isInsideCircle, gestureManager]);

  // Track touch movements and check for proximity triggers
  const handleNodeTouchMove = useCallback((e) => {
    for (const touch of e.touches) {
      const { identifier, clientX, clientY } = touch;
      gestureManager.handleTouchMove(id, touch); // Pass touch to GestureManager
  
      // Handle proximity triggers as before
      const isInside = isInsideCircle(clientX, clientY);
      const isNearby = isWithinRadius(clientX, clientY);
  
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
  
      if (isNearby && activeTouches.current.size > 0) {
        gestureManager.handleSecondTouch(id, touch);
      }
    }
  }, [id, pitch, r, isInsideCircle, isWithinRadius, gestureManager]);

  // Handle end of touch events, including TTS if applicable
  const handleNodeTouchEnd = useCallback((e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const { identifier } = e.changedTouches[i];
      activeTouches.current.delete(identifier);

      // Reset the node sound and radius if all touches have ended
      if (activeTouches.current.size === 0) {
        SoundManager.stopNodeSound(id);
        setRadius(r);
        infoIndex.current = 0; // Reset index when all touches end
      }
    }
    gestureManager.handleTouchEnd(e); // Ensure TTS logic is handled
  }, [id, r, gestureManager]);

  // Set up and tear down touch event listeners
  useEffect(() => {
    document.addEventListener('touchend', handleNodeTouchEnd);
    document.addEventListener('touchmove', handleNodeTouchMove);

    return () => {
      document.removeEventListener('touchend', handleNodeTouchEnd);
      document.removeEventListener('touchmove', handleNodeTouchMove);
    };
  }, [handleNodeTouchEnd, handleNodeTouchMove]);

  return (
    <g>
      {/* Visualization of the detection range for isWithinRadius */}
      <circle
        cx={cx}
        cy={cy}
        r={r + 35}
        fill="none"
        stroke="orange"
        strokeDasharray="5,5"
        strokeWidth="1"
      />
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
    </g>
  );
};

export default Node;