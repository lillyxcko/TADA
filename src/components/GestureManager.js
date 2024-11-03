import { useRef } from 'react';
import { TextToSpeechManager } from './TextToSpeechManager';

// GestureManager to manage multiple nodes independently
export function GestureManager({ nodeId, nodeValue, infoIndex, radius, center }) {
  const activeTouches = useRef(new Map()); // Track active touches for each node by ID
  const activeTTS = useRef(false); // Track TTS lock for non-stacking TTS
  
  // Handle the start of a touch on a node
  function handleTouchStart(nodeId, touch) {
    if (!activeTouches.current.has(nodeId)) {
      activeTouches.current.set(nodeId, new Set());
    }
    activeTouches.current.get(nodeId).add(touch.identifier); // Add touch by ID
  }

  // Handle adjacent taps within a 200px radius of the node’s center
  function handleAdjacentTap(nodeId, touch) {
    const touchPoint = { x: touch.clientX, y: touch.clientY };
    const distance = getDistance(center, touchPoint);
    
    // Only trigger TTS if within 200px and TTS is not active
    if (distance <= 200 && !activeTTS.current) {
      activeTTS.current = true; // Lock TTS for non-stacking
      const value = nodeValue[infoIndex.current]; // Get current value to announce
      
      // Speak the value and release the lock once done
      TextToSpeechManager.speak(value, () => {
        activeTTS.current = false; // Unlock TTS after completion
      });
      
      // Cycle to the next value in the array
      infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
    }
  }

  // Handle movement within the node’s area; keep track of whether it’s still in range
  function handleTouchMove(nodeId, touch) {
    const touchPoint = { x: touch.clientX, y: touch.clientY };
    const distance = getDistance(center, touchPoint);

    if (distance > radius + 60) {
      // If the touch moves out of the node range, stop sound and remove touch
      activeTouches.current.get(nodeId).delete(touch.identifier);
      if (activeTouches.current.get(nodeId).size === 0) {
        // If no active touches remain for the node, reset TTS and sound
        SoundManager.stopNodeSound(nodeId);
        infoIndex.current = 0; // Reset cycle index
      }
    }
  }

  // Handle the end of a touch
  function handleTouchEnd(nodeId, touch) {
    if (activeTouches.current.has(nodeId)) {
      activeTouches.current.get(nodeId).delete(touch.identifier);
      
      // If all touches are lifted, stop sound and reset cycle index
      if (activeTouches.current.get(nodeId).size === 0) {
        SoundManager.stopNodeSound(nodeId);
        infoIndex.current = 0; // Reset cycle index on full lift
        activeTouches.current.delete(nodeId); // Remove the node from active tracking
      }
    }
  }

  return {
    handleTouchStart,
    handleAdjacentTap,
    handleTouchMove,
    handleTouchEnd,
  };
}

// Utility function to calculate distance between two points
function getDistance(point1, point2) {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}