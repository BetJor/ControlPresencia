"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorEmitter = void 0;
/**
 * A strongly-typed pub/sub event emitter.
 * It uses a generic type T that extends a record of event names to payload types.
 */
function createEventEmitter() {
    // The events object stores arrays of callbacks, keyed by event name.
    // The types ensure that a callback for a specific event matches its payload type.
    const events = {};
    return {
        /**
         * Subscribe to an event.
         * @param eventName The name of the event to subscribe to.
         * @param callback The function to call when the event is emitted.
         */
        on(eventName, callback) {
            var _a;
            if (!events[eventName]) {
                events[eventName] = [];
            }
            (_a = events[eventName]) === null || _a === void 0 ? void 0 : _a.push(callback);
        },
        /**
         * Unsubscribe from an event.
         * @param eventName The name of the event to unsubscribe from.
         * @param callback The specific callback to remove.
         */
        off(eventName, callback) {
            var _a;
            if (!events[eventName]) {
                return;
            }
            events[eventName] = (_a = events[eventName]) === null || _a === void 0 ? void 0 : _a.filter(cb => cb !== callback);
        },
        /**
         * Publish an event to all subscribers.
         * @param eventName The name of the event to emit.
         * @param data The data payload that corresponds to the event's type.
         */
        emit(eventName, data) {
            var _a;
            if (!events[eventName]) {
                return;
            }
            (_a = events[eventName]) === null || _a === void 0 ? void 0 : _a.forEach(callback => callback(data));
        },
    };
}
// Create and export a singleton instance of the emitter, typed with our AppEvents interface.
exports.errorEmitter = createEventEmitter();
//# sourceMappingURL=error-emitter.js.map