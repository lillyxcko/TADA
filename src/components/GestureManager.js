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
  const SECOND_TAP_THRESHOLD = 300;  // in milliseconds

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
    const { firstTouch, secondTouchStartTime } = nodeTouches;
  
    if (firstTouch && getDistance(firstTouch, secondTouch) <= 150) {
      const currentTime = Date.now();
  
      // If there's no secondTouchStartTime yet, initialize it
      if (!secondTouchStartTime) {
        nodeTouches.secondTouchStartTime = currentTime;
      }
  
      const duration = currentTime - secondTouchStartTime;
      
      if (duration <= SECOND_TAP_THRESHOLD) {
        nodeTouches.secondTapPending = true; // Mark second tap as pending
      } else {
        nodeTouches.secondTapPending = false; // Reset if tap duration exceeds 300ms
        nodeTouches.secondTouchStartTime = null; // Reset start time to avoid stale timing
      }
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
      const { secondTapPending, secondTouchStartTime } = touchesByNode.current.get(closestNode);
  
      if (secondTapPending && !isSpeaking && activeTouches.current.size > 0) {
        const duration = Date.now() - secondTouchStartTime;
  
        if (duration < SECOND_TAP_THRESHOLD) {
          const textToSpeak = nodeValue[infoIndex.current];
          speakValue(textToSpeak);
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Move to the next index
        }
      }
  
      // Reset the pending second tap after the touch ends
      touchesByNode.current.get(closestNode).secondTapPending = false;
      touchesByNode.current.get(closestNode).secondTouchStartTime = null; 
    }
  };

  return { handleTouchStart, handleTouchEnd, handleSecondTouch };
};