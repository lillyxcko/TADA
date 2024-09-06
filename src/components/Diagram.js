import React, { useRef } from 'react';
import CircleNode from './CircleNode';

const Diagram = () => {
  const svgRef = useRef(null);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 400 400"
    >
      {/* Background rect to capture touches outside the circles */}
      <rect
        width="100%"
        height="100%"
        fill="transparent"
      />
      {/* Circle nodes */}
      <CircleNode cx={100} cy={200} r={50} pitch={261.63} />
      <CircleNode cx={300} cy={200} r={50} pitch={329.63} />
    </svg>
  );
};

export default Diagram;