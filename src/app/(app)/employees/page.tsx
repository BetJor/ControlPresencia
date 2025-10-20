'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData, and } from "firebase/firestore";
import { Loader2, BookUser, Mail, Phone, Search, ChevronsUpDown, Check, XIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Directori } from "@/lib/types";

const PAGE_SIZE = 15;

export default function DirectoryPage() {
    const firestore = useFirestore();
    const [nameFilter, setNameFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [departmentOpen, setDepartmentOpen] = useState(false);
    
    const [paginationCursors, setPaginationCursors] = useState<(QueryDocumentSnapshot<DocumentData> | null)[]>([null]);
    const [currentPage, setCurrentPage] = useState(0);

    const allDepartmentsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'directori'), orderBy('departament'));
    }, [firestore]);
    const { data: allEmployeesForDepts, isLoading: isLoadingDepts } = useCollection<Directori>(allDepartmentsCollection);

    const departments = useMemo(() => {
        if (!allEmployeesForDepts) return [];
        const allDepartments = allEmployeesForDepts.map(employee => employee.departament).filter(Boolean);
        return [...new Set(allDepartments)].sort();
    }, [allEmployeesForDepts]);
    
    const directoriQuery = useMemoFirebase(() => {
        if (!firestore) return null;

        const constraints = [];

        if (departmentFilter) {
            constraints.push(where('departament', '==', departmentFilter));
        }
        
        const nameFilterTrimmed = nameFilter.trim();
        if (nameFilterTrimmed) {
            const nameEnd = nameFilterTrimmed.slice(0, -1) + String.fromCharCode(nameFilterTrimmed.charCodeAt(nameFilterTrimmed.length - 1) + 1);
            constraints.push(and(
                where('nom', '>=', nameFilterTrimmed),
                where('nom', '<', nameEnd)
            ));
        }

        const q = query(
            collection(firestore, 'directori'), 
            ...constraints,
            orderBy('nom'), 
            startAfter(paginationCursors[currentPage] || null),
            limit(PAGE_SIZE + 1)
        );
        
        return q;
    }, [firestore, departmentFilter, nameFilter, currentPage, paginationCursors]);


    const { data: employeesData, isLoading: isLoadingData } = useCollection<Directori>(directoriQuery);

    const employees = useMemo(() => employeesData?.slice(0, PAGE_SIZE) ?? [], [employeesData]);
    const hasNextPage = (employeesData?.length ?? 0) > PAGE_SIZE;
    const hasPrevPage = currentPage > 0;

    const handleNextPage = () => {
        if (hasNextPage && employeesData) {
            const lastDoc = employeesData[employeesData.length - 2]; 
            const newCursors = [...paginationCursors];
            newCursors[currentPage + 1] = lastDoc;
            setPaginationCursors(newCursors);
            setCurrentPage(prev => prev + 1);
        }
    };
    
    const handlePrevPage = () => {
        if (hasPrevPage) {
            setCurrentPage(prev => prev - 1);
        }
    };
    
    useEffect(() => {
        setCurrentPage(0);
        setPaginationCursors([null]);
    }, [nameFilter, departmentFilter]);


    const currentDepartment = departments.find(dep => dep === departmentFilter)
    const effectiveIsLoading = isLoadingData || isLoadingDepts;

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
                     <div className="relative w-full md:w-1/2 flex items-center gap-2">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre..."
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="pl-10"
                            />
                             {nameFilter && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setNameFilter('')}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                                >
                                    <XIcon className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                     <div className="w-full md:w-1/2 flex items-center gap-2">
                        <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={departmentOpen}
                                    className="w-full justify-between"
                                >
                                    {currentDepartment
                                        ? currentDepartment
                                        : "Seleccionar departamento..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput 
                                      placeholder="Buscar departamento..." 
                                    />
                                    <CommandList>
                                        <CommandEmpty>No se encontró el departamento.</CommandEmpty>
                                        <CommandGroup>
                                             <CommandItem
                                                key="all-departments"
                                                value=""
                                                onSelect={() => {
                                                    setDepartmentFilter("");
                                                    setDepartmentOpen(false);
                                                }}
                                             >
                                                <Check className={cn("mr-2 h-4 w-4", departmentFilter === "" ? "opacity-100" : "opacity-0")} />
                                                Todos los departamentos
                                             </CommandItem>
                                            {departments && departments.map((dep) => (
                                                <CommandItem
                                                    key={dep}
                                                    value={dep}
                                                    onSelect={(currentValue) => {
                                                        const newFilter = dep.toLowerCase() === departmentFilter.toLowerCase() ? "" : dep;
                                                        setDepartmentFilter(newFilter);
                                                        setDepartmentOpen(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", departmentFilter === dep ? "opacity-100" : "opacity-0")} />
                                                    {dep}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {departmentFilter && (
                            <Button variant="ghost" size="icon" onClick={() => setDepartmentFilter('')}>
                                <XIcon className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {effectiveIsLoading && (!employees || employees.length === 0) ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="ml-2">Cargando directorio...</p>
                    </div>
                ) : employees && employees.length > 0 ? (
                    <>
                    <div className="relative">
                        {effectiveIsLoading && (
                          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
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
                    </div>
                     <div className="flex justify-end items-center gap-2 pt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevPage}
                            disabled={!hasPrevPage || effectiveIsLoading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={!hasNextPage || effectiveIsLoading}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                         <p>No se han encontrado empleados que coincidan con la búsqueda.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
