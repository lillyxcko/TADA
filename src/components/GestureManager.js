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

  const resetTouchState = (nodeTouches) => {
    nodeTouches.secondTapPending = false;
    nodeTouches.secondTouchStartTime = null; // Ensure the timer is cleared
    nodeTouches.isOutsideSecondTap = false; // Reset flag for outside taps
  };

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
        isActiveTouch: true,
        secondTouchStartTime: null,
      });
    }

    const nodeTouches = touchesByNode.current.get(nodeId);
    nodeTouches.firstTouch = touch;
    nodeTouches.secondTapPending = false; // Reset second tap state
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

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    const { firstTouch } = nodeTouches;
  
    if (!firstTouch) return;
  
    const distance = getDistance(firstTouch, secondTouch);
    if (distance <= 150) {
      // Prevent duplicate timer resets
      if (nodeTouches.secondTapPending || nodeTouches.isOutsideSecondTap) {
        console.log('Second tap already pending. Ignoring duplicate.');
        return;
      }
  
      // Start the timer and mark as second tap
      nodeTouches.secondTouchStartTime = performance.now();
      nodeTouches.secondTapPending = true;
  
      // Determine if the tap is outside the node
      const isOutsideNode = getDistance({ clientX: nodeValue.cx, clientY: nodeValue.cy }, secondTouch) > r;
      nodeTouches.isOutsideSecondTap = isOutsideNode;
  
      console.log(`Second tap detected. Outside node: ${isOutsideNode}, Timer started.`);
    }
  };

  const handleTouchEnd = (e) => {
    const secondTouch = e.changedTouches[0];
    const closestNode = findClosestNodeWithinRange(secondTouch);
  
    if (closestNode && touchesByNode.current.has(closestNode)) {
      const nodeTouches = touchesByNode.current.get(closestNode);
      const { secondTapPending, secondTouchStartTime, isOutsideSecondTap } = nodeTouches;
  
      // Check if a valid second tap is in progress
      if ((secondTapPending || isOutsideSecondTap) && secondTouchStartTime) {
        const duration = Math.round(performance.now() - secondTouchStartTime);
        console.log(`Second tap ended. Duration: ${duration} ms`);
  
        // Trigger TTS for valid second tap
        if (!isSpeaking && activeTouches.current.size > 0) {
          const textToSpeak = `${nodeValue[infoIndex.current]}. Held for ${duration} milliseconds.`;
          speakValue(textToSpeak);
  
          // Advance to the next value in the array
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
        }
  
        // Reset the touch state after TTS, regardless of tap location
        resetTouchState(nodeTouches);
      } else {
        console.warn('No valid second tap state found for reset.');
      }
    }
  
    // Reset all nodes if no active touches remain
    if (e.touches.length === 0) {
      console.log('All touches ended. Resetting all nodes.');
      touchesByNode.current.forEach((nodeTouches) => resetTouchState(nodeTouches));
    }
  };

  return { handleTouchStart, handleTouchEnd, handleSecondTouch };
};