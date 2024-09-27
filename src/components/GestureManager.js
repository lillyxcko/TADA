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

    // comment
    // Reset everything if the first finger is lifted
    if (e.touches.length === 0) {
      firstTouchRef.current = null; // Reset first finger dwell
      lastSecondTapRef.current = null; // Reset second tap tracking
    }
  };

  const handleTouchMove = (e) => {
    handleSecondTouch(e); // Check for second tap during movement
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};