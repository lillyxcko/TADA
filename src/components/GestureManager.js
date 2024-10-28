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
  const touchesByNode = useRef(new Map());

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, { touches: new Set(), secondTapPending: false });
    }
    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.touches.add(touch.identifier); // Track touch identifier
    infoIndex.current = 0; // Reset the TTS cycle
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    if (firstTouch && getDistance(firstTouch, secondTouch) <= 200) {
      nodeTouches.secondTapPending = true; // Mark second tap as pending
    }
  };

  const findClosestNodeWithinRange = (touch) => {
    let closestNodeId = null;
    let minDistance = 200;

    touchesByNode.current.forEach((nodeTouches, nodeId) => {
      const { firstTouch } = nodeTouches;
      const distance = getDistance(firstTouch, touch);

      if (distance <= 200 && distance < minDistance) {
        closestNodeId = nodeId;
        minDistance = distance;
      }
    });

    return closestNodeId;
  };

  const handleTouchEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      // Find closest nodes and check all active touches
      touchesByNode.current.forEach((nodeTouches, nodeId) => {
        if (nodeTouches.touches.has(touch.identifier)) {
          // Check if second tap is pending
          if (nodeTouches.secondTapPending) {
            speakValue(nodeValue[infoIndex.current]); // Speak the value
            infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Move to the next value
            nodeTouches.secondTapPending = false; // Reset
          }
        }
      });

      // Remove touch from tracking
      touchesByNode.current.forEach((nodeTouches) => {
        nodeTouches.touches.delete(touch.identifier);
      });
    }

    // Clear if no touches remain
    if (e.touches.length === 0) {
      touchesByNode.current.clear();
      infoIndex.current = 0; // Reset TTS index
    }
  };

  return {
    handleTouchStart,
    handleSecondTouch,
    handleTouchEnd,
  };
};