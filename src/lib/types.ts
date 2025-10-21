import { Timestamp } from "firebase/firestore";

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'standard';
  avatarUrl: string;
};

export type Visitor = {
  id: string;
  name: string;
  company: string;
  timestamp: Date;
};

export type VisitRegistration = {
    id: string;
    name: string;
    company: string;
    timestamp: Timestamp;
}

export type Terminal = {
  id: string;
  name: string;
  location: string;
};

export type Incident = {
  id: string;
  code: string;
  description: string;
};

export type Punch = {
  id: string;
  employeeId: string;
  terminalId: string;
  incidentId?: string;
  timestamp: Timestamp;
  isManual?: boolean;
};

export type PunchWithDetails = Punch & {
  employee: Employee;
  terminal: Terminal;
  incident?: Incident;
  dailyPunchCount: number;
};

export type UsuariDins = {
  id: string; // P_CI
  nom: string;
  cognoms: string;
  horaDarreraEntrada: Timestamp;
  nombreMoviments: number;
};

export type Directori = {
  id: string;
  nom: string;
  cognom: string;
  email: string;
  edifici: string;
  empresa: string;
  departament: string;
  carrec: string;
  descripcioCarrec: string;
  telefons: string[];
  fotoUrl: string;
  responsable: string;
  planta: string;
  centreCost: string;
};
