import { useState, useEffect } from 'react';

export function useWorkflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWorkflows() {
      try {
        const res = await fetch("/api/workflows");
        if (!res.ok) {
          throw new Error(`Failed to fetch workflows: ${res.statusText}`);
        }
        const data = await res.json();
        setWorkflows(data.workflows || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchWorkflows();
  }, []);

  return { workflows, loading, error };
}
