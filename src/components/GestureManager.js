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
export const GestureManager = ({ cx, cy, nodeValue }) => {
    const firstTouchRef = useRef(null); // Store the first touch event (dwell)
    const lastSecondTapRef = useRef(null); // Store the last second tap identifier
  
    // Handle first touch (dwell)
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        firstTouchRef.current = e.touches[0]; // Store the first finger touch (dwell)
        lastSecondTapRef.current = null; // Reset second tap tracking
      }
    };
  
    // Update the first touch reference as the finger moves
    const handleTouchMove = (e) => {
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          firstTouchRef.current = touch; // Update the stored touch point
      
          // Flag to track if a node value has been announced
          let announced = false; 
      
          // Check if the first touch is inside any node
          nodes.forEach((node) => {
            if (isPointInsideCircle(touch.clientX, touch.clientY, node.cx, node.cy, node.r) && !announced) {
              speakValue(node.value); // Announce the value of the corresponding node
              announced = true; // Set flag to prevent further announcements
            }
          });
        }
        handleSecondTouch(e); // Check for second tap during movement
      };
  
    // Handle second tap within a 200px radius of the node
    const handleSecondTouch = (e) => {
      if (e.touches.length === 2 && firstTouchRef.current) {
        const secondTouch = e.touches[1];
        const distance = getDistance(firstTouchRef.current, secondTouch);
  
        // Trigger TTS only if this is a new second tap
        if (distance <= 200 && lastSecondTapRef.current !== secondTouch.identifier) {
          speakValue(nodeValue); // Announce the value of the node
          lastSecondTapRef.current = secondTouch.identifier; // Track the second tap
        }
      }
    };
  
    // Reset the second tap when the second finger is lifted, allowing TTS to trigger again
    const handleTouchEnd = (e) => {
      if (e.touches.length === 1) {
        lastSecondTapRef.current = null; // Allow new second taps to trigger TTS
      }
  
      // Reset everything if the first finger is lifted
      if (e.touches.length === 0) {
        firstTouchRef.current = null; // Reset first finger dwell
        lastSecondTapRef.current = null; // Reset second tap tracking
      }
    };
  
    return {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    };
  };