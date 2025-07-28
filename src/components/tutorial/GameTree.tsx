import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GameNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'decision' | 'chance' | 'terminal';
  payoff?: number;
  children?: GameNode[];
}

interface GameTreeProps {
  data: GameNode;
  width?: number;
  height?: number;
  onNodeClick?: (node: GameNode) => void;
}

export function GameTree({ data, width = 600, height = 400, onNodeClick }: GameTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create tree layout
    const treeLayout = d3.tree<GameNode>()
      .size([innerWidth, innerHeight]);

    const root = d3.hierarchy(data);
    const treeData = treeLayout(root);

    // Add links
    g.selectAll('.link')
      .data(treeData.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x))
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2);

    // Add nodes
    const nodes = g.selectAll('.node')
      .data(treeData.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => onNodeClick?.(d.data));

    nodes.append('circle')
      .attr('r', 20)
      .attr('fill', d => d.data.type === 'decision' ? '#10b981' : 
                       d.data.type === 'chance' ? '#f59e0b' : '#ef4444')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    nodes.append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#fff')
      .style('font-weight', 'bold')
      .text(d => d.data.label);

  }, [data, width, height, onNodeClick]);

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-neutral-700 rounded-lg bg-neutral-900"
      />
    </div>
  );
}
