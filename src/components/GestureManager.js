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
export const GestureManager = ({ cx, cy, nodeValue, isInsideCircle, infoIndex, r }) => {
  const firstTouchRef = useRef(null); // Store first touch per node
  const hasSpokenRef = useRef(false); // Track if TTS has been spoken
  const isSecondTapRef = useRef(false); // Track if the second tap has been handled

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0];
      hasSpokenRef.current = false; // Reset spoken state
      isSecondTapRef.current = false; // Reset second tap state
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0];
    }
  };

  const handleSecondTouch = (e) => {
    if (e.touches.length === 2 && firstTouchRef.current) {
      const secondTouch = e.touches[1]; // Get the second tap
      const distance = getDistance(firstTouchRef.current, secondTouch); // Calculate distance

      // Ensure the first touch is inside the circle and the second is nearby
      if (isInsideCircle(firstTouchRef.current.clientX, firstTouchRef.current.clientY) &&
          distance <= r + 200) {
        // Trigger TTS if it hasn't been spoken yet
        if (!hasSpokenRef.current) {
          speakValue(nodeValue[infoIndex.current]); // Announce the node value
          hasSpokenRef.current = true; // Mark TTS as spoken
        } else if (!isSecondTapRef.current) {
          // Increment index only on the next second tap
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
          isSecondTapRef.current = true; // Mark second tap as handled
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      firstTouchRef.current = null;
      infoIndex.current = 0; // Reset index if necessary
      hasSpokenRef.current = false; // Reset TTS spoken state
      isSecondTapRef.current = false; // Reset second tap state
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSecondTouch,
  };
};