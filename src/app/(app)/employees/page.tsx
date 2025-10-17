'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Loader2, BookUser, Mail, Phone, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Directori } from "@/lib/types";


export default function DirectoryPage() {
    const firestore = useFirestore();
    const [nameFilter, setNameFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');

    const directoriCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'directori');
    }, [firestore]);

    const { data: employees, isLoading } = useCollection<Directori>(directoriCollection);

    const departments = useMemo(() => {
        if (!employees) return [];
        const allDepartments = employees.map(employee => employee.departament).filter(Boolean);
        return [...new Set(allDepartments)].sort();
    }, [employees]);

    const filteredEmployees = useMemo(() => {
        if (!employees) return [];
        return employees.filter(employee => {
            const fullName = `${employee.nom} ${employee.cognom}`.toLowerCase();
            const nameMatch = nameFilter ? fullName.includes(nameFilter.toLowerCase()) : true;
            const departmentMatch = departmentFilter ? employee.departament === departmentFilter : true;
            return nameMatch && departmentMatch;
        });
    }, [employees, nameFilter, departmentFilter]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <BookUser className="h-6 w-6" />
                    Directorio de Empleados
                </CardTitle>
                <CardDescription>Busca y contacta con los empleados de la organización.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                     <div className="w-full md:w-1/2">
                        <Select value={departmentFilter} onValueChange={(value) => setDepartmentFilter(value === 'all' ? '' : value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por departamento..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los departamentos</SelectItem>
                                {departments.map(dep => (
                                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="ml-2">Cargando directorio...</p>
                    </div>
                ) : filteredEmployees.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Nombre</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead className="hidden md:table-cell">Departamento</TableHead>
                                <TableHead className="text-right">Contacto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={employee.fotoUrl} alt={`${employee.nom} ${employee.cognom}`} />
                                                <AvatarFallback>{employee.nom.charAt(0)}{employee.cognom.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{employee.nom} {employee.cognom}</p>
                                                <a href={`mailto:${employee.email}`} className="text-sm text-muted-foreground hover:text-primary">
                                                    {employee.email}
                                                </a>
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
                                        <div className="flex flex-col items-end gap-1">
                                            {employee.telefons?.[0] && (
                                                <a href={`tel:${employee.telefons[0]}`} className="flex items-center justify-end gap-2 text-muted-foreground hover:text-primary">
                                                    <Phone className="h-4 w-4" />
                                                    <span>{employee.telefons[0]}</span>
                                                </a>
                                            )}
                                            <a href={`mailto:${employee.email}`} className="flex items-center justify-end gap-2 text-muted-foreground hover:text-primary">
                                                <Mail className="h-4 w-4" />
                                                <span>Email</span>
                                            </a>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                         {employees && employees.length > 0 ? (
                            <p>No se han encontrado empleados que coincidan con la búsqueda.</p>
                         ) : (
                            <>
                                <p>El directorio está vacío.</p>
                                <p className="text-sm">Añade empleados a la colección 'directori' en Firestore para verlos aquí.</p>
                            </>
                         )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
