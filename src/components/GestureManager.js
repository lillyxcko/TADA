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

  const handleSecondTouch = (nodeId, secondTouch) => {
    const nodeTouches = touchesByNode.current.get(nodeId);
    if (nodeTouches) {
      nodeTouches.secondTapPending = true;
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
    const secondTouch = e.changedTouches[0];
    const closestNode = findClosestNodeWithinRange(secondTouch);

    if (closestNode && touchesByNode.current.has(closestNode)) {
      const { secondTapPending } = touchesByNode.current.get(closestNode);
      if (secondTapPending && !isSpeaking) {
        const textToSpeak = nodeValue[infoIndex.current];
        speakValue(textToSpeak);
        infoIndex.current = (infoIndex.current + 1) % nodeValue.length;
      }
      touchesByNode.current.get(closestNode).secondTapPending = false;
    }
  };

  return { handleTouchStart, handleTouchEnd, handleSecondTouch };
};