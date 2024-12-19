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
        let workflow = data.workflows.find(w => w.name === selectedWorkflow) || data.workflows?.[0];
        if (!workflow) {
          throw new Error("No workflows found");
        }

        const rawNodes = workflow.components.map((comp, idx) => ({
          id: comp.id,
          type: comp.id,
          position: { x: idx * 200, y: 100 * (idx % 2 === 0 ? 1 : 2) },
          data: {
            label: comp.id,
            subscribe: comp.subscribe || [],
            emits: comp.emits || [],
          },
        }));

        // Map: event -> list of node IDs that subscribe to it
        const subscribersMap = {};
        rawNodes.forEach((node) => {
          (node.data.subscribe || []).forEach((evt) => {
            if (!subscribersMap[evt]) subscribersMap[evt] = [];
            subscribersMap[evt].push(node.id);
          });
        });

        const rawEdges = [];
        rawNodes.forEach((node) => {
          (node.data.emits || []).forEach((emittedEvent) => {
            const subscribers = subscribersMap[emittedEvent] || [];
            subscribers.forEach((subNodeId) => {
              if (subNodeId !== node.id) {
                rawEdges.push({
                  id: `${node.id}-${subNodeId}-${emittedEvent}`,
                  source: node.id,
                  target: subNodeId,
                });
              }
            });
          });
        });

        setNodes(rawNodes);
        setEdges(rawEdges);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    loadWorkflows();
  }, []);

  return { nodes, edges, loading, error };
}
