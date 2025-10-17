'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockIncidents, mockTerminals } from '@/lib/mock-data';
import { Clock, Fingerprint } from 'lucide-react';

export default function PunchClock() {
  const { toast } = useToast();

  const handlePunch = () => {
    toast({
      title: 'Fichaje Registrado',
      description: `Tu fichaje a las ${new Date().toLocaleTimeString()} ha sido registrado con éxito.`,
    });
  };

  return (
    <Card className="sm:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="font-headline flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Fichaje en Tiempo Real
        </CardTitle>
        <CardDescription className="max-w-lg text-balance leading-relaxed">
          Selecciona un terminal y una incidencia opcional para registrar tu entrada o salida.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Terminal" />
              </SelectTrigger>
              <SelectContent>
                {mockTerminals.map((terminal) => (
                  <SelectItem key={terminal.id} value={terminal.id}>
                    {terminal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Incidencia (Opcional)" />
              </SelectTrigger>
              <SelectContent>
                {mockIncidents.map((incident) => (
                  <SelectItem key={incident.id} value={incident.id}>
                    {incident.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handlePunch}>
          <Fingerprint className="mr-2 h-4 w-4" />
          Fichar
        </Button>
      </CardFooter>
    </Card>
  );
}
