import { useRef } from 'react';

let isSpeaking = false;

const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = () => isSpeaking = true;
  utterance.onend = () => isSpeaking = false;
  synth.speak(utterance);
};

const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const GestureManager = ({ nodeId, nodeValue, infoIndex, r, activeTouches }) => {
  const touchesByNode = useRef(new Map());
  const SECOND_TAP_THRESHOLD = 400;  // in milliseconds

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, { firstTouch: touch, secondTapPending: false, isActiveTouch: true, secondTouchStartTime: null });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false;
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    // Ensure we are close enough to the first touch to register it as a second tap
    if (firstTouch && getDistance(firstTouch, secondTouch) <= 150) {
      nodeTouches.secondTouchStartTime = Date.now(); // Start timing the second touch
    }
  };

  const findClosestNodeWithinRange = (touch) => {
    let closestNodeId = null;
    let minDistance = 150; // Adjust to match the extended radius in handleSecondTouch
  
    touchesByNode.current.forEach((nodeTouches, nodeId) => {
      if (!nodeTouches.isActiveTouch) return;
      const dist = getDistance(nodeTouches.firstTouch, touch);
      if (dist < minDistance) {
        minDistance = dist;
        closestNodeId = nodeId;
      }
    });
    return closestNodeId;
  };

  const handleTouchEnd = (e) => {
    const secondTouch = e.changedTouches[0];
    const closestNode = findClosestNodeWithinRange(secondTouch);
  
    if (closestNode && touchesByNode.current.has(closestNode)) {
      const nodeTouches = touchesByNode.current.get(closestNode);
      const { secondTouchStartTime, secondTapPending } = nodeTouches;

      if (secondTouchStartTime && !isSpeaking && activeTouches.current.size > 0) {
        // Calculate the duration after the second touch has ended
        const duration = Date.now() - secondTouchStartTime;

        if (duration <= SECOND_TAP_THRESHOLD && !secondTapPending) {
          // Only trigger TTS if the duration is within the threshold and not already pending
          const textToSpeak = nodeValue[infoIndex.current];
          speakValue(textToSpeak);
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Move to the next index
        }

        // Reset second tap tracking after the duration check
        touchesByNode.current.get(closestNode).secondTouchStartTime = null;
        touchesByNode.current.get(closestNode).secondTapPending = false;
      }
    }
  };

  return { handleTouchStart, handleTouchEnd, handleSecondTouch };
};