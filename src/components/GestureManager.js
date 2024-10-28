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

export const GestureManager = ({ nodeValue, infoIndex, r, id }) => {
  const touchesByNode = useRef(new Map()); // Track touches per node

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
      });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch; // Update the first touch
    nodeTouches.secondTapPending = false; // Reset second tap state
    infoIndex.current = 0; // Reset TTS cycle on new touch
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    // Check if the second tap is within 200px of the first touch
    if (firstTouch && getDistance(firstTouch, secondTouch) <= 200) {
      nodeTouches.secondTapPending = true;
    }
  };

  const handleTouchEnd = (nodeId, e) => {
    const nodeTouches = touchesByNode.current.get(nodeId);

    if (nodeTouches?.secondTapPending) {
      speakValue(nodeValue[infoIndex.current]); // Announce current value
      infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Cycle index
      nodeTouches.secondTapPending = false;
    }

    // Clean up if no more active touches for this node
    if (e.touches.length === 0) {
      touchesByNode.current.delete(nodeId);
      infoIndex.current = 0;
    }
  };

  return {
    handleTouchStart,
    handleSecondTouch,
    handleTouchEnd,
  };
};