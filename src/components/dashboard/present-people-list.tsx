import { determineStaffPresent } from '@/ai/flows/determine-staff-present';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockEmployees, mockPunches, mockVisitors } from '@/lib/mock-data';
import type { Employee, Visitor } from '@/lib/types';
import { Contact, Users, User } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
        <Accordion type="multiple" defaultValue={['visitors', 'employees']}>
          <AccordionItem value="visitors">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <Contact className="h-5 w-5" />
                <span>Visitas ({presentVisitors.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
               {presentVisitors.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead className="hidden sm:table-cell">Empresa</TableHead>
                            <TableHead className="hidden smn:table-cell">Hora Entrada</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {presentVisitors.map((visitor) => (
                            <TableRow key={`vis-${visitor.id}`}>
                                <TableCell>
                                    <div className="font-medium">{visitor.name}</div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{visitor.company}</TableCell>
                                <TableCell className="hidden sm:table-cell">{visitor.timestamp.toLocaleTimeString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        No hay visitas en la oficina.
                    </div>
                )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="employees">
            <AccordionTrigger className="text-base font-medium">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Empleados ({presentStaff.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {presentStaff.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden sm:table-cell">Rol</TableHead>
                      <TableHead className="hidden sm:table-cell">Hora Entrada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {presentStaff.map((employee) => (
                        <TableRow key={`emp-${employee.id}`}>
                            <TableCell>
                                <div className="font-medium">{employee.name} {employee.cognoms}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{employee.role}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                                {todaysPunches.find(p => p.employeeId === employee.id)?.timestamp.toLocaleTimeString()}
                            </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  No hay empleados en la oficina.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
         {totalPresent === 0 && (
            <div className="text-center text-muted-foreground pt-4">
                No hay nadie en la oficina en este momento.
            </div>
         )}
      </CardContent>
    </Card>
  );
}
