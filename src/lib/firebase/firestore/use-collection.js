"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCollection = useCollection;
const react_1 = require("react");
const firestore_1 = require("firebase/firestore");
const error_emitter_1 = require("@/firebase/error-emitter");
const errors_1 = require("@/firebase/errors");
/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references/queries.
 *
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} targetRefOrQuery -
 * The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
function useCollection(memoizedTargetRefOrQuery) {
    const [data, setData] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        if (!memoizedTargetRefOrQuery) {
            setData(null);
            setIsLoading(false);
            setError(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        // Directly use memoizedTargetRefOrQuery as it's assumed to be the final query
        const unsubscribe = (0, firestore_1.onSnapshot)(memoizedTargetRefOrQuery, (snapshot) => {
            const results = [];
            for (const doc of snapshot.docs) {
                results.push(Object.assign(Object.assign({}, doc.data()), { id: doc.id }));
            }
            setData(results);
            setError(null);
            setIsLoading(false);
        }, (error) => {
            // This logic extracts the path from either a ref or a query
            const path = memoizedTargetRefOrQuery.type === 'collection'
                ? memoizedTargetRefOrQuery.path
                : memoizedTargetRefOrQuery._query.path.canonicalString();
            const contextualError = new errors_1.FirestorePermissionError({
                operation: 'list',
                path,
            });
            setError(contextualError);
            setData(null);
            setIsLoading(false);
            // trigger global error propagation
            error_emitter_1.errorEmitter.emit('permission-error', contextualError);
        });
        return () => unsubscribe();
    }, [memoizedTargetRefOrQuery]); // Re-run if the target query/reference changes.
    if (memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
        throw new Error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
    }
    return { data, isLoading, error };
}
//# sourceMappingURL=use-collection.js.map