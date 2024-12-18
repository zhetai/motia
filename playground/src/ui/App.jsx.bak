import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';    // Ensure ReactFlow styles are included
import './styles.css';               // Include your own CSS for layout/colors
import { MotiaUi, useMotiaFlow } from 'motia/ui';
import './motia-ui.js';
import EnhancedNode from './EnhancedNode.jsx';

export default function EnhancedWorkflowUI() {
  const { nodes: initialNodes, edges: initialEdges, loading, error } = useMotiaFlow();
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // Memoize nodeTypes to avoid re-creating the object on each render
  const nodeTypes = React.useMemo(() => {
    return { ...MotiaUi.getNodeTypes(), default: EnhancedNode };
  }, []);

  // Layout nodes in a simple grid
  React.useEffect(() => {
    if (initialNodes.length > 0) {
      const layoutedNodes = initialNodes.map((node, index) => {
        const subscriberCount = node.data.subscribe?.length || 0;
        const row = Math.floor(index / 3);
        const col = index % 3;

        return {
          ...node,
          position: {
            x: col * 300 + (subscriberCount * 20),
            y: row * 200 + (subscriberCount * 10)
          },
          style: {
            opacity: 1,
            transition: 'all 0.3s ease'
          }
        };
      });
      setNodes(layoutedNodes);
    }
  }, [initialNodes]);

  // Enhance edges
  React.useEffect(() => {
    if (initialEdges.length > 0) {
      const enhancedEdges = initialEdges.map(edge => ({
        ...edge,
        type: 'smoothstep',
        animated: true,
        style: { strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#666',
        },
      }));
      setEdges(enhancedEdges);
    }
  }, [initialEdges]);

  // Update nodes/edges when data changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100vw', height: '100vh', backgroundColor: '#111827', color: '#fff'
      }}>
        <div style={{ fontSize: '1.5rem' }}>Loading workflow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100vw', height: '100vh', backgroundColor: '#111827', color: '#fff'
      }}>
        <div style={{ fontSize: '1.5rem', color: 'red' }}>Error: {error}</div>
      </div>
    );
  }

  // Make sure parent has width/height. Here, we set it inline for simplicity.
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#111827', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: '1rem', left: '1rem', backgroundColor: '#1f2937',
        padding: '1rem', borderRadius: '8px', color: '#fff', zIndex: 10
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Workflow Visualization</h1>
        <p style={{ fontSize: '0.875rem', color: '#ccc' }}>Drag nodes to rearrange • Zoom to explore</p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
        onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#666', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        style={{ backgroundColor: '#111827' }}
      >
        <Background
          variant="dots"
          gap={20}
          size={1}
          color="#444"
          style={{ backgroundColor: '#111827' }}
        />
        <Controls style={{
          backgroundColor: '#333',
          borderRadius: '4px',
          color: '#fff'
        }}/>
      </ReactFlow>
    </div>
  );
}
