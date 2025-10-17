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
