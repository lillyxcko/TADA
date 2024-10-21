import { useRef } from 'react';

// Initialize Text-to-Speech (TTS)
const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
};

// Calculate distance between two touch points
const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

// GestureManager to handle touch gestures per node
export const GestureManager = ({ nodeValue, isInsideCircle, infoIndex, r }) => {
  const firstTouchRef = useRef(null); // Store first touch per node
  const secondTouchRef = useRef(null); // Store second touch for TTS
  const isFirstTouchInside = useRef(false); // Track if first touch is inside the node

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0];
      isFirstTouchInside.current = isInsideCircle(firstTouchRef.current.clientX, firstTouchRef.current.clientY);
      secondTouchRef.current = null; // Reset second touch
      infoIndex.current = 0; // Reset index on first touch
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0];
      isFirstTouchInside.current = isInsideCircle(firstTouchRef.current.clientX, firstTouchRef.current.clientY);
    }
  };

  const handleSecondTouch = (e) => {
    if (e.touches.length === 2 && firstTouchRef.current) {
      const secondTouch = e.touches[1]; // Get the second tap
      secondTouchRef.current = secondTouch; // Store second touch
      const distance = getDistance(firstTouchRef.current, secondTouch); // Calculate distance

      // Ensure the first touch is inside the circle and the second is nearby
      if (isFirstTouchInside.current && distance <= r + 200) {
        // Trigger TTS for the current index
        speakValue(nodeValue[infoIndex.current]);

        // Increment index and wrap around
        infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Increment index
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      // No touches left
      firstTouchRef.current = null; // Reset first touch
      secondTouchRef.current = null; // Reset second touch
      infoIndex.current = 0; // Reset index when all fingers are lifted
    } else {
      // Check for any remaining touches
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier !== firstTouchRef.current.identifier) {
          // If there's still a second touch, keep the current index
          return; // Exit early to not reset index
        }
      }
      // If only one finger is left (first finger), allow for the next second tap
      infoIndex.current = 0; // Reset index to start over
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSecondTouch,
  };
};