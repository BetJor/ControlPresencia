'use client';
import * as React from "react"
import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { useToast } from '@/hooks/use-toast';
import { Contact, Edit, Fingerprint, UserPlus, Check, ChevronsUpDown, Star } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp, doc, query, where, orderBy } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import type { Directori } from "@/lib/types";

type FavoriteVisitor = {
    id: string;
    name: string;
    company: string;
};

export default function PunchClock() {
  const { toast } = useToast();
  const [employeeOpen, setEmployeeOpen] = React.useState(false);
  const [employeeValue, setEmployeeValue] = React.useState("");
  
  const [favoritesOpen, setFavoritesOpen] = React.useState(false);
  const [visitorName, setVisitorName] = React.useState("");
  const [visitorCompany, setVisitorCompany] = React.useState("");
  const [isFavorite, setIsFavorite] = React.useState(false);

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const favoriteVisitorsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'favorite_visitors');
  }, [firestore]);

  const directoryCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    // IMPORTANT: Add a where clause to satisfy security rules that prevent full collection scans.
    // We query for users that are not suspended, which covers all active employees.
    return query(collection(firestore, 'directori'), where('suspès', '==', false), orderBy('cognom'), orderBy('nom'));
  }, [firestore]);


  const { data: employees, isLoading: employeesLoading } = useCollection<Directori>(directoryCollection);

  const { data: favoriteVisitors, isLoading: favoritesLoading } = useCollection<FavoriteVisitor>(favoriteVisitorsCollection);

  React.useEffect(() => {
    if (favoriteVisitors && visitorName && visitorCompany) {
      const isAlreadyFavorite = favoriteVisitors.some(
        (fav) => fav.name.toLowerCase() === visitorName.toLowerCase() && fav.company.toLowerCase() === visitorCompany.toLowerCase()
      );
      setIsFavorite(isAlreadyFavorite);
    } else {
        setIsFavorite(false);
    }
  }, [visitorName, visitorCompany, favoriteVisitors]);


  const handleManualPunch = () => {
    if (!employeeValue || !firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Has de seleccionar un empleat.",
        });
        return;
    }

    const selectedEmployee = employees?.find((employee) => employee.centreCost === employeeValue);

    if (selectedEmployee) {
        const employeeDocRef = doc(firestore, 'usuaris_dins', selectedEmployee.centreCost);
        const employeeData = {
            id: selectedEmployee.centreCost, // Store the ID used for the document
            nom: selectedEmployee.nom,
            cognoms: selectedEmployee.cognom,
            horaDarreraEntrada: serverTimestamp(),
            nombreMoviments: 1, // Se asume que es el primer movimiento del día al ser manual
            darrerTerminal: 'MANUAL',
        };

        setDocumentNonBlocking(employeeDocRef, employeeData, { merge: false });
        
        toast({
            title: 'Entrada Manual Registrada',
            description: `S'ha registrat l'entrada per a ${selectedEmployee.nom} ${selectedEmployee.cognom}.`,
        });
        setEmployeeValue(""); // Reset dropdown
    } else {
         toast({
            variant: "destructive",
            title: "Error",
            description: "No s'ha trobat l'empleat seleccionat.",
        });
    }
  };

  const handleVisitorEntry = () => {
    if (!visitorName || !visitorCompany) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre y la empresa de la visita son obligatorios.",
      });
      return;
    }

    if (firestore) {
        const visitData = {
          name: visitorName,
          company: visitorCompany,
          timestamp: serverTimestamp(),
        };
        const visitsCollection = collection(firestore, 'visit_registrations');
        addDocumentNonBlocking(visitsCollection, visitData);

        if (isFavorite) {
          const isAlreadyFavorite = favoriteVisitors?.some(
            (fav) => fav.name.toLowerCase() === visitorName.toLowerCase() && fav.company.toLowerCase() === visitorCompany.toLowerCase()
          );

          if (!isAlreadyFavorite) {
              const favoriteVisitorData = {
                name: visitorName,
                company: visitorCompany,
              };
              const favsCollection = collection(firestore, 'favorite_visitors');
              addDocumentNonBlocking(favsCollection, favoriteVisitorData);
          }
        }

        toast({
          title: 'Visita Registrada',
          description: 'La entrada de la visita ha sido registrada con éxito.',
        });

        setVisitorName("");
        setVisitorCompany("");
        setIsFavorite(false);
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "La base de datos no está disponible. Inténtalo de nuevo más tarde.",
        });
    }
  }

  const isLoading = isUserLoading || favoritesLoading || employeesLoading;

  return (
    <Card>
        <CardHeader>
            <Accordion type="single" collapsible defaultValue='item-1' className='-m-6'>
                <AccordionItem value="item-1" className='border-0'>
                    <AccordionTrigger className='p-6 hover:no-underline'>
                        <div className="text-left">
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Edit className="h-6 w-6" />
                                Recepción
                            </CardTitle>
                            <CardDescription className="max-w-lg text-balance leading-relaxed mt-1.5">
                                Registra una entrada manual para un empleado o una nueva visita.
                            </CardDescription>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className='p-6 pt-0'>
                        <div className="grid gap-6">
                            {/* Manual Punch for Employee */}
                            <div>
                            <h3 className="mb-2 font-medium flex items-center gap-2"><Fingerprint className='h-5 w-5' /> Fichaje Manual Empleado</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="employee-search">Empleado</Label>
                                    <Popover open={employeeOpen} onOpenChange={setEmployeeOpen}>
                                        <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={employeeOpen}
                                            className="w-full justify-between"
                                            disabled={isLoading}
                                        >
                                            {employeeValue && employees
                                            ? employees?.find((employee) => employee.centreCost === employeeValue)?.nom + ' ' + employees?.find((employee) => employee.centreCost === employeeValue)?.cognom
                                            : "Seleccionar empleado..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar empleado..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontró el empleado.</CommandEmpty>
                                                <CommandGroup>
                                                {employees?.map((employee: Directori) => (
                                                    <CommandItem
                                                    key={employee.id}
                                                    value={employee.centreCost}
                                                    onSelect={(currentValue) => {
                                                        setEmployeeValue(currentValue === employeeValue ? "" : currentValue)
                                                        setEmployeeOpen(false)
                                                    }}
                                                    >
                                                    <Check
                                                        className={cn(
                                                        "mr-2 h-4 w-4",
                                                        employeeValue === employee.centreCost ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {employee.cognom}, {employee.nom}
                                                    </CommandItem>
                                                ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className='grid gap-2'>
                                    <Label>&nbsp;</Label>
                                    <Button onClick={handleManualPunch} className='w-full' disabled={isLoading || !employeeValue}>
                                        Registrar Entrada
                                    </Button>
                                </div>
                            </div>
                            </div>

                            {/* Visitor Entry */}
                            <div>
                                <h3 className="mb-2 font-medium flex items-center gap-2"><Contact className='h-5 w-5' /> Entrada de Visita</h3>
                                {isLoading ? (
                                     <div className="flex items-center justify-center p-4">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        <p className="ml-2">Cargando...</p>
                                     </div>
                                ) : (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="favorite-visitor-search">Buscar Favorito (Opcional)</Label>
                                        <Popover open={favoritesOpen} onOpenChange={setFavoritesOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={favoritesOpen}
                                                    className="w-full justify-between"
                                                >
                                                    Seleccionar visitante favorito...
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar visitante..." />
                                                    <CommandList>
                                                        <CommandEmpty>No se encontró ningún visitante favorito.</CommandEmpty>
                                                        <CommandGroup>
                                                            {favoriteVisitors?.map((visitor) => (
                                                                <CommandItem
                                                                    key={visitor.id}
                                                                    value={`${visitor.name} ${visitor.company}`}
                                                                    onSelect={() => {
                                                                        setVisitorName(visitor.name);
                                                                        setVisitorCompany(visitor.company);
                                                                        setFavoritesOpen(false);
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", visitorName === visitor.name ? "opacity-100" : "opacity-0")} />
                                                                    {visitor.name} ({visitor.company})
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="visitor-name">Nombre</Label>
                                            <Input 
                                                id="visitor-name"
                                                placeholder="Nombre del visitante"
                                                value={visitorName}
                                                onChange={(e) => setVisitorName(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="visitor-company">Empresa</Label>
                                            <div className="flex items-center gap-2">
                                                <Input 
                                                    id="visitor-company"
                                                    placeholder="Nombre de la empresa"
                                                    value={visitorCompany}
                                                    onChange={(e) => setVisitorCompany(e.target.value)}
                                                    className="w-full"
                                                />
                                                <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)} disabled={isLoading || !visitorName || !visitorCompany}>
                                                    <Star className={cn("h-5 w-5", isFavorite ? "fill-primary text-primary" : "text-muted-foreground")} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4">
                                        <Button onClick={handleVisitorEntry} className='w-full' disabled={isLoading || !visitorName || !visitorCompany}>
                                            <UserPlus className='mr-2'/>
                                            Registrar Visita
                                        </Button>
                                    </div>
                                </>
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
      </CardHeader>
    </Card>
  );
}
