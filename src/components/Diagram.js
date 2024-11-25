import React, { useRef } from 'react';
import Node from './Node';
import Link from './Link';

const Diagram = () => {
  const svgRef = useRef(null);

  // Define the nodes
  const nodes = [
    { id: 'node-1', cx: 80, cy: 250, r: 35, pitch: 261.63, value: ["cat", "kitten", "feline"] },
    { id: 'node-2', cx: 300, cy: 210, r: 35, pitch: 329.63, value: [576.5, 578.5, 580.5] },
    { id: 'node-3', cx: 220, cy: 80, r: 35, pitch: 261.63, value: ["dog", "puppy", "canine"] },
  ];

  // Define the links
  const links = [
    {
      source: 'node-1',
      target: 'node-2',
      x1: nodes[0].cx,
      y1: nodes[0].cy,
      x2: nodes[1].cx,
      y2: nodes[1].cy,
      r1: nodes[0].r,
      r2: nodes[1].r,
      pitch: 500,
    },
    {
      source: 'node-2',
      target: 'node-3',
      x1: nodes[1].cx,
      y1: nodes[1].cy,
      x2: nodes[2].cx,
      y2: nodes[2].cy,
      r1: nodes[1].r,
      r2: nodes[2].r,
      pitch: 500,
    },
    {
      source: 'node-3',
      target: 'node-1',
      x1: nodes[2].cx,
      y1: nodes[2].cy,
      x2: nodes[0].cx,
      y2: nodes[0].cy,
      r1: nodes[2].r,
      r2: nodes[0].r,
      pitch: 500,
    },
  ];

  // Function to adjust link coordinates
  const calculateAdjustedCoordinates = (x1, y1, x2, y2, r1, r2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / distance;
    const uy = dy / distance;
    const newX1 = x1 + ux * r1;
    const newY1 = y1 + uy * r1;
    const newX2 = x2 - ux * r2;
    const newY2 = y2 - uy * r2;
    return { newX1, newY1, newX2, newY2 };
  };

  return (
    <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 400 400">
      <rect width="100%" height="100%" fill="transparent" />

      {/* Render links */}
      {links.map((link, index) => {
        const { newX1, newY1, newX2, newY2 } = calculateAdjustedCoordinates(
          link.x1,
          link.y1,
          link.x2,
          link.y2,
          link.r1,
          link.r2
        );

        return (
          <Link
            key={index}
            x1={newX1}
            y1={newY1}
            x2={newX2}
            y2={newY2}
            pitch={link.pitch}
            svgRef={svgRef}
          />
        );
      })}

      {/* Render nodes */}
      {nodes.map((node) => {
        const nodeLinks = links.filter(
          (link) => link.source === node.id || link.target === node.id
        );

        return (
          <Node
            key={node.id}
            id={node.id}
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            pitch={node.pitch}
            value={node.value}
            links={nodeLinks} // Pass filtered links to Node
          />
        );
      })}
    </svg>
  );
};

export default Diagram;