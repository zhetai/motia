/**
 * Testing Utilities: MotiaTest
 * ----------------------------
 * MotiaTest offers testing utilities to validate components, thresholds, and LLM logic within the Motia framework.
 * It provides mock emit functions, component test helpers, and performance test runners.
 *
 * Key Responsibilities:
 * - Create mock emit functions to simulate event emission in tests
 * - Provide helper functions for component-level testing and threshold verification
 * - Offer utilities for load testing and accuracy measurement of LLM outputs
 *
 * This class simplifies and standardizes how developers test their Motia-based workflows, ensuring reliability and correctness.
 */
export class MotiaTest {
  static mockEmit() {
    const mock = (...args) => {};
    mock.mock = { calls: [] };
    const wrapper = (event, options) => {
      mock.mock.calls.push([event, options]);
    };
    return wrapper;
  }

  static createComponentTest(component, options) {
    return async (input, emit) => {
      const mockEmit = emit || MotiaTest.mockEmit();
      // If mocks needed, must be handled outside this method for ESM.
      await component(input, mockEmit, "test.event");
    };
  }

  static createThresholdTest(component, options) {
    return async () => {
      const results = {
        accuracy: 0,
        latency: { p95: 0, p99: 0 },
        successRate: 0,
        totalRuns: 0,
        errors: [],
      };

      const runTest = async (input) => {
        const startTime = Date.now();
        try {
          const mockEmit = MotiaTest.mockEmit();
          await component(input, mockEmit, "test.event");
          results.totalRuns++;
          return Date.now() - startTime;
        } catch (error) {
          results.errors.push(
            error instanceof Error ? error : new Error(String(error))
          );
          return null;
        }
      };

      if (options.loadTestOptions) {
        const { rps, duration } = options.loadTestOptions;
        const durationMs = parseDuration(duration);
        const interval = 1000 / rps;
        const endTime = Date.now() + durationMs;
        const latencies = [];

        while (Date.now() < endTime) {
          for (const data of options.testData) {
            const latency = await runTest(data);
            if (latency) latencies.push(latency);
            await sleep(interval);
          }
        }

        latencies.sort((a, b) => a - b);
        results.latency.p95 = latencies[Math.floor(latencies.length * 0.95)];
        results.latency.p99 = latencies[Math.floor(latencies.length * 0.99)];
      } else {
        for (const data of options.testData) {
          await runTest(data);
        }
      }

      results.successRate =
        (results.totalRuns - results.errors.length) / results.totalRuns;
      return results;
    };
  }

  static createLLMTest(component, options) {
    return async () => {
      const results = {
        accuracy: 0,
        consistency: 0,
        averageConfidence: 0,
        edgeCaseResults: [],
        errors: [],
      };

      for (const data of options.testData) {
        const outputs = [];
        for (let i = 0; i < (options.consistencyRuns || 1); i++) {
          const mockEmit = MotiaTest.mockEmit();
          try {
            await component(data, mockEmit, "test.event");
            outputs.push(mockEmit.mock.calls[0]?.[0]?.data);
          } catch (error) {
            results.errors.push(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }

        if (outputs.length > 1) {
          results.consistency += calculateConsistency(outputs);
        }
      }

      if (options.edgeCases) {
        for (const edgeCase of options.edgeCases) {
          const mockEmit = MotiaTest.mockEmit();
          try {
            await component(edgeCase.input, mockEmit, "test.event");
            const output = mockEmit.mock.calls[0]?.[0]?.data;
            results.edgeCaseResults.push({
              input: edgeCase.input,
              expected: edgeCase.expect,
              actual: output,
              passed: output === edgeCase.expect,
            });
          } catch (error) {
            results.errors.push(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }
      }

      results.accuracy = calculateAccuracy(results.edgeCaseResults);
      if (options.consistencyRuns) {
        results.consistency /= options.testData.length;
      }

      return results;
    };
  }
}
