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
      const closestNodeId = findClosestNodeWithinRange(touch);

      if (closestNodeId) {
        const nodeTouches = touchesByNode.current.get(closestNodeId);

        if (nodeTouches?.secondTapPending) {
          speakValue(nodeValue[infoIndex.current]); // Announce current value
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Cycle index
          nodeTouches.secondTapPending = false;
        }
      }
    }

    // Clean up if no more active touches for any node
    if (e.touches.length === 0) {
      touchesByNode.current.clear();
      infoIndex.current = 0; // Reset TTS index when all fingers are lifted
    }
  };

  return {
    handleTouchStart,
    handleSecondTouch,
    handleTouchEnd,
  };
};