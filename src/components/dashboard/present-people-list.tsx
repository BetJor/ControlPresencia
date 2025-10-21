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
import { collection, query, where, doc, getDocs } from 'firebase/firestore';
import { Contact, Users, User, Loader2, LogOut } from 'lucide-react';
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
  const { data: presentStaffRaw, isLoading: staffLoading } =
    useCollection<UsuariDins>(usuarisDinsCollection);
  const { data: visitors, isLoading: visitorsLoading } =
    useCollection<VisitRegistration>(visitorsCollection);

  const presentStaffIds = useMemo(() => {
    return presentStaffRaw?.map(staff => staff.id) ?? [];
  }, [presentStaffRaw]);
  
  const staffDetailsQuery = useMemoFirebase(() => {
    if (!firestore || presentStaffIds.length === 0) return null;
    return query(collection(firestore, 'directori'), where('centreCost', 'in', presentStaffIds));
  }, [firestore, presentStaffIds]);

  const { data: detailedStaff, isLoading: staffDetailsLoading } = useCollection<Directori>(staffDetailsQuery);

  const enrichedStaff = useMemo(() => {
    if (!presentStaffRaw || !detailedStaff) return [];
    
    const staffMap = new Map(detailedStaff.map(s => [s.centreCost, s]));
    
    return presentStaffRaw.map(present => {
      const details = staffMap.get(present.id);
      return {
        ...present,
        nom: details?.nom ?? present.nom,
        cognom: details?.cognom ?? present.cognoms,
      };
    });
  }, [presentStaffRaw, detailedStaff]);


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


  const isLoading = staffLoading || visitorsLoading || staffDetailsLoading;
  const totalPresent = (enrichedStaff?.length || 0) + presentVisitors.length;

  const getFormattedTime = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                          <TableHead className="py-2 px-3">Nom</TableHead>
                          <TableHead className="hidden sm:table-cell py-2 px-3">
                            Empresa
                          </TableHead>
                          <TableHead className="hidden sm:table-cell py-2 px-3">
                            Hora Entrada
                          </TableHead>
                          <TableHead className="text-right py-2 px-3">Accions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {presentVisitors.map((visitor) => (
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
                                  <p>Marcar Sortida</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No hi ha visites a l'oficina.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="employees">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Empleats ({enrichedStaff?.length || 0})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {enrichedStaff && enrichedStaff.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="py-2 px-3">Cognoms</TableHead>
                          <TableHead className="py-2 px-3">Nom</TableHead>
                          <TableHead className="text-right py-2 px-3">Accions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrichedStaff.map((employee) => (
                          <TableRow key={`emp-${employee.id}`} className="text-sm">
                            <TableCell className="font-medium py-2 px-3">
                              {employee.cognom}
                            </TableCell>
                            <TableCell className="py-2 px-3">{employee.nom}</TableCell>
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
                                  <p>Marcar Sortida</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No hi ha empleats a l'oficina.
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TooltipProvider>
        )}
        {totalPresent === 0 && !isLoading && (
          <div className="pt-4 text-center text-muted-foreground text-sm">
            No hi ha ningú a l'oficina en aquest moment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
