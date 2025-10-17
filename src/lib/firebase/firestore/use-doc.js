"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDoc = useDoc;
const react_1 = require("react");
const firestore_1 = require("firebase/firestore");
const error_emitter_1 = require("@/firebase/error-emitter");
const errors_1 = require("@/firebase/errors");
/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} docRef -
 * The Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
function useDoc(memoizedDocRef) {
    const [data, setData] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!memoizedDocRef) {
            setData(null);
            setIsLoading(false);
            setError(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        // Optional: setData(null); // Clear previous data instantly
        const unsubscribe = (0, firestore_1.onSnapshot)(memoizedDocRef, (snapshot) => {
            if (snapshot.exists()) {
                setData(Object.assign(Object.assign({}, snapshot.data()), { id: snapshot.id }));
            }
            else {
                // Document does not exist
                setData(null);
            }
            setError(null); // Clear any previous error on successful snapshot (even if doc doesn't exist)
            setIsLoading(false);
        }, (error) => {
            const contextualError = new errors_1.FirestorePermissionError({
                operation: 'get',
                path: memoizedDocRef.path,
            });
            setError(contextualError);
            setData(null);
            setIsLoading(false);
            // trigger global error propagation
            error_emitter_1.errorEmitter.emit('permission-error', contextualError);
        });
        return () => unsubscribe();
    }, [memoizedDocRef]); // Re-run if the memoizedDocRef changes.
    return { data, isLoading, error };
}
//# sourceMappingURL=use-doc.js.map