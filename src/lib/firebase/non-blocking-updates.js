"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDocumentNonBlocking = setDocumentNonBlocking;
exports.addDocumentNonBlocking = addDocumentNonBlocking;
exports.updateDocumentNonBlocking = updateDocumentNonBlocking;
exports.deleteDocumentNonBlocking = deleteDocumentNonBlocking;
const firestore_1 = require("firebase/firestore");
const error_emitter_1 = require("@/firebase/error-emitter");
const errors_1 = require("@/firebase/errors");
/**
 * Initiates a setDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
function setDocumentNonBlocking(docRef, data, options) {
    (0, firestore_1.setDoc)(docRef, data, options).catch(error => {
        error_emitter_1.errorEmitter.emit('permission-error', new errors_1.FirestorePermissionError({
            path: docRef.path,
            operation: 'write', // or 'create'/'update' based on options
            requestResourceData: data,
        }));
    });
    // Execution continues immediately
}
/**
 * Initiates an addDoc operation for a collection reference.
 * Does NOT await the write operation internally.
 * Returns the Promise for the new doc ref, but typically not awaited by caller.
 */
function addDocumentNonBlocking(colRef, data) {
    const promise = (0, firestore_1.addDoc)(colRef, data)
        .catch(error => {
        error_emitter_1.errorEmitter.emit('permission-error', new errors_1.FirestorePermissionError({
            path: colRef.path,
            operation: 'create',
            requestResourceData: data,
        }));
    });
    return promise;
}
/**
 * Initiates an updateDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
function updateDocumentNonBlocking(docRef, data) {
    (0, firestore_1.updateDoc)(docRef, data)
        .catch(error => {
        error_emitter_1.errorEmitter.emit('permission-error', new errors_1.FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: data,
        }));
    });
}
/**
 * Initiates a deleteDoc operation for a document reference.
 * Does NOT await the write operation internally.
 */
function deleteDocumentNonBlocking(docRef) {
    (0, firestore_1.deleteDoc)(docRef)
        .catch(error => {
        error_emitter_1.errorEmitter.emit('permission-error', new errors_1.FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        }));
    });
}
//# sourceMappingURL=non-blocking-updates.js.map