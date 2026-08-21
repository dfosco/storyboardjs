import { useMemo } from 'react';

function sidePoint(node, side) {
  const x = node.x;
  const y = node.y;
  if (side === 'top') return { x: x + node.width / 2, y };
  if (side === 'right') return { x: x + node.width, y: y + node.height / 2 };
  if (side === 'bottom') return { x: x + node.width / 2, y: y + node.height };
  if (side === 'left') return { x, y: y + node.height / 2 };
  return { x: x + node.width / 2, y: y + node.height / 2 };
}

function edgePath(from, to) {
  const dx = Math.abs(to.x - from.x) * 0.45;
  const direction = to.x >= from.x ? 1 : -1;
  return `M ${from.x} ${from.y} C ${from.x + dx * direction} ${from.y}, ${to.x - dx * direction} ${to.y}, ${to.x} ${to.y}`;
}

function markerId(edgeId, end) {
  return `tc-edge-${end}-${edgeId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}

export default function EdgeLayer({ edges = [], nodes = [], width, height }) {
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  if (!edges.length) return null;

  return (
    <svg
      className="tc-edge-layer"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <defs>
        {edges.map((edge) => (
          <g key={edge.id}>
            <marker
              id={markerId(edge.id, 'to')}
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
            </marker>
            <marker
              id={markerId(edge.id, 'from')}
              markerWidth="8"
              markerHeight="8"
              refX="1"
              refY="4"
              orient="auto"
            >
              <path d="M8,0 L0,4 L8,8 z" fill="currentColor" />
            </marker>
          </g>
        ))}
      </defs>
      {edges.map((edge) => {
        const fromNode = nodeMap.get(edge.fromNode);
        const toNode = nodeMap.get(edge.toNode);
        if (!fromNode || !toNode) return null;
        const from = sidePoint(fromNode, edge.fromSide);
        const to = sidePoint(toNode, edge.toSide);
        return (
          <g key={edge.id} className="tc-edge" data-edge-id={edge.id}>
            <path
              d={edgePath(from, to)}
              fill="none"
              stroke={edge.color?.startsWith('#') ? edge.color : undefined}
              markerStart={edge.fromEnd === 'arrow' ? `url(#${markerId(edge.id, 'from')})` : undefined}
              markerEnd={edge.toEnd === 'none' ? undefined : `url(#${markerId(edge.id, 'to')})`}
            />
            {edge.label ? (
              <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2}>
                {edge.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
