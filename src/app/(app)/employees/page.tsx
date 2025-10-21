'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, getDocs, or } from "firebase/firestore";
import { Loader2, BookUser, Mail, Phone, Search, ChevronsUpDown, Check, XIcon, ArrowUp, ArrowDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { Directori } from "@/lib/types";

type SortKey = 'nom' | 'cognom' | 'centreCost';
type SortDirection = 'asc' | 'desc';

type Department = {
    id: string;
    name: string;
}

export default function DirectoryPage() {
    const firestore = useFirestore();
    const [nameFilter, setNameFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [departmentOpen, setDepartmentOpen] = useState(false);
    
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'nom', direction: 'asc' });
    
    const [employees, setEmployees] = useState<Directori[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const departmentsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'departaments'), orderBy('name'));
    }, [firestore]);
    const { data: departments, isLoading: isLoadingDepts } = useCollection<Department>(departmentsCollection);
    
    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });

        const sortedEmployees = [...employees].sort((a, b) => {
            const aVal = a[key] || '';
            const bVal = b[key] || '';
            const comparison = String(aVal).localeCompare(String(bVal));
            return direction === 'asc' ? comparison : -comparison;
        });
        setEmployees(sortedEmployees);
    };
    
    const performSearch = async () => {
        if (!firestore) return;

        const searchTerm = nameFilter.trim();
        
        if (!searchTerm && !departmentFilter) {
            setEmployees([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        const baseCollection = collection(firestore, 'directori');
        let finalQuery;

        if (searchTerm) {
            const searchTermCapitalized = searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1);
            finalQuery = query(
                baseCollection, 
                or(
                    where('nom', '>=', searchTermCapitalized),
                    where('cognom', '>=', searchTermCapitalized)
                )
            );
        } else if (departmentFilter) {
            finalQuery = query(
                baseCollection,
                where('departament', '==', departmentFilter),
                orderBy(sortConfig.key, sortConfig.direction)
            );
        } else {
             setIsLoading(false);
             setEmployees([]);
             return;
        }

        try {
            const querySnapshot = await getDocs(finalQuery);
            let fetchedEmployees = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Directori);

            if (searchTerm) {
                const lowercasedSearch = searchTerm.toLowerCase();
                fetchedEmployees = fetchedEmployees.filter(emp => 
                    emp.nom.toLowerCase().startsWith(lowercasedSearch) || emp.cognom.toLowerCase().startsWith(lowercasedSearch)
                );
            }
            
            const sorted = fetchedEmployees.sort((a,b) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';
                const comparison = String(aVal).localeCompare(String(bVal));
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
            setEmployees(sorted);

        } catch (error) {
            console.error("Error searching employees:", error);
            setEmployees([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setDepartmentFilter('');
        performSearch();
    };

    const handleDepartmentSelect = (depName: string) => {
        const newFilter = depName === departmentFilter ? "" : depName;
        setNameFilter('');
        setDepartmentFilter(newFilter);
        setDepartmentOpen(false);
        // Automatically search when a department is selected
        if (newFilter) {
            // A bit of a hack to make sure the state is updated before searching
            setTimeout(() => performSearch(), 0);
        } else {
            clearFilters();
        }
    };
    
    const clearFilters = () => {
        setNameFilter('');
        setDepartmentFilter('');
        setEmployees([]);
        setHasSearched(false);
    }

    const currentDepartment = departments?.find(dep => dep.name === departmentFilter);
    const effectiveIsLoading = isLoadingDepts || isLoading;

    const renderSortArrow = (key: SortKey) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
        }
        return <ChevronsUpDown className="ml-2 h-4 w-4 opacity-30" />;
    };

    const hasActiveFilter = nameFilter || departmentFilter;

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
                        <form className="relative w-full" onSubmit={handleSearchSubmit}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o apellido..."
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                className="pl-10"
                            />
                            <Button type="submit" className="sr-only">Buscar</Button>
                        </form>
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
                                    <CommandInput placeholder="Buscar departamento..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontró el departamento.</CommandEmpty>
                                        <CommandGroup>
                                             <CommandItem
                                                key="all-departments"
                                                value=""
                                                onSelect={() => handleDepartmentSelect("")}
                                             >
                                                <Check className={cn("mr-2 h-4 w-4", departmentFilter === "" ? "opacity-100" : "opacity-0")} />
                                                Todos los departamentos
                                             </CommandItem>
                                            {departments && departments.map((dep) => (
                                                <CommandItem
                                                    key={dep.id}
                                                    value={dep.name}
                                                    onSelect={() => {
                                                        setNameFilter(''); 
                                                        setDepartmentFilter(dep.name);
                                                        performSearch();
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
                    </div>
                </div>
                 {hasActiveFilter && (
                    <div className="mb-4 text-right">
                        <Button variant="ghost" onClick={clearFilters}>
                            <XIcon className="h-4 w-4 mr-2" />
                            Limpiar filtros
                        </Button>
                    </div>
                )}


                {effectiveIsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="ml-2">Buscando empleados...</p>
                    </div>
                ) : hasSearched && employees.length > 0 ? (
                    <>
                    <div className="relative">
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
                    </>
                ) : hasSearched ? (
                    <div className="text-center text-muted-foreground py-8">
                         <p>No se han encontrado empleados que coincidan con la búsqueda.</p>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                         <p>Utiliza los filtros de arriba para buscar en el directorio de empleados.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
