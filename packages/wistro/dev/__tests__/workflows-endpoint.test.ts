import { z } from 'zod';
import { Config, WorkflowStep } from '../config.types'
import { generateWorkflowsList } from '../workflows-endpoint';
import { mockWorkflowSteps } from '../../test/fixtures/mockedWorkflowSteps';
import { mockConfigWithoutTriggers, mockValidConfig } from '../../test/fixtures/mockedConfig';

// Mock randomUUID for consistent test results
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-uuid'),
}));

describe('generateWorkflowsList', () => {
  it('should generate a list of workflows with steps', () => {
    const result = generateWorkflowsList(mockValidConfig, mockWorkflowSteps);

    expect(result.map(({ id }) => id)).toEqual(['workflow1']);
    expect(result.map(({ steps }) => steps.map(step => step.name)).flat()).toEqual([
      'Path 1',
      'Path 2',
      'Step 1', 
      'Step 2',
      'Step 3',
      'Cron Job 1'
    ]);
  });

  it('should throw an error for missing workflow in steps', () => {
    const mockWorkflowSteps: WorkflowStep[] = [
      {
        config: {
          workflow: 'workflow2', // Invalid workflow
          name: 'Step 1',
          description: 'First step',
          emits: ['event1'],
          subscribes: [],
          input: z.object({}),
        },
        filePath: 'step1/path',
        file: 'path',
      },
    ];

    expect(() => generateWorkflowsList(mockConfigWithoutTriggers, mockWorkflowSteps)).toThrow(
      'Unknown workflow name workflow2 in step1/path, all workflows should be defined in the config.yml'
    );
  });

  it('should throw an error if no workflow steps are found for a workflow', () => {
    const mockWorkflowSteps: WorkflowStep[] = [];

    expect(() => generateWorkflowsList(mockConfigWithoutTriggers, mockWorkflowSteps)).toThrow(
      'No workflow steps found for workflow with id workflow1'
    );
  });

  it('should throw an error if no triggers are found for a workflow', () => {
    const mockWorkflowSteps: WorkflowStep[] = [
      {
        config: {
          workflow: 'workflow1',
          name: 'Step 1',
          description: 'First step',
          emits: ['event1'],
          subscribes: [],
          input: z.object({}),
        },
        filePath: 'step1/path',
        file: 'path',
      },
    ];

    expect(() => generateWorkflowsList(mockConfigWithoutTriggers, mockWorkflowSteps)).toThrow(
      'No triggers (api or cron) found for workflow with id workflow1'
    );
  });
});
