import { useRef } from 'react';

// Initialize Text-to-Speech (TTS) functionality
const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
};

// Calculate the distance between two touch points 
const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// GestureManager component to handle multi-touch gestures
export const GestureManager = ({ cx, cy, nodeValue, isInsideCircle, infoIndex, r }) => {
  const firstTouchRef = useRef(null); // Store the first touch event (dwell)
  
  // Handle first touch (dwell)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0]; // Store the first finger touch (dwell)
    }
  };
  
  // Update the first touch reference as the finger moves
  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0]; // Update the stored touch point
    }
  };
  
  // Handle tap to speak value
  const handleSecondTouch = (e) => {
    if (e.touches.length === 2 && firstTouchRef.current) {
      const secondTouch = e.touches[1];
      
      // Use the getDistance function to calculate the distance from the first touch to the center of the node
      const distanceToNodeCenter = getDistance(firstTouchRef.current, { clientX: cx, clientY: cy });
      
      // Check if the second touch is within 200 pixels from the edge of the node
      if (distanceToNodeCenter <= r + 200) {
        // Cycle through information on each second tap
        speakValue(nodeValue[infoIndex.current]); // Announce the current information
        infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Cycle index
      }
    }
  };
  
  // Reset the second tap when the second finger is lifted, allowing TTS to trigger again
  const handleTouchEnd = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = null; // Reset first finger dwell
    }
  
    // Reset everything if the first finger is lifted
    if (e.touches.length === 0) {
      firstTouchRef.current = null; // Reset first finger dwell
      infoIndex.current = 0; // Reset index for the next use
    }
  };
  
  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSecondTouch,
    speakValue,
  };
};