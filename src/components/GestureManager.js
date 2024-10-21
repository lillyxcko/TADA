import { useRef } from 'react';

// Initialize Text-to-Speech (TTS)
const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
};

const getDistanceFromNodeEdge = (touch, cx, cy, r) => {
  const dx = touch.clientX - cx;
  const dy = touch.clientY - cy;
  const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
  return distanceFromCenter - r; // Distance from the edge, not center
};

// GestureManager to handle touch gestures per node
export const GestureManager = ({ nodeValue, isInsideCircle, infoIndex, cx, cy, r }) => {
  const isFirstTouchInside = useRef(false); // Track if the first touch is inside the node
  const secondTapPending = useRef(false); // Track if a second tap is pending

  // Handle the first touch (dwell)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isFirstTouchInside.current = isInsideCircle(
        e.touches[0].clientX,
        e.touches[0].clientY
      );
      secondTapPending.current = false; // Reset second tap flag
      infoIndex.current = 0; // Reset index
    }
  };

  // Handle touch movement
  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      isFirstTouchInside.current = isInsideCircle(
        e.touches[0].clientX,
        e.touches[0].clientY
      );
    }
  };

  // Handle the second tap
  const handleSecondTouch = (e) => {
    if (e.touches.length === 2 && isFirstTouchInside.current) {
      const secondTouch = e.touches[1];

      // Calculate the distance from the second touch to the closest node edge
      const distance = getDistanceFromNodeEdge(secondTouch, cx, cy, r);

      // Check if the second touch is within the 200px margin from the node's edge
      if (distance <= 200) {
        secondTapPending.current = true; // Mark second tap as pending
      }
    }
  };

  // Handle touch release
  const handleTouchEnd = (e) => {
    if (secondTapPending.current) {
      speakValue(nodeValue[infoIndex.current]); // Announce the current value

      // Cycle through the values
      infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
      secondTapPending.current = false; // Reset second tap flag
    }

    // Reset when all fingers are lifted
    if (e.touches.length === 0) {
      isFirstTouchInside.current = false; // Reset first touch status
      infoIndex.current = 0; // Reset index
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSecondTouch,
  };
};