import { useRef } from 'react';

let isSpeaking = false; // Prevent overlapping TTS

const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.onstart = () => (isSpeaking = true);
  utterance.onend = () => (isSpeaking = false);
  synth.speak(utterance);
};

const getDistance = (touch1, touch2) => {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

export const GestureManager = ({ nodeId, nodeValue, infoIndex, r, activeTouches }) => {
  const touchesByNode = useRef(new Map());

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false, // Track second tap state
        isActiveTouch: true,
        secondTouchStartTime: null,
      });
    }
  
    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false; // Reset any previous second tap state
  };

  const findClosestNodeWithinRange = (touch) => {
    let closestNodeId = null;
    let minDistance = 150; // Adjust to match the extended radius

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

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;
  
    if (firstTouch && getDistance(firstTouch, secondTouch) <= 150) {
      nodeTouches.secondTapPending = true; // Mark that a second tap is pending
      nodeTouches.secondTouchStartTime = performance.now(); // Start timing the second tap
    }
  };

  const handleTouchEnd = (e) => {
    const secondTouch = e.changedTouches[0];
    const closestNode = findClosestNodeWithinRange(secondTouch);
  
    if (closestNode && touchesByNode.current.has(closestNode)) {
      const nodeTouches = touchesByNode.current.get(closestNode);
      const { secondTapPending, secondTouchStartTime } = nodeTouches;
  
      if (secondTapPending && !isSpeaking && activeTouches.current.size > 0) {
        const duration = secondTouchStartTime
          ? Math.round(performance.now() - secondTouchStartTime)
          : 0; // Calculate the duration
        const textToSpeak = `${nodeValue[infoIndex.current]}. Held for ${duration} milliseconds.`;
  
        speakValue(textToSpeak);
  
        // Move to the next value in the array
        infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
  
        // Reset second tap state
        nodeTouches.secondTapPending = false;
        nodeTouches.secondTouchStartTime = null;
      }
    }
  };

  return { handleTouchStart, handleTouchEnd, handleSecondTouch };
};