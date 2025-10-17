import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockEmployees, mockIncidents, mockPunches, mockTerminals } from '@/lib/mock-data';
import type { PunchWithDetails } from '@/lib/types';
import { List } from 'lucide-react';

const getPunchDetails = (): PunchWithDetails[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysPunches = mockPunches.filter(p => new Date(p.timestamp) >= today && new Date(p.timestamp) < tomorrow);

    const dailyPunchCounts = todaysPunches.reduce((acc, punch) => {
        acc[punch.employeeId] = (acc[punch.employeeId] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return todaysPunches.map(punch => {
        const employee = mockEmployees.find(e => e.id === punch.employeeId)!;
        const terminal = mockTerminals.find(t => t.id === punch.terminalId)!;
        const incident = mockIncidents.find(i => i.id === punch.incidentId);
        
        return {
            ...punch,
            employee,
            terminal,
            incident,
            dailyPunchCount: dailyPunchCounts[punch.employeeId] || 0
        };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export default function PunchLog() {
  const detailedPunches = getPunchDetails();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='font-headline flex items-center gap-2'>
            <List className="h-6 w-6"/>
            Registro de Fichajes de Hoy
        </CardTitle>
        <CardDescription>
          Un registro en tiempo real de todas las entradas y salidas de empleados del día.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Apellidos</TableHead>
              <TableHead className="hidden sm:table-cell">Nombre</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead className="hidden md:table-cell">Terminal</TableHead>
              <TableHead className="text-right">Fichajes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detailedPunches.map(punch => (
              <TableRow key={punch.id}>
                <TableCell>
                  <div className="font-medium">{punch.employee.cognoms}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">{punch.employee.name}</TableCell>
                <TableCell>
                    {punch.timestamp.toLocaleTimeString()}
                    {punch.incident && (
                        <Badge variant="destructive" className="ml-2">{punch.incident.code}</Badge>
                    )}
                </TableCell>
                <TableCell className="hidden md:table-cell">{punch.terminal.name}</TableCell>
                <TableCell className="text-right">
                    <Badge variant={punch.dailyPunchCount % 2 === 0 ? "secondary" : "default"} className={punch.dailyPunchCount % 2 !== 0 ? 'bg-accent text-accent-foreground' : ''}>
                        {punch.dailyPunchCount}
                    </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
