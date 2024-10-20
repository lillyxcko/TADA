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

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0];
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0];
    }
  };

  const handleSecondTouch = (e) => {
    if (e.touches.length === 2 && firstTouchRef.current) {
      const secondTouch = e.touches[1];
      const distanceToCenter = getDistance(firstTouchRef.current, { clientX: cx, clientY: cy });

      if (distanceToCenter <= r + 200) {
        speakValue(nodeValue[infoIndex.current]); // Announce info
        infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Cycle info index
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      firstTouchRef.current = null;
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