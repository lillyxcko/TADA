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
  const firstTouchRef = useRef(null); // Store the first touch event for gesture tracking

  // Handle first touch (dwell)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0]; // Store the first finger touch (dwell)
    }
  };

  // Handle second tap within a 200px radius of the node
  const handleSecondTouch = (e) => {
    // Ensure the first finger is still dwelling on the node
    if (e.touches.length === 2 && firstTouchRef.current) {
      const secondTouch = e.touches[1];
      const distance = getDistance(firstTouchRef.current, secondTouch);

      // Trigger TTS if the second tap is within 200px radius
      if (distance <= 200) {
        speakValue(nodeValue); // Announce the value of the node
      }
    }
  };

  const handleTouchMove = (e) => {
    handleSecondTouch(e); // Check for second tap during movement
  };

  return {
    handleTouchStart,
    handleTouchMove,
  };
};