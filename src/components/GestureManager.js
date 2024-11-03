// gesturemanager.js
import { useRef } from 'react';

const speakValue = (text, nodeId) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  // Track speaking status per node, not globally
  utterance.onstart = () => (touchesByNode.current.get(nodeId).isSpeaking = true);
  utterance.onend = () => (touchesByNode.current.get(nodeId).isSpeaking = false);

  synth.speak(utterance);
};

export const GestureManager = ({ nodeValue, infoIndex, r }) => {
  const touchesByNode = useRef(new Map());

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
        isActiveTouch: true,
        isSpeaking: false,
      });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false;
    infoIndex.current = 0;
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    if (!nodeTouches || nodeTouches.isSpeaking) return;

    const { firstTouch } = nodeTouches;
    const distance = getDistance(firstTouch, secondTouch);

    if (distance <= 200) {
      if (!nodeTouches.isSpeaking) {
        speakValue(nodeValue[infoIndex.current], nodeId);
        infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
        nodeTouches.secondTapPending = false;  // Reset after TTS is triggered
      }
    }
  };

  const handleTouchEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const closestNodeId = findClosestNodeWithinRange(touch);

      if (closestNodeId) {
        const nodeTouches = touchesByNode.current.get(closestNodeId);
        if (nodeTouches?.isActiveTouch) {
          nodeTouches.isActiveTouch = false;
        }
      }
    }

    // Clear state when all touches are removed
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