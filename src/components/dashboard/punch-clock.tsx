'use client';
import * as React from "react"
import { Button } from '@/components/ui/button';
import {
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { useToast } from '@/hooks/use-toast';
import { mockEmployees } from '@/lib/mock-data';
import { Contact, Edit, Fingerprint, UserPlus, Check, ChevronsUpDown, Star } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";

type FavoriteVisitor = {
    id: string;
    name: string;
    company: string;
};

export default function PunchClock() {
  const { toast } = useToast();
  const [employeeOpen, setEmployeeOpen] = React.useState(false);
  const [employeeValue, setEmployeeValue] = React.useState("");

  const [visitorOpen, setVisitorOpen] = React.useState(false);
  const [visitorName, setVisitorName] = React.useState("");
  const [visitorCompany, setVisitorCompany] = React.useState("");
  const [isFavorite, setIsFavorite] = React.useState(false);

  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const favoriteVisitorsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'favorite_visitors');
  }, [firestore]);

  const { data: favoriteVisitors, isLoading: favoritesLoading } = useCollection<FavoriteVisitor>(favoriteVisitorsCollection);

  const handleManualPunch = () => {
    toast({
      title: 'Fichaje Manual Registrado',
      description: 'El fichaje manual ha sido registrado con éxito.',
    });
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

    const visitData = {
      name: visitorName,
      company: visitorCompany,
      timestamp: serverTimestamp(),
    };

    if (firestore) {
        addDocumentNonBlocking(collection(firestore, 'visit_registrations'), visitData);

        if (isFavorite) {
          // Check if the visitor is already a favorite to avoid duplicates
          const isAlreadyFavorite = favoriteVisitors?.some(
            (fav) => fav.name.toLowerCase() === visitorName.toLowerCase() && fav.company.toLowerCase() === visitorCompany.toLowerCase()
          );

          if (!isAlreadyFavorite) {
              const favoriteVisitorData = {
                name: visitorName,
                company: visitorCompany,
              };
              addDocumentNonBlocking(collection(firestore, 'favorite_visitors'), favoriteVisitorData);
          }
        }

        toast({
          title: 'Visita Registrada',
          description: 'La entrada de la visita ha sido registrada con éxito.',
        });

        // Reset fields
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
                                            {employeeValue
                                            ? mockEmployees.find((employee) => `${employee.name.toLowerCase()} ${employee.cognoms.toLowerCase()}` === employeeValue)?.name + ' ' + mockEmployees.find((employee) => `${employee.name.toLowerCase()} ${employee.cognoms.toLowerCase()}` === employeeValue)?.cognoms
                                            : "Seleccionar empleado..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar empleado..." />
                                            <CommandEmpty>No se encontró el empleado.</CommandEmpty>
                                            <CommandGroup>
                                            {mockEmployees.map((employee) => (
                                                <CommandItem
                                                key={employee.id}
                                                value={`${employee.name.toLowerCase()} ${employee.cognoms.toLowerCase()}`}
                                                onSelect={(currentValue) => {
                                                    setEmployeeValue(currentValue === employeeValue ? "" : currentValue)
                                                    setEmployeeOpen(false)
                                                }}
                                                >
                                                <Check
                                                    className={cn(
                                                    "mr-2 h-4 w-4",
                                                    employeeValue === `${employee.name.toLowerCase()} ${employee.cognoms.toLowerCase()}` ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {employee.name} {employee.cognoms}
                                                </CommandItem>
                                            ))}
                                            </CommandGroup>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className='grid gap-2'>
                                    <Label>&nbsp;</Label>
                                    <Button onClick={handleManualPunch} className='w-full' disabled={isLoading}>
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
                                        <p className="ml-2">Cargando favoritos...</p>
                                     </div>
                                ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2 col-span-2">
                                        <Label htmlFor='visitor-name'>Visitante</Label>
                                        <Popover open={visitorOpen} onOpenChange={setVisitorOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={visitorOpen}
                                                    className="w-full justify-between"
                                                    disabled={isLoading}
                                                >
                                                    {visitorName ? `${visitorName} (${visitorCompany})` : "Seleccionar o añadir visitante..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command filter={(value, search) => {
                                                    const favorite = favoriteVisitors?.find(fav => fav.id === value);
                                                    if (favorite) {
                                                        const combinedText = `${favorite.name} ${favorite.company}`.toLowerCase();
                                                        return combinedText.includes(search.toLowerCase()) ? 1 : 0;
                                                    }
                                                    return 0;
                                                }}>
                                                    <CommandInput 
                                                        placeholder="Buscar visitante o añadir nuevo..." 
                                                        value={visitorName}
                                                        onValueChange={setVisitorName}
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                          <div className="p-4">
                                                            <p className="text-sm text-center mb-2">No se encontró el visitante.</p>
                                                            <Input 
                                                                placeholder="Empresa"
                                                                value={visitorCompany}
                                                                onChange={(e) => setVisitorCompany(e.target.value)}
                                                                className="w-full"
                                                            />
                                                          </div>
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                        {favoriteVisitors?.map((visitor) => (
                                                            <CommandItem
                                                                key={visitor.id}
                                                                value={visitor.id}
                                                                onSelect={() => {
                                                                    setVisitorName(visitor.name);
                                                                    setVisitorCompany(visitor.company);
                                                                    setVisitorOpen(false);
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
                                </div>
                                )}

                                <div className="flex items-center gap-4 mt-4">
                                     <div className="flex items-center space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => setIsFavorite(!isFavorite)} disabled={isLoading || !visitorName}>
                                            <Star className={cn("h-4 w-4", isFavorite ? "fill-primary text-primary" : "text-muted-foreground")} />
                                            <span className="ml-2">Guardar como favorito</span>
                                        </Button>
                                    </div>
                                    <Button onClick={handleVisitorEntry} className='w-full' disabled={isLoading || !visitorName || !visitorCompany}>
                                        <UserPlus className='mr-2'/>
                                        Registrar Visita
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
      </CardHeader>
    </Card>
  );
}
