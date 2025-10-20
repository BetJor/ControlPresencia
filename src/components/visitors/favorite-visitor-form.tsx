'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import { useFirestore, updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type FavoriteVisitor = {
    id: string;
    name: string;
    company: string;
};

interface FavoriteVisitorFormProps {
  visitor?: FavoriteVisitor;
  children?: React.ReactNode;
}

export function FavoriteVisitorForm({ visitor, children }: FavoriteVisitorFormProps) {
  const isEditMode = !!visitor;
  const [name, setName] = useState(visitor?.name || '');
  const [company, setCompany] = useState(visitor?.company || '');
  const [isOpen, setIsOpen] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSave = () => {
    if (!firestore || !name || !company) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "El nombre y la empresa no pueden estar vacíos.",
        });
        return;
    }
    
    if (isEditMode) {
        const visitorDocRef = doc(firestore, 'favorite_visitors', visitor.id);
        updateDocumentNonBlocking(visitorDocRef, { name, company });
        toast({
            title: "Guardado",
            description: "Los datos del visitante favorito se han actualizado.",
        });
    } else {
        const favsCollection = collection(firestore, 'favorite_visitors');
        addDocumentNonBlocking(favsCollection, { name, company });
        toast({
            title: "Creado",
            description: "El nuevo visitante favorito ha sido añadido.",
        });
    }


    setIsOpen(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (open && !isEditMode) {
        setName('');
        setCompany('');
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ? children : (
            <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Editar</span>
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar Visita Favorita' : 'Añadir Visita Favorita'}</DialogTitle>
          <DialogDescription>
            {isEditMode 
                ? 'Realiza cambios en los datos del visitante. Haz clic en guardar cuando hayas terminado.'
                : 'Añade un nuevo visitante a tu lista de favoritos.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Juan Pérez"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Empresa
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Acme Corp"
            />
          </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">
                    Cancelar
                </Button>
            </DialogClose>
            <Button type="button" onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
