'use client';

import { determineStaffPresent } from '@/ai/flows/determine-staff-present';
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
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  addDocumentNonBlocking,
} from '@/firebase';
import type { Employee, Punch, VisitRegistration } from '@/lib/types';
import {
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
  query,
} from 'firebase/firestore';
import {
  Contact,
  Users,
  User,
  Loader2,
  LogOut,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';

export default function PresentPeopleList() {
  const firestore = useFirestore();
  const [presentStaff, setPresentStaff] = useState<Employee[]>([]);
  const [presentVisitors, setPresentVisitors] = useState<VisitRegistration[]>([]);
  const [isAiProcessing, setIsAiProcessing] = useState(true);

  // Firestore collections
  const employeesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'employees') : null),
    [firestore]
  );
  const punchesCollection = useMemoFirebase(
    () => {
        if (!firestore) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return query(collection(firestore, 'attendance_records'), where('timestamp', '>=', today));
    },
    [firestore]
  );
  const visitorsCollection = useMemoFirebase(
    () => {
        if (!firestore) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return query(collection(firestore, 'visit_registrations'), where('timestamp', '>=', today));
    },
    [firestore]
  );

  // Data fetching
  const { data: employees, isLoading: employeesLoading } =
    useCollection<Employee>(employeesCollection);
  const { data: punches, isLoading: punchesLoading } =
    useCollection<Punch>(punchesCollection);
  const { data: visitors, isLoading: visitorsLoading } =
    useCollection<VisitRegistration>(visitorsCollection);

  // Determine present staff when data changes
  useEffect(() => {
    if (!employees || !punches) return;

    setIsAiProcessing(true);
    const employeeIds = employees.map((e) => e.id);
    const dailyPunchCounts = employeeIds.reduce((acc, employeeId) => {
      acc[employeeId] = punches.filter(
        (p) => p.employeeId === employeeId
      ).length;
      return acc;
    }, {} as Record<string, number>);

    determineStaffPresent({
      employeeIds,
      dailyPunchCounts,
    }).then(({ presentEmployeeIds }) => {
      const present = employees.filter((employee) =>
        presentEmployeeIds.includes(employee.id)
      );
      setPresentStaff(present);
      setIsAiProcessing(false);
    });
  }, [employees, punches]);

  // Update present visitors when data changes
  useEffect(() => {
    if (visitors) {
        setPresentVisitors(visitors);
    }
  }, [visitors]);

  const handleEmployeeCheckout = (employeeId: string) => {
    if (firestore) {
      const punchData = {
        employeeId,
        terminalId: 'T-MANUAL-OUT', // Indicates a manual checkout from the dashboard
        timestamp: serverTimestamp(),
        isManual: true,
      };
      const attendanceCollection = collection(firestore, 'attendance_records');
      addDocumentNonBlocking(attendanceCollection, punchData);
    }
  };

  const handleVisitorCheckout = (visitorId: string) => {
    if (firestore) {
      const visitorDocRef = doc(firestore, 'visit_registrations', visitorId);
      deleteDoc(visitorDocRef);
    }
  };
  
  const isLoading = employeesLoading || punchesLoading || visitorsLoading || isAiProcessing;
  const totalPresent = presentStaff.length + (presentVisitors?.length || 0);

  const getEmployeeLastPunchTime = (employeeId: string) => {
    const employeePunches = punches
        ?.filter(p => p.employeeId === employeeId)
        .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
    
    if (employeePunches && employeePunches.length > 0) {
        return employeePunches[0].timestamp.toDate().toLocaleTimeString();
    }
    return 'N/A';
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Users className="h-6 w-6" />
          Personas en la Oficina ({isLoading ? '...' : totalPresent})
        </CardTitle>
        <CardDescription>
          Una lista de los empleados y visitas que se encuentran actualmente en
          las instalaciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-2">Actualizando lista de presencia...</p>
            </div>
        ) : (
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
                      <TableHead className="hidden sm:table-cell">
                        Empresa
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Hora Entrada
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {presentVisitors.map((visitor) => (
                      <TableRow key={`vis-${visitor.id}`}>
                        <TableCell>
                          <div className="font-medium">{visitor.name}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {visitor.company}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {visitor.timestamp.toDate().toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVisitorCheckout(visitor.id)}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Marcar Salida
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
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
                      <TableHead className="hidden sm:table-cell">
                        Rol
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Hora Entrada
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {presentStaff.map((employee) => (
                      <TableRow key={`emp-${employee.id}`}>
                        <TableCell>
                          <div className="font-medium">
                            {employee.name} {employee.cognoms}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {employee.role}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {getEmployeeLastPunchTime(employee.id)}
                        </TableCell>
                        <TableCell className="text-right">
                           <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEmployeeCheckout(employee.id)}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Marcar Salida
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No hay empleados en la oficina.
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        )}
         {totalPresent === 0 && !isLoading && (
            <div className="pt-4 text-center text-muted-foreground">
                No hay nadie en la oficina en este momento.
            </div>
         )}
      </CardContent>
    </Card>
  );
}
