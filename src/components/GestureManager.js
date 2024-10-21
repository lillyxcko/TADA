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
  const firstTouchRef = useRef(null); // Store first touch (dwell)
  const isFirstTouchInside = useRef(false); // Track if the first touch is inside the node
  const secondTapPending = useRef(false); // Track if we are waiting for second tap release

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0]; // Store the first touch
      isFirstTouchInside.current = isInsideCircle(
        firstTouchRef.current.clientX,
        firstTouchRef.current.clientY
      ); // Check if inside node
      secondTapPending.current = false; // Reset pending tap flag
      infoIndex.current = 0; // Reset index on first touch
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0]; // Update first touch coordinates
      isFirstTouchInside.current = isInsideCircle(
        firstTouchRef.current.clientX,
        firstTouchRef.current.clientY
      );
    }
  };

  const handleTouchEnd = (e) => {
    if (secondTapPending.current) {
      // If a second tap was detected and this is its release
      speakValue(nodeValue[infoIndex.current]); // Announce current value

      // Increment index, cycling if needed
      infoIndex.current = (infoIndex.current + 1) % nodeValue.length;

      secondTapPending.current = false; // Reset pending tap flag
    }

    // Reset everything if all fingers are lifted
    if (e.touches.length === 0) {
      firstTouchRef.current = null; // Reset first touch
      infoIndex.current = 0; // Reset index when all fingers are lifted
    }
  };

  const handleSecondTouch = (e) => {
    if (e.touches.length === 2 && firstTouchRef.current) {
      const secondTouch = e.touches[1]; // Store second touch
      const distance = getDistance(firstTouchRef.current, secondTouch); // Calculate distance

      // Confirm this is a valid second tap
      if (isFirstTouchInside.current && distance <= r + 200) {
        secondTapPending.current = true; // Mark tap as pending (wait for release)
      }
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSecondTouch,
  };
};