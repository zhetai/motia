import React, { useEffect, useState, useMemo } from 'react';
import { useWorkflows } from "./hooks/useWorkflows.js";
import ReactFlow, {
  Controls,
  Background,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import './styles.css';
import { MotiaUi, useMotiaFlow } from 'motia/ui';
import './motia-ui.js';
import EnhancedNode from './EnhancedNode.jsx';
import { layoutElements } from './utils/layout.js';

// TODO: refactor this to be simple by default with override options
export default function EnhancedWorkflowUI() {
  const { workflows, loading: wfLoading, error: wfError } = useWorkflows();
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const { nodes: initialNodes, edges: initialEdges, loading, error } = useMotiaFlow(selectedWorkflow);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  const nodeTypes = useMemo(() => {
    return { ...MotiaUi.getNodeTypes(), default: EnhancedNode };
  }, []);
  
  useEffect(() => {
    if (initialNodes.length > 0 && initialEdges.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = layoutElements(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } else {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges]);

  if (wfLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100vw', height: '100vh', backgroundColor: '#111827', color: '#fff'
      }}>
        <div style={{ fontSize: '1.5rem' }}>Loading workflows...</div>
      </div>
    );
  }

  if (wfError) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '100vw', height: '100vh', backgroundColor: '#111827', color: '#fff'
      }}>
        <div style={{ fontSize: '1.5rem', color: 'red' }}>Error: {wfError}</div>
      </div>
    );
  }

  if (workflows.length > 1 && selectedWorkflow === null) {
    setSelectedWorkflow(workflows[0].name);
  }

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

  return (
    <>
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        backgroundColor: '#1f2937',
        padding: '1rem',
        borderRadius: '8px',
        color: '#fff',
        zIndex: 10,
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '0rem' }}>Motia UI</h2>
  
        {workflows.length > 1 && (
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: "0.9rem", fontWeight: '600', marginBottom: "0.5rem" }}>Select Workflow</h2>
            <select
              value={selectedWorkflow || ""}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              style={{
                padding: "0.5rem",
                backgroundColor: "#333",
                color: "#fff",
                borderRadius: "4px",
                border: '1px solid #444',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              {workflows.map((wf) => (
                <option key={wf.name} value={wf.name}>{wf.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
  
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#111827', position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#666', strokeWidth: 2 },
            markerEnd: { type: 'arrowclosed' },
          }}
          style={{ backgroundColor: '#111827' }}
        >
          <Background variant="dots" gap={20} size={1} color="#444" style={{ backgroundColor: '#111827' }} />
          <Controls style={{ backgroundColor: '#333', borderRadius: '4px', color: '#fff' }} />
        </ReactFlow>
      </div>
    </>
  );
  
}
