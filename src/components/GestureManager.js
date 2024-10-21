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
  const ttsSpokenRef = useRef(false); // Track if TTS has been spoken

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0];
      ttsSpokenRef.current = false; // Reset TTS spoken state
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
        // Check if TTS has been spoken or not
        if (!ttsSpokenRef.current) {
          // Trigger TTS for the current index
          speakValue(nodeValue[infoIndex.current]);
          ttsSpokenRef.current = true; // Mark TTS as spoken
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      firstTouchRef.current = null; // Reset first touch
      infoIndex.current = 0; // Reset index when the first finger is lifted
      ttsSpokenRef.current = false; // Reset TTS spoken state
    } else {
      // Check for any remaining touches
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier !== firstTouchRef.current.identifier) {
          // If there's still a second touch, increment the index
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Increment index
          ttsSpokenRef.current = false; // Allow TTS to be triggered again
        }
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