import { useRef } from 'react';

let isSpeaking = false; // Global flag to track if TTS is currently speaking

const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => {
    isSpeaking = true; // Set speaking flag when TTS starts
  };

  utterance.onend = () => {
    isSpeaking = false; // Reset speaking flag when TTS ends
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

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
        isActiveTouch: true, // Mark node as having an active touch
      });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false; // Reset state on new touch
    infoIndex.current = 0; // Reset TTS index
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    if (nodeTouches) {
      const { firstTouch } = nodeTouches;
      if (firstTouch && getDistance(firstTouch, secondTouch) <= 200) {
        nodeTouches.secondTapPending = true;
      }
    }
  };

  const findNodesWithinRange = (touch) => {
    const nodesInRange = [];
  
    touchesByNode.current.forEach((nodeTouches, nodeId) => {
      const { firstTouch } = nodeTouches;
      const distance = getDistance(firstTouch, touch);
  
      if (distance <= 200) {
        nodesInRange.push(nodeId); // Add node ID to the list if within range
      }
    });
  
    return nodesInRange; // Returns an array of node IDs within 200px
  };

  const handleTouchEnd = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      
      // Get all nodes within 200px of the current touch
      const nodesInRange = findNodesWithinRange(touch);
  
      nodesInRange.forEach((nodeId) => {
        const nodeTouches = touchesByNode.current.get(nodeId);
  
        if (nodeTouches?.isActiveTouch && nodeTouches.secondTapPending && !isSpeaking) {
          speakValue(nodeValue[infoIndex.current]);
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
          nodeTouches.secondTapPending = false; // Reset pending state for this node
        }
      });
    }
  
    // Reset state when all touches end
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