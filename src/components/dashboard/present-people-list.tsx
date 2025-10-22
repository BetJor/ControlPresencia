'use client';

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
  deleteDocumentNonBlocking,
} from '@/firebase';
import type { VisitRegistration, UsuariDins, Directori } from '@/lib/types';
import { collection, query, where, doc } from 'firebase/firestore';
import { Contact, Users, User, Loader2, LogOut, Repeat, Terminal } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '../ui/button';
import { useEffect, useState, useMemo } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export default function PresentPeopleList() {
  const firestore = useFirestore();

  // 1. Get the list of present staff IDs
  const usuarisDinsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'usuaris_dins') : null),
    [firestore]
  );
  const { data: presentStaffRaw, isLoading: staffLoading } = useCollection<UsuariDins>(usuarisDinsCollection);

  // 2. Get the list of present visitors
  const visitorsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return query(
      collection(firestore, 'visit_registrations'),
      where('timestamp', '>=', today)
    );
  }, [firestore]);
  const { data: visitors, isLoading: visitorsLoading } = useCollection<VisitRegistration>(visitorsCollection);

  const presentStaffIds = useMemo(() => {
    return presentStaffRaw?.map(staff => String(staff.id).trim()).filter(id => id) ?? [];
  }, [presentStaffRaw]);
  
  // 3. Create a memoized query to get details for ONLY the present staff
  const staffDetailsQuery = useMemoFirebase(() => {
    if (!firestore || presentStaffIds.length === 0) return null;
    // Firestore 'in' queries are limited to 30 values. We need to chunk the array.
    // This is a simplified example; for more than 30 present people, you'd need multiple queries.
    return query(collection(firestore, 'directori'), where('centreCost', 'in', presentStaffIds.slice(0, 30)));
  }, [firestore, presentStaffIds]);

  // 4. Execute the query to get the detailed staff info
  const { data: detailedStaff, isLoading: staffDetailsLoading } = useCollection<Directori>(staffDetailsQuery);

  // 5. Enrich the raw staff data with details once both are loaded
  const enrichedStaff = useMemo(() => {
    if (!presentStaffRaw || !detailedStaff) return [];
    
    const staffMap = new Map(detailedStaff.map(s => [String(s.centreCost).trim(), s]));
    
    return presentStaffRaw.map(present => {
      const details = staffMap.get(String(present.id).trim());
      return {
        ...present,
        nom: details?.nom ?? present.nom,
        cognom: details?.cognom ?? present.cognoms ?? '',
        nombreMoviments: present.nombreMoviments || 0,
        darrerTerminal: present.darrerTerminal || 'N/A',
      };
    }).sort((a, b) => {
        const timeA = a.horaDarreraEntrada?.toDate().getTime() || 0;
        const timeB = b.horaDarreraEntrada?.toDate().getTime() || 0;
        return timeB - timeA; // Sort descending (most recent first)
    });
  }, [presentStaffRaw, detailedStaff]);


  const handleVisitorCheckout = (visitorId: string) => {
    if (firestore && visitorId) {
      const visitorDocRef = doc(firestore, 'visit_registrations', visitorId);
      deleteDocumentNonBlocking(visitorDocRef);
    }
  };
  
  const handleEmployeeCheckout = (employeeId: string) => {
    if (firestore && employeeId) {
        const employeeDocRef = doc(firestore, 'usuaris_dins', employeeId);
        deleteDocumentNonBlocking(employeeDocRef);
    }
  };

  const isLoading = staffLoading || visitorsLoading || staffDetailsLoading;
  const totalPresent = (enrichedStaff?.length || 0) + (visitors?.length || 0);

  const getFormattedTime = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'N/A';
  };

  const getFormattedDateTime = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        const date = timestamp.toDate();
        return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'N/A';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Users className="h-6 w-6" />
          Presentes en la oficina ({isLoading ? '...' : totalPresent})
        </CardTitle>
        <CardDescription>
          Una lista de las personas que se encuentran actualmente en las instalaciones.
          Actualizado en tiempo real.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="ml-2">Actualizando lista de presencia...</p>
          </div>
        ) : (
          <TooltipProvider>
            <Accordion type="multiple" defaultValue={['visitors', 'employees']}>
              <AccordionItem value="visitors">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <Contact className="h-5 w-5" />
                    <span>Visitantes ({(visitors?.length || 0)})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {visitors && visitors.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="py-2 px-3">Nombre</TableHead>
                          <TableHead className="hidden sm:table-cell py-2 px-3">
                            Empresa
                          </TableHead>
                          <TableHead className="hidden sm:table-cell py-2 px-3">
                            Hora Entrada
                          </TableHead>
                          <TableHead className="text-right py-2 px-3">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visitors.map((visitor) => (
                          <TableRow key={`vis-${visitor.id}`} className="text-sm">
                            <TableCell className="py-2 px-3">
                              <div className="font-medium">{visitor.name}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell py-2 px-3">
                              {visitor.company}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell py-2 px-3">
                              {getFormattedTime(visitor.timestamp)}
                            </TableCell>
                            <TableCell className="text-right py-2 px-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleVisitorCheckout(visitor.id)
                                    }
                                    className="h-8 w-8"
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Marcar Salida</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No hay visitantes en la oficina.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="employees">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Empleados ({enrichedStaff?.length || 0})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {enrichedStaff && enrichedStaff.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="py-2 px-3">Apellidos</TableHead>
                          <TableHead className="py-2 px-3">Nombre</TableHead>
                          <TableHead className="py-2 px-3">ID</TableHead>
                          <TableHead className="py-2 px-3 text-center">
                            <Tooltip>
                              <TooltipTrigger className='flex items-center gap-1'>
                                <Repeat className="h-4 w-4" />
                                <span>#</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Número de movimientos</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableHead>
                           <TableHead className="py-2 px-3 text-center">
                            <Tooltip>
                              <TooltipTrigger className='flex items-center gap-1'>
                                <Terminal className="h-4 w-4" />
                                <span>T.</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Terminal último movimiento</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableHead>
                          <TableHead className="py-2 px-3">Última Entrada</TableHead>
                          <TableHead className="text-right py-2 px-3">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrichedStaff.map((employee) => (
                          <TableRow key={`emp-${employee.id}`} className="text-sm">
                            <TableCell className="font-medium py-2 px-3">
                              {employee.cognom}
                            </TableCell>
                            <TableCell className="py-2 px-3">{employee.nom}</TableCell>
                            <TableCell className="py-2 px-3">{employee.id}</TableCell>
                            <TableCell className="py-2 px-3 text-center">{employee.nombreMoviments}</TableCell>
                            <TableCell className="py-2 px-3 text-center">{employee.darrerTerminal}</TableCell>
                            <TableCell className="py-2 px-3">{getFormattedDateTime(employee.horaDarreraEntrada)}</TableCell>
                             <TableCell className="text-right py-2 px-3">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleEmployeeCheckout(employee.id)
                                    }
                                    className="h-8 w-8"
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Marcar Salida</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No hay empleados en la oficina.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TooltipProvider>
        )}
        {totalPresent === 0 && !isLoading && (
          <div className="pt-4 text-center text-muted-foreground text-sm">
            No hay nadie en la oficina en este momento.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
