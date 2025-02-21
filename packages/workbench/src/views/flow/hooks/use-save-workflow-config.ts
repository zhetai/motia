import { useCallback } from 'react';

export const useSaveWorkflowConfig = (flowId: string) => {
  const saveConfig = useCallback(async (config: any) => {
    try {
      const response = await fetch(`/flows/${flowId}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Failed to save config: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving workflow config:', error);
      throw error;
    }
  }, [flowId]);

  return { saveConfig };
};