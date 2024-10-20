import { useRef } from 'react';

// Debounce function to limit the rate at which a function can fire
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// Initialize Text-to-Speech (TTS) with debouncing
const speakValue = debounce((text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
}, 500); // Adjust the debounce delay as needed

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
        // Trigger TTS if it hasn't been spoken yet
        if (!ttsSpokenRef.current) {
          speakValue(nodeValue[infoIndex.current]); // Announce the node value
          ttsSpokenRef.current = true; // Mark TTS as spoken
        } else {
          // Increment index only on the next second tap
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
          ttsSpokenRef.current = false; // Reset TTS spoken state
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      firstTouchRef.current = null;
      infoIndex.current = 0; // Reset index if necessary
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleSecondTouch,
  };
};