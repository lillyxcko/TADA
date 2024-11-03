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

export const GestureManager = ({ nodeValue, infoIndex, r }) => {
  const touchesByNode = useRef(new Map());
  const isSpeakingByNode = useRef(new Map());

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
        isActiveTouch: true,
      });
      isSpeakingByNode.current.set(nodeId, false); 
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
      if (
        firstTouch &&
        getDistance(firstTouch, secondTouch) <= 200 &&
        !isSpeakingByNode.current.get(nodeId)
      ) {
        // Trigger TTS immediately upon detecting valid second touch
        speakValue(nodeId, nodeValue[infoIndex.current], isSpeakingByNode);
        infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
        nodeTouches.secondTapPending = false; // Reset the pending flag
      }
    }
  };

  const handleTouchEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      touchesByNode.current.forEach((nodeTouches) => {
        if (nodeTouches.firstTouch && getDistance(nodeTouches.firstTouch, touch) <= 200) {
          nodeTouches.secondTapPending = false;
        }
      });
    }

    // Clear touches when no fingers remain
    if (e.touches.length === 0) {
      touchesByNode.current.forEach((nodeTouches) => {
        nodeTouches.isActiveTouch = false;
      });
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