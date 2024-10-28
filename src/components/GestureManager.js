import { useRef } from 'react';

const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  synth.speak(utterance);
};

const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const GestureManager = ({ nodeValue, infoIndex, r }) => {
  const touchesByNode = useRef(new Map()); // Store touches per node

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
        isFirstTouchInside: true,
      });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch; // Update firstTouch
    nodeTouches.isFirstTouchInside = true; // Mark as inside
    nodeTouches.secondTapPending = false; // Reset pending state
    infoIndex.current = 0; // Reset TTS cycle on new touch
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    // Check if second touch is close to the first touch of the node
    if (firstTouch && getDistance(firstTouch, secondTouch) <= 200) {
      nodeTouches.secondTapPending = true; // Valid second tap detected
    }
  };

  const handleTouchEnd = (nodeId, e) => {
    const nodeTouches = touchesByNode.current.get(nodeId);

    // Only trigger TTS if the second tap is valid and was detected
    if (nodeTouches?.secondTapPending) {
      speakValue(nodeValue[infoIndex.current]); // Announce current value

      // Increment index, cycling if needed
      infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
      nodeTouches.secondTapPending = false;
    }

    // Clean up when no more touches
    if (e.touches.length === 0) {
      touchesByNode.current.delete(nodeId);
      infoIndex.current = 0; // Reset index when all fingers are lifted
    }
  };

  return {
    handleTouchStart,
    handleSecondTouch,
    handleTouchEnd,
  };
};