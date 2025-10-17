'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Loader2, BookUser, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Directori } from "@/lib/types";


export default function DirectoryPage() {
    const firestore = useFirestore();
    const directoriCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'directori');
    }, [firestore]);

    const { data: employees, isLoading } = useCollection<Directori>(directoriCollection);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <BookUser className="h-6 w-6" />
                    Directori d'Empleats
                </CardTitle>
                <CardDescription>Busca i contacta amb els empleats de l'organització.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="ml-2">Carregant directori...</p>
                    </div>
                ) : employees && employees.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Nom</TableHead>
                                <TableHead>Càrrec</TableHead>
                                <TableHead className="hidden md:table-cell">Departament</TableHead>
                                <TableHead className="text-right">Contacte</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={employee.fotoUrl} alt={`${employee.nom} ${employee.cognom}`} />
                                                <AvatarFallback>{employee.nom.charAt(0)}{employee.cognom.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{employee.nom} {employee.cognom}</p>
                                                <p className="text-sm text-muted-foreground">{employee.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{employee.carrec}</p>
                                            <p className="text-sm text-muted-foreground">{employee.descripcioCarrec}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant="secondary">{employee.departament}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            {employee.telefons?.[0] && (
                                                <a href={`tel:${employee.telefons[0]}`} className="text-muted-foreground hover:text-primary">
                                                    <Phone className="h-4 w-4" />
                                                </a>
                                            )}
                                            <a href={`mailto:${employee.email}`} className="text-muted-foreground hover:text-primary">
                                                <Mail className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>El directori està buit.</p>
                        <p className="text-sm">Afegeix empleats a la col·lecció 'directori' a Firestore per veure'ls aquí.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
