"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestorePermissionError = void 0;
const auth_1 = require("firebase/auth");
/**
 * Builds a security-rule-compliant auth object from the Firebase User.
 * @param currentUser The currently authenticated Firebase user.
 * @returns An object that mirrors request.auth in security rules, or null.
 */
function buildAuthObject(currentUser) {
    var _a;
    if (!currentUser) {
        return null;
    }
    const token = {
        name: currentUser.displayName,
        email: currentUser.email,
        email_verified: currentUser.emailVerified,
        phone_number: currentUser.phoneNumber,
        sub: currentUser.uid,
        firebase: {
            identities: currentUser.providerData.reduce((acc, p) => {
                if (p.providerId) {
                    acc[p.providerId] = [p.uid];
                }
                return acc;
            }, {}),
            sign_in_provider: ((_a = currentUser.providerData[0]) === null || _a === void 0 ? void 0 : _a.providerId) || 'custom',
            tenant: currentUser.tenantId,
        },
    };
    return {
        uid: currentUser.uid,
        token: token,
    };
}
/**
 * Builds the complete, simulated request object for the error message.
 * It safely tries to get the current authenticated user.
 * @param context The context of the failed Firestore operation.
 * @returns A structured request object.
 */
function buildRequestObject(context) {
    let authObject = null;
    try {
        // Safely attempt to get the current user.
        const firebaseAuth = (0, auth_1.getAuth)();
        const currentUser = firebaseAuth.currentUser;
        if (currentUser) {
            authObject = buildAuthObject(currentUser);
        }
    }
    catch (_a) {
        // This will catch errors if the Firebase app is not yet initialized.
        // In this case, we'll proceed without auth information.
    }
    return {
        auth: authObject,
        method: context.operation,
        path: `/databases/(default)/documents/${context.path}`,
        resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
    };
}
/**
 * Builds the final, formatted error message for the LLM.
 * @param requestObject The simulated request object.
 * @returns A string containing the error message and the JSON payload.
 */
function buildErrorMessage(requestObject) {
    return `Missing or insufficient permissions: The following request was denied by Firestore Security Rules:
${JSON.stringify(requestObject, null, 2)}`;
}
/**
 * A custom error class designed to be consumed by an LLM for debugging.
 * It structures the error information to mimic the request object
 * available in Firestore Security Rules.
 */
class FirestorePermissionError extends Error {
    constructor(context) {
        const requestObject = buildRequestObject(context);
        super(buildErrorMessage(requestObject));
        this.name = 'FirebaseError';
        this.request = requestObject;
    }
}
exports.FirestorePermissionError = FirestorePermissionError;
//# sourceMappingURL=errors.js.map