import { useRef } from 'react';

let isSpeaking = false;

const speakValue = (text) => {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => {
    isSpeaking = true;
  };

  utterance.onend = () => {
    isSpeaking = false;
  };

  synth.speak(utterance);
};

export const GestureManager = ({ nodeId, nodeValue, infoIndex }) => {
  const touchesByNode = useRef(new Map());

  const handleTouchStart = (nodeId, touch) => {
    if (!touchesByNode.current.has(nodeId)) {
      touchesByNode.current.set(nodeId, {
        firstTouch: touch,
        secondTapPending: false,
      });
    }
    touchesByNode.current.get(nodeId).firstTouch = touch;
    infoIndex.current = 0;
  };

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    if (getDistance(nodeTouches.firstTouch, secondTouch) <= 200) {
      nodeTouches.secondTapPending = true;
    }
  };

  const handleTouchEnd = (e) => {
    e.changedTouches.forEach((touch) => {
      const closestNodeId = findClosestNodeWithinRange(touch);
      if (closestNodeId) {
        const nodeTouches = touchesByNode.current.get(closestNodeId);
        if (nodeTouches?.secondTapPending && !isSpeaking) {
          speakValue(nodeValue[infoIndex.current]);
          infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
          nodeTouches.secondTapPending = false;
        }
      }
    });

    if (e.touches.length === 0) {
      touchesByNode.current.clear();
      infoIndex.current = 0;
    }
  };

  return { handleTouchStart, handleSecondTouch, handleTouchEnd };
};