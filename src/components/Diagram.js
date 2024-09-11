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
      <rect
        width="100%"
        height="100%"
        fill="transparent"
      />
      {/* Multiple CircleNodes */}
      <CircleNode cx={100} cy={200} r={50} pitch={261.63} />
      <CircleNode cx={300} cy={200} r={50} pitch={329.63} />
      <CircleNode cx={200} cy={100} r={50} pitch={392.00} />
    </svg>
  );
};

export default Diagram;