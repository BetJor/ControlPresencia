"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUser = exports.useFirebaseApp = exports.useFirestore = exports.useAuth = exports.useFirebase = exports.FirebaseProvider = exports.FirebaseContext = void 0;
exports.useMemoFirebase = useMemoFirebase;
const react_1 = require("react");
const auth_1 = require("firebase/auth");
const FirebaseErrorListener_1 = require("@/components/FirebaseErrorListener");
// React Context
exports.FirebaseContext = (0, react_1.createContext)(undefined);
/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
const FirebaseProvider = ({ children, firebaseApp, firestore, auth, }) => {
    const [userAuthState, setUserAuthState] = (0, react_1.useState)({
        user: null,
        isUserLoading: true, // Start loading until first auth event
        userError: null,
    });
    // Effect to subscribe to Firebase auth state changes
    (0, react_1.useEffect)(() => {
        if (!auth) { // If no Auth service instance, cannot determine user state
            setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
            return;
        }
        setUserAuthState({ user: null, isUserLoading: true, userError: null }); // Reset on auth instance change
        const unsubscribe = (0, auth_1.onAuthStateChanged)(auth, (firebaseUser) => {
            setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
        }, (error) => {
            console.error("FirebaseProvider: onAuthStateChanged error:", error);
            setUserAuthState({ user: null, isUserLoading: false, userError: error });
        });
        return () => unsubscribe(); // Cleanup
    }, [auth]); // Depends on the auth instance
    // Memoize the context value
    const contextValue = (0, react_1.useMemo)(() => {
        const servicesAvailable = !!(firebaseApp && firestore && auth);
        return {
            areServicesAvailable: servicesAvailable,
            firebaseApp: servicesAvailable ? firebaseApp : null,
            firestore: servicesAvailable ? firestore : null,
            auth: servicesAvailable ? auth : null,
            user: userAuthState.user,
            isUserLoading: userAuthState.isUserLoading,
            userError: userAuthState.userError,
        };
    }, [firebaseApp, firestore, auth, userAuthState]);
    return (<exports.FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener_1.FirebaseErrorListener />
      {children}
    </exports.FirebaseContext.Provider>);
};
exports.FirebaseProvider = FirebaseProvider;
/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
const useFirebase = () => {
    const context = (0, react_1.useContext)(exports.FirebaseContext);
    if (context === undefined) {
        throw new Error('useFirebase must be used within a FirebaseProvider.');
    }
    if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
        throw new Error('Firebase core services not available. Check FirebaseProvider props.');
    }
    return {
        firebaseApp: context.firebaseApp,
        firestore: context.firestore,
        auth: context.auth,
        user: context.user,
        isUserLoading: context.isUserLoading,
        userError: context.userError,
    };
};
exports.useFirebase = useFirebase;
/** Hook to access Firebase Auth instance. */
const useAuth = () => {
    const { auth } = (0, exports.useFirebase)();
    return auth;
};
exports.useAuth = useAuth;
/** Hook to access Firestore instance. */
const useFirestore = () => {
    const { firestore } = (0, exports.useFirebase)();
    return firestore;
};
exports.useFirestore = useFirestore;
/** Hook to access Firebase App instance. */
const useFirebaseApp = () => {
    const { firebaseApp } = (0, exports.useFirebase)();
    return firebaseApp;
};
exports.useFirebaseApp = useFirebaseApp;
function useMemoFirebase(factory, deps) {
    const memoized = (0, react_1.useMemo)(factory, deps);
    if (typeof memoized !== 'object' || memoized === null)
        return memoized;
    memoized.__memo = true;
    return memoized;
}
/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
const useUser = () => {
    const { user, isUserLoading, userError } = (0, exports.useFirebase)(); // Leverages the main hook
    return { user, isUserLoading, userError };
};
exports.useUser = useUser;
//# sourceMappingURL=provider.js.map