import { useRef } from 'react';

// Initialize Text-to-Speech (TTS) functionality
const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
};

// Calculate the distance between two touch points
const getDistance = (touch1, cx, cy) => {
  const dx = touch1.clientX - cx;
  const dy = touch1.clientY - cy;
  return Math.sqrt(dx * dx + dy * dy);
};

// GestureManager component to handle multi-touch gestures
export const GestureManager = ({ cx, cy, nodeValue }) => {
  const firstTouchRef = useRef(null); // Store the first touch event for gesture tracking

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    firstTouchRef.current = touch; // Store the first touch
  };

  const handleSecondTouch = (e) => {
    if (e.touches.length === 2 && firstTouchRef.current) {
      const secondTouch = e.touches[1];
      const distance = getDistance(secondTouch, cx, cy); // Distance from center of node

      // If the second tap is within 100px radius, trigger TTS
      if (distance <= 100) {
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