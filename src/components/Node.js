import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SoundManager } from './SoundManager';
import { GestureManager } from './GestureManager';

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
  const isHolding = useRef(false); // Track whether the node is being held
  const gestureManager = GestureManager({ nodeId: id, nodeValue: value, infoIndex, r });

  const isInsideCircle = useCallback((touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;
    const effectiveRadius = r + 60;
    return distanceSquared < effectiveRadius ** 2;
  }, [r]);

  const isWithinRadius = useCallback((touchX, touchY) => {
    const circle = circleRef.current.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    const distanceSquared = (touchX - centerX) ** 2 + (touchY - centerY) ** 2;
    const extendedRadius = r + 600;
    return distanceSquared < extendedRadius ** 2;
  }, [r]);


  const handleNodeTouchStart = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      if (isInsideCircle(touch.clientX, touch.clientY)) {
        activeTouches.current.add(touch.identifier);
        SoundManager.startNodeSound(id, pitch);
        setRadius(r + 10);
        gestureManager.handleTouchStart(id, touch);
        isHolding.current = true; // Mark the node as being held
        if (activeTouches.current.size > 1) {
          gestureManager.handleSecondTouch(id, touch);
        }
      }
    }
  }, [id, pitch, r, isInsideCircle, gestureManager]);

  const handleNodeTouchMove = useCallback((e) => {
    // Check if there's an existing active hold on the node
    if (activeTouches.current.size >= 1) {
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const { clientX, clientY, identifier } = touch;
        const isInside = isInsideCircle(clientX, clientY);
        const isNearby = isWithinRadius(clientX, clientY);
        const activeTouchesArray = Array.from(activeTouches.current);
  
        // Manage touch status within the node itself
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
        
        for (const activeTouchId of activeTouchesArray) {
          const activeTouch = e.touches.find(t => t.identifier === activeTouchId);
          if (activeTouch) {
            // If the touch is within the valid area of any active node
            if (isNearby) {
              gestureManager.handleSecondTouch(id, touch); // Send to GestureManager
              break; // Exit once a valid touch is identified
            }
          }
        }

      }
    }
  }, [id, pitch, r, isInsideCircle, isWithinRadius, gestureManager]);

  const handleNodeTouchEnd = useCallback((e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const { identifier } = e.changedTouches[i];
      activeTouches.current.delete(identifier);

      if (activeTouches.current.size === 0) {
        SoundManager.stopNodeSound(id);
        setRadius(r);
        isHolding.current = false; 
        infoIndex.current = 0; // Reset index when the touch ends
      }
    }
    gestureManager.handleTouchEnd(e); // Ensure TTS logic is handled
  }, [id, r, gestureManager]);

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
