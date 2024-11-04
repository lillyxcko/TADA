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
        if (isInsideCircle(touch.clientX, touch.clientY)) {
            activeTouches.current.add(touch.identifier);
            SoundManager.startNodeSound(id, pitch);
            setRadius(r + 10);
            gestureManager.handleTouchStart(id, touch);
            isHolding.current = true; // Mark the node as being held
            gestureManager.handleSecondTouch(id, touch); // Still call but after marking hold
        }
    }
}, [id, pitch, r, isInsideCircle, gestureManager]);

  const handleNodeTouchMove = useCallback((e) => {
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const { clientX, clientY, identifier } = touch;
      const isInside = isInsideCircle(clientX, clientY);
  
      // Check if the touch is entering the node area
      if (isInside && !activeTouches.current.has(identifier)) {
        activeTouches.current.add(identifier);
        SoundManager.startNodeSound(id, pitch);
        setRadius(r + 10);
        gestureManager.handleTouchStart(id, touch);
      } 
      // Check if the touch is exiting the node area
      else if (!isInside && activeTouches.current.has(identifier)) {
        activeTouches.current.delete(identifier);
        SoundManager.stopNodeSound(id);
        setRadius(r);
      }
  
      // If there are two or more active touches, check their distances
      if (activeTouches.current.size >= 2) {
        const activeTouchesArray = Array.from(activeTouches.current); // Convert the Set to an array
        
        // Check proximity for each active touch
        for (const activeTouchId of activeTouchesArray) {
          const activeTouch = e.touches.find(t => t.identifier === activeTouchId);
          if (activeTouch) {
            const distance = getDistance(
              { clientX: activeTouch.clientX, clientY: activeTouch.clientY }, 
              { clientX: clientX, clientY: clientY }
            );
  
            // If the current touch is within 200px of any active touch, trigger handleSecondTouch
            if (distance <= 200) {
              gestureManager.handleSecondTouch(id, touch); // Pass the current touch
              break; // Exit the loop once a valid touch has been found
            }
          }
        }
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
            isHolding.current = false; // Mark the node as not being held
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