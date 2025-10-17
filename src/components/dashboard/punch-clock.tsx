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
import { mockEmployees } from '@/lib/mock-data';
import { Contact, Edit, Fingerprint, UserPlus, Check, ChevronsUpDown, Star } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

export default function PunchClock() {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [visitorName, setVisitorName] = React.useState("");
  const [visitorCompany, setVisitorCompany] = React.useState("");
  const [isFavorite, setIsFavorite] = React.useState(false);
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

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
          const favoriteVisitorData = {
            name: visitorName,
            company: visitorCompany,
          };
          addDocumentNonBlocking(collection(firestore, 'favorite_visitors'), favoriteVisitorData);
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
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between"
                                            disabled={isUserLoading}
                                        >
                                            {value
                                            ? mockEmployees.find((employee) => `${employee.name.toLowerCase()} ${employee.cognoms.toLowerCase()}` === value)?.name + ' ' + mockEmployees.find((employee) => `${employee.name.toLowerCase()} ${employee.cognoms.toLowerCase()}` === value)?.cognoms
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
                                                    setValue(currentValue === value ? "" : currentValue)
                                                    setOpen(false)
                                                }}
                                                >
                                                <Check
                                                    className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === `${employee.name.toLowerCase()} ${employee.cognoms.toLowerCase()}` ? "opacity-100" : "opacity-0"
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
                                    <Button onClick={handleManualPunch} className='w-full' disabled={isUserLoading}>
                                        Registrar Entrada
                                    </Button>
                                </div>
                            </div>
                            </div>

                            {/* Visitor Entry */}
                            <div>
                                <h3 className="mb-2 font-medium flex items-center gap-2"><Contact className='h-5 w-5' /> Entrada de Visita</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor='visitor-name'>Nombre Visita</Label>
                                        <Input id='visitor-name' placeholder="Nombre completo" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} disabled={isUserLoading}/>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor='visitor-company'>Empresa</Label>
                                        <div className="flex items-center gap-2">
                                            <Input id='visitor-company' placeholder="Nombre de la empresa" className="w-full" value={visitorCompany} onChange={(e) => setVisitorCompany(e.target.value)} disabled={isUserLoading}/>
                                            <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)} disabled={isUserLoading}>
                                                <Star className={cn("h-4 w-4", isFavorite ? "fill-primary text-primary" : "")} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <Button onClick={handleVisitorEntry} className='w-full' disabled={isUserLoading}>
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
