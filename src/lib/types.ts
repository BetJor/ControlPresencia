export type Employee = {
  id: string;
  name: string;
  cognoms: string; // Surname
  role: 'admin' | 'standard';
  avatarUrl: string;
};

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
  timestamp: Date;
};

export type PunchWithDetails = Punch & {
  employee: Employee;
  terminal: Terminal;
  incident?: Incident;
  dailyPunchCount: number;
};
