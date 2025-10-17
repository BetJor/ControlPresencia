"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sincroPersonalScheduler = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firebase_functions_1 = require("firebase-functions");
require("../firebase/admin"); // Initializes Firebase Admin
const sincronizar_personal_presente_1 = require("../ai/flows/sincronizar-personal-presente");
exports.sincroPersonalScheduler = (0, scheduler_1.onSchedule)('every 1 minutes', async () => {
    firebase_functions_1.logger.info('Sincronizando personal presente...');
    try {
        const result = await (0, sincronizar_personal_presente_1.sincronitzarPersonal)({});
        firebase_functions_1.logger.info('Sincronización completada', result);
    }
    catch (error) {
        firebase_functions_1.logger.error('Error al sincronizar el personal', error);
    }
});
//# sourceMappingURL=sincronizar-personal-scheduler.js.map