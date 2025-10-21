'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData, OrderByDirection } from "firebase/firestore";
import { Loader2, BookUser, Mail, Phone, Search, ChevronsUpDown, Check, XIcon, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Directori } from "@/lib/types";

const PAGE_SIZE = 15;
type SortKey = 'nom' | 'cognom' | 'centreCost';

type Department = {
    id: string;
    name: string;
}

export default function DirectoryPage() {
    const firestore = useFirestore();
    const [nameFilter, setNameFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [departmentOpen, setDepartmentOpen] = useState(false);
    
    const [paginationCursors, setPaginationCursors] = useState<(QueryDocumentSnapshot<DocumentData> | null)[]>([null]);
    const [currentPage, setCurrentPage] = useState(0);

    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: OrderByDirection }>({ key: 'nom', direction: 'asc' });

    const departmentsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'departaments'), orderBy('name'));
    }, [firestore]);
    const { data: departments, isLoading: isLoadingDepts } = useCollection<Department>(departmentsCollection);
    
    const handleSort = (key: SortKey) => {
        setSortConfig(prevConfig => {
            if (prevConfig.key === key) {
                return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
        setCurrentPage(0);
        setPaginationCursors([null]);
    };

    const baseQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        let q = collection(firestore, 'directori');
        
        const filters = [];
        if (departmentFilter) {
            filters.push(where('departament', '==', departmentFilter));
        }

        if (filters.length > 0) {
            return query(q, ...filters);
        }

        return q;
    }, [firestore, departmentFilter]);


    const nameSearchTerm = nameFilter.trim().toLowerCase();
    const nameFilterQuery = useMemoFirebase(() => {
        if (!firestore || !baseQuery || !nameSearchTerm) return null;
         const searchTermCapitalized = nameSearchTerm.charAt(0).toUpperCase() + nameSearchTerm.slice(1);
        return query(
            baseQuery, 
            orderBy('nom'), 
            where('nom', '>=', searchTermCapitalized), 
            where('nom', '<=', searchTermCapitalized + '\uf8ff')
        );
    }, [firestore, baseQuery, nameSearchTerm]);

    const lastNameFilterQuery = useMemoFirebase(() => {
        if (!firestore || !baseQuery || !nameSearchTerm) return null;
        const searchTermCapitalized = nameSearchTerm.charAt(0).toUpperCase() + nameSearchTerm.slice(1);
        return query(
            baseQuery,
            orderBy('cognom'),
            where('cognom', '>=', searchTermCapitalized),
            where('cognom', '<=', searchTermCapitalized + '\uf8ff')
        );
    }, [firestore, baseQuery, nameSearchTerm]);
    
    const paginatedQuery = useMemoFirebase(() => {
        if (!firestore || !baseQuery || nameSearchTerm) return null; 
        return query(
            baseQuery,
            orderBy(sortConfig.key, sortConfig.direction),
            startAfter(paginationCursors[currentPage] || 0),
            limit(PAGE_SIZE + 1)
        );
    }, [firestore, baseQuery, nameSearchTerm, currentPage, paginationCursors, sortConfig]);


    const { data: paginatedEmployeesData, isLoading: isLoadingPaginated, error: paginatedError, snapshot: paginatedSnapshot } = useCollection<Directori>(paginatedQuery);
    const { data: nameFilteredEmployees, isLoading: isLoadingName } = useCollection<Directori>(nameFilterQuery);
    const { data: lastNameFilteredEmployees, isLoading: isLoadingLastName } = useCollection<Directori>(lastNameFilterQuery);

    const employees = useMemo(() => {
        if (nameSearchTerm) {
            const resultsMap = new Map<string, Directori>();
            nameFilteredEmployees?.forEach(doc => doc.id && resultsMap.set(doc.id, doc));
            lastNameFilteredEmployees?.forEach(doc => doc.id && resultsMap.set(doc.id, doc));
            const combined = Array.from(resultsMap.values());
            
            return combined.sort((a,b) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';
                const comparison = String(aVal).localeCompare(String(bVal));
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }
        return paginatedEmployeesData?.slice(0, PAGE_SIZE) ?? [];
    }, [nameSearchTerm, paginatedEmployeesData, nameFilteredEmployees, lastNameFilteredEmployees, sortConfig]);

    const hasNextPage = !nameSearchTerm && (paginatedEmployeesData?.length ?? 0) > PAGE_SIZE;
    const hasPrevPage = !nameSearchTerm && currentPage > 0;
    
    const handleNextPage = () => {
        if (hasNextPage && paginatedSnapshot) {
            const lastVisibleDoc = paginatedSnapshot.docs[paginatedSnapshot.docs.length - 2];
            setPaginationCursors(prev => {
                const newCursors = [...prev];
                newCursors[currentPage + 1] = lastVisibleDoc;
                return newCursors;
            });
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
    }, [nameFilter, departmentFilter, sortConfig]);


    const currentDepartment = departments?.find(dep => dep.name === departmentFilter)
    const effectiveIsLoading = isLoadingPaginated || isLoadingDepts || isLoadingName || isLoadingLastName;

    const renderSortArrow = (key: SortKey) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
        }
        return null;
    };

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
                                placeholder="Buscar por nombre o apellido..."
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
                                        ? currentDepartment.name
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
                                                    key={dep.id}
                                                    value={dep.name}
                                                    onSelect={(currentValue) => {
                                                        const newFilter = dep.name === departmentFilter ? "" : dep.name;
                                                        setDepartmentFilter(newFilter);
                                                        setDepartmentOpen(false);
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", departmentFilter === dep.name ? "opacity-100" : "opacity-0")} />
                                                    {dep.name}
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
                                    <TableHead className="w-[300px]">
                                        <Button variant="ghost" onClick={() => handleSort('nom')} className="px-0 h-auto hover:bg-transparent">
                                            Nombre {renderSortArrow('nom')}
                                        </Button>
                                    </TableHead>
                                    <TableHead>
                                        <Button variant="ghost" onClick={() => handleSort('centreCost')} className="px-0 h-auto hover:bg-transparent">
                                            Id {renderSortArrow('centreCost')}
                                        </Button>
                                    </TableHead>
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
                                            <p className="font-medium">{employee.centreCost}</p>
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
                    {!nameSearchTerm && (
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
                    )}
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
