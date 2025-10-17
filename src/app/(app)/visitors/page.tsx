'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Loader2, Star } from "lucide-react";

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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {favoriteVisitors.map((visitor) => (
                                <TableRow key={visitor.id}>
                                    <TableCell className="font-medium">{visitor.name}</TableCell>
                                    <TableCell>{visitor.company}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No tienes ninguna visita guardada como favorita todavía.</p>
                        <p className="text-sm">Puedes añadirlas desde la sección de Recepción en el Panel.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
