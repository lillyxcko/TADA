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

export const GestureManager = ({ nodeId, nodeValue, infoIndex, r }) => {
  const touchesByNode = useRef(new Map());

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, { firstTouch: touch, secondTapPending: false, isActiveTouch: true });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false;
    infoIndex.current = 0;
  };

  const handleSecondTouch = (nodeId, currentTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    if (nodeTouches && getDistance(nodeTouches.firstTouch, currentTouch) <= 200 && !isSpeaking) {
      // Directly speak the value if within range and TTS is not already active
      const textToSpeak = nodeValue[infoIndex.current];
      speakValue(textToSpeak);
      
      // Cycle through the node's values for the next tap
      infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
    }
  };
  
  const findClosestNodeWithinRange = (touch) => {
    let closestNodeId = null;
    let minDistance = 200;
  
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
    for (let i = 0; i < e.changedTouches.length; i++) {
      const endedTouch = e.changedTouches[i];
      const closestNode = findClosestNodeWithinRange(endedTouch);
  
      if (closestNode && touchesByNode.current.has(closestNode)) {
        const nodeTouches = touchesByNode.current.get(closestNode);
        
        // Clean up only if the ended touch was the first active touch
        if (nodeTouches.firstTouch.identifier === endedTouch.identifier) {
          touchesByNode.current.delete(closestNode); // Remove the node from active touches
        }
      }
    }
  };

  return { handleTouchStart, handleTouchEnd, handleSecondTouch };
};