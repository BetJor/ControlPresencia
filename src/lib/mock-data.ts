import type { Employee, Terminal, Incident, Punch, Visitor } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const mockEmployees: Employee[] = [
  { id: 'E1', name: 'Sarah', cognoms: 'Johnson', role: 'admin', avatarUrl: PlaceHolderImages.find(p => p.id === 'user1')?.imageUrl || '' },
  { id: 'E2', name: 'Michael', cognoms: 'Smith', role: 'standard', avatarUrl: PlaceHolderImages.find(p => p.id === 'user2')?.imageUrl || '' },
  { id: 'E3', name: 'Emily', cognoms: 'Davis', role: 'standard', avatarUrl: PlaceHolderImages.find(p => p.id === 'user3')?.imageUrl || '' },
  { id: 'E4', name: 'David', cognoms: 'Chen', role: 'standard', avatarUrl: PlaceHolderImages.find(p => p.id === 'user4')?.imageUrl || '' },
];

export const mockTerminals: Terminal[] = [
  { id: 'T1', name: 'Entrada Principal', location: 'Lobby' },
  { id: 'T2', name: 'Puerta Almacén', location: 'Muelle de Carga' },
  { id: 'T3', name: 'Puerta Trasera Oficina', location: 'Planta 2' },
];

export const mockIncidents: Incident[] = [
  { id: 'I1', code: 'LATE_IN', description: 'Llegó tarde' },
  { id: 'I2', code: 'EARLY_OUT', description: 'Se fue pronto' },
  { id: 'I3', code: 'FORGOT_PUNCH', description: 'Olvidó fichar' },
];

const today = new Date();
const setTime = (date: Date, hours: number, minutes: number, seconds: number = 0) => {
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, seconds, 0);
    return newDate;
}

export const mockPunches: Punch[] = [
  { id: 'P1', employeeId: 'E1', terminalId: 'T1', timestamp: setTime(today, 8, 1) },
  { id: 'P2', employeeId: 'E2', terminalId: 'T1', timestamp: setTime(today, 8, 5) },
  { id: 'P3', employeeId: 'E3', terminalId: 'T2', timestamp: setTime(today, 8, 15), incidentId: 'I1' },
  { id: 'P4', employeeId: 'E1', terminalId: 'T1', timestamp: setTime(today, 12, 30) },
  { id: 'P5', employeeId: 'E2', terminalId: 'T1', timestamp: setTime(today, 12, 32) },
  { id: 'P6', employeeId: 'E1', terminalId: 'T1', timestamp: setTime(today, 13, 0), isManual: true },
  { id: 'P7', employeeId: 'E4', terminalId: 'T3', timestamp: setTime(today, 9, 0) },
];

export const mockVisitors: Visitor[] = [
    { id: 'V1', name: 'John Doe', company: 'Acme Inc.', timestamp: setTime(today, 9, 30) },
    { id: 'V2', name: 'Jane Smith', company: 'Beta Corp.', timestamp: setTime(today, 10, 15) },
];
