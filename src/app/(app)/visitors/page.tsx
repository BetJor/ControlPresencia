'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Loader2, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EditFavoriteVisitorForm } from "@/components/visitors/edit-visitor-form";

type FavoriteVisitor = {
    id: string;
    name: string;
    company: string;
};

export default function VisitorsPage() {
    const firestore = useFirestore();
    const favoriteVisitorsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'favorite_visitors');
    }, [firestore]);

    const { data: favoriteVisitors, isLoading } = useCollection<FavoriteVisitor>(favoriteVisitorsCollection);
    
    const handleDelete = (visitorId: string) => {
        if (firestore) {
            const visitorDocRef = doc(firestore, 'favorite_visitors', visitorId);
            deleteDocumentNonBlocking(visitorDocRef);
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Star className="h-6 w-6 text-primary" />
                    Visitas Favoritas
                </CardTitle>
                <CardDescription>Una lista de tus visitas recurrentes o importantes.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="ml-2">Cargando visitas favoritas...</p>
                    </div>
                ) : favoriteVisitors && favoriteVisitors.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {favoriteVisitors.map((visitor) => (
                                <TableRow key={visitor.id}>
                                    <TableCell className="font-medium">{visitor.name}</TableCell>
                                    <TableCell>{visitor.company}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <EditFavoriteVisitorForm visitor={visitor} />
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                        <span className="sr-only">Eliminar</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción no se puede deshacer. Se eliminará permanentemente la visita favorita.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(visitor.id)} className="bg-destructive hover:bg-destructive/90">
                                                        Eliminar
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>Aún no tienes ninguna visita guardada como favorita.</p>
                        <p className="text-sm">Puedes añadirlas desde la sección de Recepción en el Panel al registrar una nueva visita.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
