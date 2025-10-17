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
import type { VisitRegistration, UsuariDins } from '@/lib/types';
import { collection, query, where, doc } from 'firebase/firestore';
import { Contact, Users, User, Loader2, LogOut } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export default function PresentPeopleList() {
  const firestore = useFirestore();
  const [presentVisitors, setPresentVisitors] = useState<VisitRegistration[]>(
    []
  );

  // Col·leccions de Firestore
  const usuarisDinsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'usuaris_dins') : null),
    [firestore]
  );
  const visitorsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return query(
      collection(firestore, 'visit_registrations'),
      where('timestamp', '>=', today)
    );
  }, [firestore]);

  // Obtenció de dades
  const { data: presentStaff, isLoading: staffLoading } =
    useCollection<UsuariDins>(usuarisDinsCollection);
  const { data: visitors, isLoading: visitorsLoading } =
    useCollection<VisitRegistration>(visitorsCollection);

  // Actualitza les visites presents quan canvien les dades
  useEffect(() => {
    if (visitors) {
      setPresentVisitors(visitors);
    }
  }, [visitors]);

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


  const isLoading = staffLoading || visitorsLoading;
  const totalPresent = (presentStaff?.length || 0) + presentVisitors.length;

  const getFormattedTime = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleTimeString();
    }
    return 'N/A';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Users className="h-6 w-6" />
          Persones a l'Oficina ({isLoading ? '...' : totalPresent})
        </CardTitle>
        <CardDescription>
          Una llista de les persones que són actualment a les instal·lacions.
          Actualitzat en temps real.
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
                    <span>Visites ({presentVisitors.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {presentVisitors.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Empresa
                          </TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Hora Entrada
                          </TableHead>
                          <TableHead className="text-right">Accions</TableHead>
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
                              {getFormattedTime(visitor.timestamp)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleVisitorCheckout(visitor.id)
                                    }
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Marcar Sortida</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No hi ha visites a l'oficina.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="employees">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Empleats ({presentStaff?.length || 0})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {presentStaff && presentStaff.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cognoms</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Hora Darrera Entrada
                          </TableHead>
                          <TableHead className="text-right">Accions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {presentStaff.map((employee) => (
                          <TableRow key={`emp-${employee.id}`}>
                            <TableCell className="font-medium">
                              {employee.cognoms}
                            </TableCell>
                            <TableCell>{employee.nom}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {getFormattedTime(employee.horaDarreraEntrada)}
                            </TableCell>
                             <TableCell className="text-right">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleEmployeeCheckout(employee.id)
                                    }
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Marcar Sortida</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No hi ha empleats a l'oficina.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TooltipProvider>
        )}
        {totalPresent === 0 && !isLoading && (
          <div className="pt-4 text-center text-muted-foreground">
            No hi ha ningú a l'oficina en aquest moment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
