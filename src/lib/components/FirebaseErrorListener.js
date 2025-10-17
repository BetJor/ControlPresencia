"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseErrorListener = FirebaseErrorListener;
const react_1 = require("react");
const error_emitter_1 = require("@/firebase/error-emitter");
/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 */
function FirebaseErrorListener() {
    // Use the specific error type for the state for type safety.
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        // The callback now expects a strongly-typed error, matching the event payload.
        const handleError = (error) => {
            // Set error in state to trigger a re-render.
            setError(error);
        };
        // The typed emitter will enforce that the callback for 'permission-error'
        // matches the expected payload type (FirestorePermissionError).
        error_emitter_1.errorEmitter.on('permission-error', handleError);
        // Unsubscribe on unmount to prevent memory leaks.
        return () => {
            error_emitter_1.errorEmitter.off('permission-error', handleError);
        };
    }, []);
    // On re-render, if an error exists in state, throw it.
    if (error) {
        throw error;
    }
    // This component renders nothing.
    return null;
}
//# sourceMappingURL=FirebaseErrorListener.js.map