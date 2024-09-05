import React from 'react';
import CircleNode from './CircleNode';

const Diagram = () => {
  return (
    <svg width="400" height="400">
      <CircleNode cx={100} cy={200} r={50} pitch={261.63} /> 
      <CircleNode cx={300} cy={200} r={50} pitch={329.63} />  
    </svg>
  );
};

export default Diagram;