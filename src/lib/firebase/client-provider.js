"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseClientProvider = FirebaseClientProvider;
const react_1 = require("react");
const provider_1 = require("@/firebase/provider");
const firebase_1 = require("@/firebase");
function FirebaseClientProvider({ children }) {
    const firebaseServices = (0, react_1.useMemo)(() => {
        // Initialize Firebase on the client side, once per component mount.
        return (0, firebase_1.initializeFirebase)();
    }, []); // Empty dependency array ensures this runs only once on mount
    return (<provider_1.FirebaseProvider firebaseApp={firebaseServices.firebaseApp} auth={firebaseServices.auth} firestore={firebaseServices.firestore}>
      {children}
    </provider_1.FirebaseProvider>);
}
//# sourceMappingURL=client-provider.js.map