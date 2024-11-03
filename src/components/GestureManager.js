import { useRef } from 'react';

const speakValue = (nodeId, text, isSpeakingByNode) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => {
    isSpeakingByNode.current.set(nodeId, true);
  };

  utterance.onend = () => {
    isSpeakingByNode.current.set(nodeId, false);
  };

  synth.speak(utterance);
};

const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const GestureManager = ({ nodeValue, infoIndex }) => {
  const touchesByNode = useRef(new Map());
  const isSpeakingByNode = useRef(new Map()); // Tracks TTS activity per node

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
      });
      isSpeakingByNode.current.set(nodeId, false); // Initialize TTS state for this node
    }
    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false;
    infoIndex.current = 0;
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    if (nodeTouches) {
      const { firstTouch } = nodeTouches;
      if (firstTouch && getDistance(firstTouch, secondTouch) <= 200) {
        if (!isSpeakingByNode.current.get(nodeId)) {
          speakValue(nodeId, nodeValue[infoIndex.current], isSpeakingByNode);
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
          nodeTouches.secondTapPending = false; // Reset after TTS trigger
        }
      }
    }
  };

  const handleTouchEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      touchesByNode.current.forEach((nodeTouches, nodeId) => {
        const { firstTouch } = nodeTouches;

        // Reset touch information
        if (firstTouch) {
          nodeTouches.firstTouch = null; // Clear the first touch after it's ended
        }
      });
    }

    // Clear touches when no more fingers are touching the screen
    if (e.touches.length === 0) {
      touchesByNode.current.clear();
      infoIndex.current = 0;
    }
  };

  return {
    handleTouchStart,
    handleSecondTouch,
    handleTouchEnd,
  };
};