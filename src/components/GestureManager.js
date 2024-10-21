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
  const firstTouchRef = useRef(null); // Store first touch per node
  const secondTouchRef = useRef(null); // Store second touch for TTS
  const ttsSpokenRef = useRef(false); // Track if TTS has been spoken
  const isFirstTouchInside = useRef(false); // Track if first touch is inside the node

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0];
      isFirstTouchInside.current = isInsideCircle(firstTouchRef.current.clientX, firstTouchRef.current.clientY);
      secondTouchRef.current = null; // Reset second touch
      ttsSpokenRef.current = false; // Reset TTS spoken state
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1) {
      firstTouchRef.current = e.touches[0];
      isFirstTouchInside.current = isInsideCircle(firstTouchRef.current.clientX, firstTouchRef.current.clientY);
    }
  };

  const handleSecondTouch = (e) => {
    if (e.touches.length === 2 && firstTouchRef.current) {
      const secondTouch = e.touches[1]; // Get the second tap
      secondTouchRef.current = secondTouch; // Store second touch
      const distance = getDistance(firstTouchRef.current, secondTouch); // Calculate distance

      // Ensure the first touch is inside the circle and the second is nearby
      if (isFirstTouchInside.current && distance <= r + 200) {
        // Prevent rapid triggering by using a timeout
        if (!ttsSpokenRef.current) {
          ttsSpokenRef.current = true; // Mark TTS as spoken
          speakValue(nodeValue[infoIndex.current]);

          // Reset TTS spoken state after a brief timeout
          setTimeout(() => {
            ttsSpokenRef.current = false; // Allow TTS to be triggered again
          }, 500); // Adjust the timeout duration as needed
        } else {
          // If TTS was already spoken, increment index and trigger TTS for the new index
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Increment index
          speakValue(nodeValue[infoIndex.current]); // Speak the new index
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      // No touches left
      firstTouchRef.current = null; // Reset first touch
      secondTouchRef.current = null; // Reset second touch
      infoIndex.current = 0; // Reset index when the first finger is lifted
      ttsSpokenRef.current = false; // Reset TTS spoken state
      isFirstTouchInside.current = false; // Reset inside state
    } else {
      // Check for any remaining touches
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier !== firstTouchRef.current.identifier) {
          // If there's still a second touch, allow the next tap
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