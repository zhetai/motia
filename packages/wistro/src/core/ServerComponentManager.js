import { pathToFileURL } from "url";

export class ServerComponentManager {
  constructor(stateAdapter) {
    this.components = new Map();
    this.stateAdapter = stateAdapter;
  }

  register(componentId, codePath) {
    this.components.set(componentId, codePath);
    console.log(
      `[ServerComponentManager] Registered component: ${componentId}`
    );
  }

  async execute(componentId, event, { traceId, emit }) {
    const codePath = this.components.get(componentId);
    if (!codePath) {
      console.error(
        `[ServerComponentManager] Component not found: ${componentId}`
      );
      return;
    }

    try {
      const moduleUrl = pathToFileURL(codePath).href + `?update=${Date.now()}`;
      const compModule = await import(moduleUrl);

      const emittedEvents = [];

      const ctx = {
        state: this.stateAdapter,
        traceId,
        emit: async (newEvent) => {
          const enrichedEvent = {
            ...newEvent,
            metadata: {
              ...(newEvent.metadata || {}),
              workflowTraceId: traceId,
            },
          };
          emittedEvents.push(enrichedEvent);
          await emit(enrichedEvent, componentId);
        },
      };

      await compModule.default(event.data, ctx.emit, ctx);

      if (emittedEvents.length > 0) {
        console.log(
          `[ServerComponentManager] Component ${componentId} emitted ${emittedEvents.length} event(s)`
        );
      }
    } catch (error) {
      console.error(
        `[ServerComponentManager] Error executing component ${componentId}:`,
        error
      );
      throw error;
    }
  }

  clear() {
    this.components.clear();
  }
}
