import React from 'react';
import Node from './Node';

const Diagram = () => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 400 400">
      <rect width="100%" height="100%" fill="transparent" />
      {/* Each node has a value (either number or string) */}
      <Node cx={100} cy={200} r={50} pitch={261.63} value="cat" />
      <Node cx={300} cy={200} r={50} pitch={329.63} value={576.5} />
      <Node cx={200} cy={100} r={50} pitch={392.00} value="dog" />
    </svg>
  );
};

export default Diagram;