'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
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
import { Contact, Edit, Fingerprint, UserPlus } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function PunchClock() {
  const { toast } = useToast();

  const handleManualPunch = () => {
    toast({
      title: 'Fichaje Manual Registrado',
      description: 'El fichaje manual ha sido registrado con éxito.',
    });
  };

  const handleVisitorEntry = () => {
     toast({
      title: 'Visita Registrada',
      description: 'La entrada de la visita ha sido registrada con éxito.',
    });
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
                                    <Input id="employee-search" placeholder="Buscar empleado..." />
                                </div>
                                <div className='grid gap-2'>
                                    <Label>&nbsp;</Label>
                                    <Button onClick={handleManualPunch} className='w-full'>
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
                                    <Input id='visitor-name' placeholder="Nombre completo" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor='visitor-company'>Empresa</Label>
                                    <Input id='visitor-company' placeholder="Nombre de la empresa" />
                                </div>
                            </div>
                            <Button onClick={handleVisitorEntry} className='mt-4 w-full'>
                                    <UserPlus className='mr-2'/>
                                    Registrar Visita
                                </Button>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
      </CardHeader>
    </Card>
  );
}
