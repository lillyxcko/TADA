import { useRef } from 'react';

// Initialize Text-to-Speech (TTS)
const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
};

// Calculate the distance between two points (touch and center of the node)
const getDistanceFromCenter = (touch, centerX, centerY) => {
  const dx = touch.clientX - centerX;
  const dy = touch.clientY - centerY;
  return Math.sqrt(dx * dx + dy * dy);
};

// GestureManager to handle touch gestures per node
export const GestureManager = ({ nodeValue, isInsideCircle, infoIndex, cx, cy, r }) => {
  const isFirstTouchInside = useRef(false); // Track if the first touch is inside the node
  const secondTapPending = useRef(false); // Track if we are waiting for second tap release

  // Handle the first touch (dwell)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      // Check if the first touch is inside the node
      isFirstTouchInside.current = isInsideCircle(
        e.touches[0].clientX,
        e.touches[0].clientY
      );

      secondTapPending.current = false; // Reset second tap flag
      infoIndex.current = 0; // Reset index on first touch
    }
  };

  // Handle the movement of the first touch
  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      // Update if the touch is still inside the node's boundary
      isFirstTouchInside.current = isInsideCircle(
        e.touches[0].clientX,
        e.touches[0].clientY
      );
    }
  };

  // Handle the second tap detection
  const handleSecondTouch = (e) => {
    if (e.touches.length === 2 && isFirstTouchInside.current) {
      const secondTouch = e.touches[1]; // Get the second touch point

      // Calculate the distance from the node's center to the second touch
      const distance = getDistanceFromCenter(secondTouch, cx, cy);

      if (distance <= r + 200) {
        secondTapPending.current = true; // Mark the second tap as pending
      }
    }
  };

  // Handle the release of touches
  const handleTouchEnd = (e) => {
    if (secondTapPending.current) {
      // Announce the current value and increment the index
      speakValue(nodeValue[infoIndex.current]);

      // Cycle through the array indices
      infoIndex.current = (infoIndex.current + 1) % nodeValue.length;

      secondTapPending.current = false; // Reset the pending tap flag
    }

    // Reset everything if all fingers are lifted
    if (e.touches.length === 0) {
      isFirstTouchInside.current = false; // Reset the first touch status
      infoIndex.current = 0; // Reset the index
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSecondTouch,
  };
};