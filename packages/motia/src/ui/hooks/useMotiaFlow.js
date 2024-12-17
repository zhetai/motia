import { useEffect, useState } from "react";

export function useMotiaFlow() {
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
        const workflow = data.workflows?.[0];

        if (!workflow) {
          throw new Error("No workflows found");
        }

        const transformedNodes = workflow.components.map((comp, idx) => ({
          id: comp.id,
          type: comp.id,
          position: { x: idx * 200, y: 100 },
          data: { label: comp.id, subscribe: comp.subscribe },
        }));

        setNodes(transformedNodes);
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
