"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockVisitors = exports.mockPunches = exports.mockIncidents = exports.mockTerminals = exports.mockEmployees = void 0;
const placeholder_images_1 = require("./placeholder-images");
exports.mockEmployees = [
    { id: 'E1', firstName: 'Sarah', lastName: 'Johnson', role: 'admin', avatarUrl: ((_a = placeholder_images_1.PlaceHolderImages.find(p => p.id === 'user1')) === null || _a === void 0 ? void 0 : _a.imageUrl) || '' },
    { id: 'E2', firstName: 'Michael', lastName: 'Smith', role: 'standard', avatarUrl: ((_b = placeholder_images_1.PlaceHolderImages.find(p => p.id === 'user2')) === null || _b === void 0 ? void 0 : _b.imageUrl) || '' },
    { id: 'E3', firstName: 'Emily', lastName: 'Davis', role: 'standard', avatarUrl: ((_c = placeholder_images_1.PlaceHolderImages.find(p => p.id === 'user3')) === null || _c === void 0 ? void 0 : _c.imageUrl) || '' },
    { id: 'E4', firstName: 'David', lastName: 'Chen', role: 'standard', avatarUrl: ((_d = placeholder_images_1.PlaceHolderImages.find(p => p.id === 'user4')) === null || _d === void 0 ? void 0 : _d.imageUrl) || '' },
];
exports.mockTerminals = [
    { id: 'T1', name: 'Entrada Principal', location: 'Lobby' },
    { id: 'T2', name: 'Puerta Almacén', location: 'Muelle de Carga' },
    { id: 'T3', name: 'Puerta Trasera Oficina', location: 'Planta 2' },
];
exports.mockIncidents = [
    { id: 'I1', code: 'LATE_IN', description: 'Llegó tarde' },
    { id: 'I2', code: 'EARLY_OUT', description: 'Se fue pronto' },
    { id: 'I3', code: 'FORGOT_PUNCH', description: 'Olvidó fichar' },
];
const today = new Date();
const setTime = (date, hours, minutes, seconds = 0) => {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, seconds, 0);
    return newDate;
};
exports.mockPunches = [
    { id: 'P1', employeeId: 'E1', terminalId: 'T1', timestamp: setTime(today, 8, 1) },
    { id: 'P2', employeeId: 'E2', terminalId: 'T1', timestamp: setTime(today, 8, 5) },
    { id: 'P3', employeeId: 'E3', terminalId: 'T2', timestamp: setTime(today, 8, 15), incidentId: 'I1' },
    { id: 'P4', employeeId: 'E1', terminalId: 'T1', timestamp: setTime(today, 12, 30) },
    { id: 'P5', employeeId: 'E2', terminalId: 'T1', timestamp: setTime(today, 12, 32) },
    { id: 'P6', employeeId: 'E1', terminalId: 'T1', timestamp: setTime(today, 13, 0), isManual: true },
    { id: 'P7', employeeId: 'E4', terminalId: 'T3', timestamp: setTime(today, 9, 0) },
];
exports.mockVisitors = [
    { id: 'V1', name: 'John Doe', company: 'Acme Inc.', timestamp: setTime(today, 9, 30) },
    { id: 'V2', name: 'Jane Smith', company: 'Beta Corp.', timestamp: setTime(today, 10, 15) },
];
//# sourceMappingURL=mock-data.js.map