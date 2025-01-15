"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateAdapter = void 0;
/**
 * Interface for state management adapters
 */
class StateAdapter {
    async get(traceId, key) {
        throw new Error('Method not implemented');
    }
    async set(traceId, key, value) {
        throw new Error('Method not implemented');
    }
    async delete(traceId, key) {
        throw new Error('Method not implemented');
    }
    async clear(traceId) {
        throw new Error('Method not implemented');
    }
    async cleanup() {
        throw new Error('Method not implemented');
    }
}
exports.StateAdapter = StateAdapter;
