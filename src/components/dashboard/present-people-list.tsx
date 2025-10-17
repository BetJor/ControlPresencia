import { determineStaffPresent } from '@/ai/flows/determine-staff-present';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockEmployees, mockPunches, mockVisitors } from '@/lib/mock-data';
import type { Employee, Visitor } from '@/lib/types';
import { Contact, Users, User } from 'lucide-react';

const getTodaysPunches = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return mockPunches.filter(punch => {
    const punchDate = new Date(punch.timestamp);
    return punchDate >= today && punchDate < tomorrow;
  });
};

const getTodaysVisitors = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return mockVisitors.filter(visitor => {
    const visitorDate = new Date(visitor.timestamp);
    return visitorDate >= today && visitorDate < tomorrow;
  });
}


export default async function PresentPeopleList() {
  const employeeIds = mockEmployees.map((e) => e.id);
  const todaysPunches = getTodaysPunches();
  
  const dailyPunchCounts = employeeIds.reduce((acc, employeeId) => {
    acc[employeeId] = todaysPunches.filter(p => p.employeeId === employeeId).length;
    return acc;
  }, {} as Record<string, number>);

  const { presentEmployeeIds } = await determineStaffPresent({
    employeeIds,
    dailyPunchCounts,
  });

  const presentStaff: Employee[] = mockEmployees.filter(employee =>
    presentEmployeeIds.includes(employee.id)
  );

  const presentVisitors: Visitor[] = getTodaysVisitors();

  const totalPresent = presentStaff.length + presentVisitors.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Users className="h-6 w-6" />
            Personas en la Oficina ({totalPresent})
        </CardTitle>
        <CardDescription>
          Una lista de los empleados y visitas que se encuentran actualmente en las instalaciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Avatar</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden sm:table-cell">Detalle</TableHead>
              <TableHead className="hidden sm:table-cell">Hora Entrada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
             {presentStaff.map((employee) => (
                <TableRow key={`emp-${employee.id}`}>
                    <TableCell>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                            <AvatarFallback>{employee.name.charAt(0)}{employee.cognoms.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </TableCell>
                    <TableCell>
                        <div className="font-medium">{employee.name} {employee.cognoms}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <User className="h-3 w-3" />
                            Empleado
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{employee.role}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        {todaysPunches.find(p => p.employeeId === employee.id)?.timestamp.toLocaleTimeString()}
                    </TableCell>
                </TableRow>
             ))}
             {presentVisitors.map((visitor) => (
                <TableRow key={`vis-${visitor.id}`}>
                    <TableCell>
                        <Avatar className="h-10 w-10">
                            <AvatarFallback>{visitor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </TableCell>
                    <TableCell>
                        <div className="font-medium">{visitor.name}</div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Contact className="h-3 w-3" />
                            Visita
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{visitor.company}</TableCell>
                    <TableCell className="hidden sm:table-cell">{visitor.timestamp.toLocaleTimeString()}</TableCell>
                </TableRow>
             ))}
             {totalPresent === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No hay nadie en la oficina en este momento.
                    </TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
