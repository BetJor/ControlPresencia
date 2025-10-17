"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateAnonymousSignIn = initiateAnonymousSignIn;
exports.initiateEmailSignUp = initiateEmailSignUp;
exports.initiateEmailSignIn = initiateEmailSignIn;
const auth_1 = require("firebase/auth");
/** Initiate anonymous sign-in (non-blocking). */
function initiateAnonymousSignIn(authInstance) {
    // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
    (0, auth_1.signInAnonymously)(authInstance);
    // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
/** Initiate email/password sign-up (non-blocking). */
function initiateEmailSignUp(authInstance, email, password) {
    // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
    (0, auth_1.createUserWithEmailAndPassword)(authInstance, email, password);
    // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
/** Initiate email/password sign-in (non-blocking). */
function initiateEmailSignIn(authInstance, email, password) {
    // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
    (0, auth_1.signInWithEmailAndPassword)(authInstance, email, password);
    // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
//# sourceMappingURL=non-blocking-login.js.map