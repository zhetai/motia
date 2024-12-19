import { useEffect, useState } from "react";

export function useMotiaFlow(selectedWorkflow) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const res = await fetch("/api/workflows");
        if (!res.ok) {
          throw new Error(`Failed to fetch workflows: ${res.statusText}`);
        }
        const data = await res.json();

        const workflow =
          data.workflows.find((w) => w.name === selectedWorkflow) ||
          data.workflows?.[0];
        if (!workflow) {
          throw new Error("No workflows found");
        }

        // Derive initial nodes and edges from the selected workflow
        const initialNodes = workflow.components.map((comp, idx) => ({
          id: comp.id,
          type: comp.id,
          position: { x: idx * 200, y: 100 * (idx % 2 === 0 ? 1 : 2) },
          data: {
            label: comp.id,
            subscribe: comp.subscribe || [],
            emits: comp.emits || [],
          },
        }));

        // Build edges based on emitted/subscribed events
        const subscribersMap = {};
        initialNodes.forEach((node) => {
          (node.data.subscribe || []).forEach((evt) => {
            if (!subscribersMap[evt]) subscribersMap[evt] = [];
            subscribersMap[evt].push(node.id);
          });
        });

        const initialEdges = [];
        initialNodes.forEach((node) => {
          (node.data.emits || []).forEach((emittedEvent) => {
            const subscribers = subscribersMap[emittedEvent] || [];
            subscribers.forEach((subNodeId) => {
              if (subNodeId !== node.id) {
                initialEdges.push({
                  id: `${node.id}-${subNodeId}-${emittedEvent}`,
                  source: node.id,
                  target: subNodeId,
                });
              }
            });
          });
        });

        setNodes(initialNodes);
        setEdges(initialEdges);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    loadWorkflows();
  }, [selectedWorkflow]); // Include selectedWorkflow as a dependency

  return { nodes, edges, loading, error };
}
