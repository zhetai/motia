export class ComponentTestHelper {
  constructor() {
    this.emittedEvents = [];
  }

  async runComponent(componentFn, input) {
    const emit = async (event) => {
      this.emittedEvents.push(event);
    };

    await componentFn(input, emit);
    return this.emittedEvents;
  }

  clear() {
    this.emittedEvents = [];
  }
}
