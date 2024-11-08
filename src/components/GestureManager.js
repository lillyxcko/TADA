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
      touchesByNode.current.set(nodeId, { 
        firstTouch: touch, 
        secondTapPending: false, 
        isActiveTouch: true,
        activeTouchCount: 1 
      });
    } else {
      touchesByNode.current.get(nodeId).activeTouchCount += 1; // Increment touch count
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false;
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;

    if (firstTouch && getDistance(firstTouch, secondTouch) <= 150) {
      nodeTouches.secondTapPending = true; // Mark second tap as pending
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
      const { secondTapPending, activeTouchCount } = nodeTouches;

      // Only proceed with TTS if node is still being actively touched
      if (secondTapPending && activeTouchCount > 1 && !isSpeaking) {
        const textToSpeak = nodeValue[infoIndex.current];
        speakValue(textToSpeak);
        infoIndex.current = (infoIndex.current + 1) % nodeValue.length; // Move to the next index
      }

      nodeTouches.secondTapPending = false;
      nodeTouches.activeTouchCount -= 1; // Decrement touch count

      // Mark node as inactive if no active touches remain
      if (nodeTouches.activeTouchCount === 0) {
        nodeTouches.isActiveTouch = false;
      }
    }
  };

  return { handleTouchStart, handleTouchEnd, handleSecondTouch };
};