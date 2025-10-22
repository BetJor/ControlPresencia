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
import { Contact, Edit, Fingerprint, UserPlus, Check, ChevronsUpDown, Star, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { useFirestore, useUser, addDocumentNonBlocking, setDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import type { Directori } from "@/lib/types";
import { useDebounce } from "@/hooks/use-debounce";

type FavoriteVisitor = {
    id: string;
    name: string;
    company: string;
};

export default function PunchClock() {
  const { toast } = useToast();
  const [employeeOpen, setEmployeeOpen] = React.useState(false);
  const [employeeValue, setEmployeeValue] = React.useState("");
  const [employeeSearch, setEmployeeSearch] = React.useState('');
  
  const [favoritesOpen, setFavoritesOpen] = React.useState(false);
  const [visitorName, setVisitorName] = React.useState("");
  const [visitorCompany, setVisitorCompany] = React.useState("");
  const [isFavorite, setIsFavorite] = React.useState(false);

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const [searchedEmployees, setSearchedEmployees] = React.useState<Directori[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const debouncedSearchTerm = useDebounce(employeeSearch, 300);
  
  const favoriteVisitorsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'favorite_visitors');
  }, [firestore]);

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

  React.useEffect(() => {
    const searchEmployees = async () => {
        if (debouncedSearchTerm.length < 3 || !firestore) {
            setSearchedEmployees([]);
            return;
        }

        setIsSearching(true);
        try {
            const searchTermLower = debouncedSearchTerm.toLowerCase();
            const nomQuery = query(
              collection(firestore, 'directori'),
              where('nom', '>=', searchTermLower),
              where('nom', '<=', searchTermLower + '\uf8ff'),
              limit(10)
            );
            const cognomQuery = query(
              collection(firestore, 'directori'),
              where('cognom', '>=', searchTermLower),
              where('cognom', '<=', searchTermLower + '\uf8ff'),
              limit(10)
            );

            const [nomSnapshot, cognomSnapshot] = await Promise.all([
                getDocs(nomQuery),
                getDocs(cognomQuery)
            ]);

            const employeesMap = new Map<string, Directori>();
            nomSnapshot.docs.forEach(doc => employeesMap.set(doc.id, { ...doc.data(), id: doc.id } as Directori));
            cognomSnapshot.docs.forEach(doc => employeesMap.set(doc.id, { ...doc.data(), id: doc.id } as Directori));
            
            setSearchedEmployees(Array.from(employeesMap.values()));

        } catch (error) {
            console.error("Error searching employees:", error);
            toast({
                variant: "destructive",
                title: "Error de búsqueda",
                description: "No se pudieron buscar empleados.",
            });
        } finally {
            setIsSearching(false);
        }
    };

    searchEmployees();
  }, [debouncedSearchTerm, firestore, toast]);


  const handleManualPunch = () => {
    if (!employeeValue || !firestore) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Has de seleccionar un empleat.",
        });
        return;
    }

    const selectedEmployee = searchedEmployees.find((employee) => employee.centreCost === employeeValue);

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
        setEmployeeSearch(""); // Reset search
        setSearchedEmployees([]); // Clear results
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

  const isLoading = isUserLoading || favoritesLoading;
  const selectedEmployeeDisplay = searchedEmployees.find(emp => emp.centreCost === employeeValue);


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
                                            {selectedEmployeeDisplay 
                                                ? `${selectedEmployeeDisplay.cognom}, ${selectedEmployeeDisplay.nom}`
                                                : "Buscar y seleccionar empleado..."
                                            }
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <div className="flex items-center border-b px-3">
                                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                <input
                                                    placeholder="Buscar por nombre o apellido..."
                                                    value={employeeSearch}
                                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                            <CommandList>
                                                {isSearching && <CommandEmpty>Buscando...</CommandEmpty>}
                                                {!isSearching && debouncedSearchTerm.length < 3 && <CommandEmpty>Escribe 3 o más letras para buscar.</CommandEmpty>}
                                                {!isSearching && searchedEmployees.length === 0 && debouncedSearchTerm.length >= 3 && <CommandEmpty>No se encontraron empleados.</CommandEmpty>}
                                                
                                                <CommandGroup>
                                                {searchedEmployees.map((employee: Directori) => (
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

