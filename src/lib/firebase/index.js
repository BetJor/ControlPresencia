"use strict";
'use client';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirebase = initializeFirebase;
exports.getSdks = getSdks;
const config_1 = require("@/firebase/config");
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
// IMPORTANT: DO NOT MODIFY THIS FUNCTION
function initializeFirebase() {
    if (!(0, app_1.getApps)().length) {
        // Important! initializeApp() is called without any arguments because Firebase App Hosting
        // integrates with the initializeApp() function to provide the environment variables needed to
        // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
        // without arguments.
        let firebaseApp;
        try {
            // Attempt to initialize via Firebase App Hosting environment variables
            firebaseApp = (0, app_1.initializeApp)();
        }
        catch (e) {
            // Only warn in production because it's normal to use the firebaseConfig to initialize
            // during development
            if (process.env.NODE_ENV === "production") {
                console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
            }
            firebaseApp = (0, app_1.initializeApp)(config_1.firebaseConfig);
        }
        return getSdks(firebaseApp);
    }
    // If already initialized, return the SDKs with the already initialized App
    return getSdks((0, app_1.getApp)());
}
function getSdks(firebaseApp) {
    return {
        firebaseApp,
        auth: (0, auth_1.getAuth)(firebaseApp),
        firestore: (0, firestore_1.getFirestore)(firebaseApp)
    };
}
__exportStar(require("./provider"), exports);
__exportStar(require("./client-provider"), exports);
__exportStar(require("./firestore/use-collection"), exports);
__exportStar(require("./firestore/use-doc"), exports);
__exportStar(require("./non-blocking-updates"), exports);
__exportStar(require("./non-blocking-login"), exports);
__exportStar(require("./errors"), exports);
__exportStar(require("./error-emitter"), exports);
//# sourceMappingURL=index.js.map