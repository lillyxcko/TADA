import React from 'react';
import CircleNode from './CircleNode';

const Diagram = () => {
  return (
    <svg width="400" height="400">
      {/* First circle node */}
      <CircleNode cx={100} cy={200} r={50} pitch="C4" />
      {/* Second circle node with a different pitch */}
      <CircleNode cx={300} cy={200} r={50} pitch="E4" />
    </svg>
  );
};

export default Diagram;