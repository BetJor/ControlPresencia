"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PunchClock;
const React = require("react");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const accordion_1 = require("@/components/ui/accordion");
const use_toast_1 = require("@/hooks/use-toast");
const mock_data_1 = require("@/lib/mock-data");
const lucide_react_1 = require("lucide-react");
const input_1 = require("../ui/input");
const label_1 = require("../ui/label");
const popover_1 = require("@/components/ui/popover");
const command_1 = require("@/components/ui/command");
const utils_1 = require("@/lib/utils");
const card_2 = require("@/components/ui/card");
const firebase_1 = require("@/firebase");
const firestore_1 = require("firebase/firestore");
const lucide_react_2 = require("lucide-react");
function PunchClock() {
    var _a, _b;
    const { toast } = (0, use_toast_1.useToast)();
    const [employeeOpen, setEmployeeOpen] = React.useState(false);
    const [employeeValue, setEmployeeValue] = React.useState("");
    const [favoritesOpen, setFavoritesOpen] = React.useState(false);
    const [visitorName, setVisitorName] = React.useState("");
    const [visitorCompany, setVisitorCompany] = React.useState("");
    const [isFavorite, setIsFavorite] = React.useState(false);
    const firestore = (0, firebase_1.useFirestore)();
    const { user, isUserLoading } = (0, firebase_1.useUser)();
    const favoriteVisitorsCollection = (0, firebase_1.useMemoFirebase)(() => {
        if (!firestore)
            return null;
        return (0, firestore_1.collection)(firestore, 'favorite_visitors');
    }, [firestore]);
    const { data: favoriteVisitors, isLoading: favoritesLoading } = (0, firebase_1.useCollection)(favoriteVisitorsCollection);
    React.useEffect(() => {
        if (favoriteVisitors && visitorName && visitorCompany) {
            const isAlreadyFavorite = favoriteVisitors.some((fav) => fav.name.toLowerCase() === visitorName.toLowerCase() && fav.company.toLowerCase() === visitorCompany.toLowerCase());
            setIsFavorite(isAlreadyFavorite);
        }
        else {
            setIsFavorite(false);
        }
    }, [visitorName, visitorCompany, favoriteVisitors]);
    const handleManualPunch = () => {
        if (!employeeValue || !firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Has de seleccionar un empleat.",
            });
            return;
        }
        const selectedEmployee = mock_data_1.mockEmployees.find((employee) => employee.id === employeeValue);
        if (selectedEmployee) {
            const employeeDocRef = (0, firestore_1.doc)(firestore, 'usuaris_dins', selectedEmployee.id);
            const employeeData = {
                nom: selectedEmployee.firstName,
                cognoms: selectedEmployee.lastName,
                horaDarreraEntrada: (0, firestore_1.serverTimestamp)(),
            };
            // We use setDoc here to create or overwrite the document with the employee's ID.
            // This ensures that if they punch in again, their entry time is updated.
            (0, firestore_1.setDoc)(employeeDocRef, employeeData)
                .then(() => {
                toast({
                    title: 'Entrada Manual Registrada',
                    description: `S'ha registrat l'entrada per a ${selectedEmployee.firstName} ${selectedEmployee.lastName}.`,
                });
                setEmployeeValue(""); // Reset dropdown
            })
                .catch((error) => {
                toast({
                    variant: "destructive",
                    title: "Error en el registre",
                    description: "No s'ha pogut registrar l'entrada. Intenta-ho de nou.",
                });
            });
        }
    };
    const handleVisitorEntry = () => {
        if (!visitorName || !visitorCompany) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "El nombre y la empresa de la visita son obligatorios.",
            });
            return;
        }
        const visitData = {
            name: visitorName,
            company: visitorCompany,
            timestamp: (0, firestore_1.serverTimestamp)(),
        };
        if (firestore) {
            const visitsCollection = (0, firestore_1.collection)(firestore, 'visit_registrations');
            (0, firebase_1.addDocumentNonBlocking)(visitsCollection, visitData);
            if (isFavorite) {
                // Check if the visitor is already a favorite to avoid duplicates
                const isAlreadyFavorite = favoriteVisitors === null || favoriteVisitors === void 0 ? void 0 : favoriteVisitors.some((fav) => fav.name.toLowerCase() === visitorName.toLowerCase() && fav.company.toLowerCase() === visitorCompany.toLowerCase());
                if (!isAlreadyFavorite) {
                    const favoriteVisitorData = {
                        name: visitorName,
                        company: visitorCompany,
                    };
                    const favsCollection = (0, firestore_1.collection)(firestore, 'favorite_visitors');
                    (0, firebase_1.addDocumentNonBlocking)(favsCollection, favoriteVisitorData);
                }
            }
            toast({
                title: 'Visita Registrada',
                description: 'La entrada de la visita ha sido registrada con éxito.',
            });
            // Reset fields
            setVisitorName("");
            setVisitorCompany("");
            setIsFavorite(false);
        }
        else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "La base de datos no está disponible. Inténtalo de nuevo más tarde.",
            });
        }
    };
    const isLoading = isUserLoading || favoritesLoading;
    return (<card_2.Card>
        <card_1.CardHeader>
            <accordion_1.Accordion type="single" collapsible defaultValue='item-1' className='-m-6'>
                <accordion_1.AccordionItem value="item-1" className='border-0'>
                    <accordion_1.AccordionTrigger className='p-6 hover:no-underline'>
                        <div className="text-left">
                            <card_2.CardTitle className="font-headline flex items-center gap-2">
                                <lucide_react_1.Edit className="h-6 w-6"/>
                                Recepción
                            </card_2.CardTitle>
                            <card_1.CardDescription className="max-w-lg text-balance leading-relaxed mt-1.5">
                                Registra una entrada manual para un empleado o una nueva visita.
                            </card_1.CardDescription>
                        </div>
                    </accordion_1.AccordionTrigger>
                    <accordion_1.AccordionContent className='p-6 pt-0'>
                        <div className="grid gap-6">
                            {/* Manual Punch for Employee */}
                            <div>
                            <h3 className="mb-2 font-medium flex items-center gap-2"><lucide_react_1.Fingerprint className='h-5 w-5'/> Fichaje Manual Empleado</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label_1.Label htmlFor="employee-search">Empleado</label_1.Label>
                                    <popover_1.Popover open={employeeOpen} onOpenChange={setEmployeeOpen}>
                                        <popover_1.PopoverTrigger asChild>
                                        <button_1.Button variant="outline" role="combobox" aria-expanded={employeeOpen} className="w-full justify-between" disabled={isLoading}>
                                            {employeeValue
            ? ((_a = mock_data_1.mockEmployees.find((employee) => employee.id === employeeValue)) === null || _a === void 0 ? void 0 : _a.firstName) + ' ' + ((_b = mock_data_1.mockEmployees.find((employee) => employee.id === employeeValue)) === null || _b === void 0 ? void 0 : _b.lastName)
            : "Seleccionar empleado..."}
                                            <lucide_react_1.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                        </button_1.Button>
                                        </popover_1.PopoverTrigger>
                                        <popover_1.PopoverContent className="w-[200px] p-0">
                                        <command_1.Command>
                                            <command_1.CommandInput placeholder="Buscar empleado..."/>
                                            <command_1.CommandEmpty>No se encontró el empleado.</command_1.CommandEmpty>
                                            <command_1.CommandGroup>
                                            {mock_data_1.mockEmployees.map((employee) => (<command_1.CommandItem key={employee.id} value={employee.id} onSelect={(currentValue) => {
                setEmployeeValue(currentValue === employeeValue ? "" : currentValue);
                setEmployeeOpen(false);
            }}>
                                                <lucide_react_1.Check className={(0, utils_1.cn)("mr-2 h-4 w-4", employeeValue === employee.id ? "opacity-100" : "opacity-0")}/>
                                                {employee.firstName} {employee.lastName}
                                                </command_1.CommandItem>))}
                                            </command_1.CommandGroup>
                                        </command_1.Command>
                                        </popover_1.PopoverContent>
                                    </popover_1.Popover>
                                </div>
                                <div className='grid gap-2'>
                                    <label_1.Label>&nbsp;</label_1.Label>
                                    <button_1.Button onClick={handleManualPunch} className='w-full' disabled={isLoading || !employeeValue}>
                                        Registrar Entrada
                                    </button_1.Button>
                                </div>
                            </div>
                            </div>

                            {/* Visitor Entry */}
                            <div>
                                <h3 className="mb-2 font-medium flex items-center gap-2"><lucide_react_1.Contact className='h-5 w-5'/> Entrada de Visita</h3>
                                {isLoading ? (<div className="flex items-center justify-center p-4">
                                        <lucide_react_2.Loader2 className="h-6 w-6 animate-spin text-muted-foreground"/>
                                        <p className="ml-2">Cargando favoritos...</p>
                                     </div>) : (<>
                                    <div className="grid gap-2">
                                        <label_1.Label htmlFor="favorite-visitor-search">Buscar Favorito (Opcional)</label_1.Label>
                                        <popover_1.Popover open={favoritesOpen} onOpenChange={setFavoritesOpen}>
                                            <popover_1.PopoverTrigger asChild>
                                                <button_1.Button variant="outline" role="combobox" aria-expanded={favoritesOpen} className="w-full justify-between">
                                                    Seleccionar visitante favorito...
                                                    <lucide_react_1.ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                                </button_1.Button>
                                            </popover_1.PopoverTrigger>
                                            <popover_1.PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <command_1.Command>
                                                    <command_1.CommandInput placeholder="Buscar visitante..."/>
                                                    <command_1.CommandList>
                                                        <command_1.CommandEmpty>No se encontró ningún visitante favorito.</command_1.CommandEmpty>
                                                        <command_1.CommandGroup>
                                                            {favoriteVisitors === null || favoriteVisitors === void 0 ? void 0 : favoriteVisitors.map((visitor) => (<command_1.CommandItem key={visitor.id} value={`${visitor.name} ${visitor.company}`} onSelect={() => {
                    setVisitorName(visitor.name);
                    setVisitorCompany(visitor.company);
                    setFavoritesOpen(false);
                }}>
                                                                    <lucide_react_1.Check className={(0, utils_1.cn)("mr-2 h-4 w-4", visitorName === visitor.name ? "opacity-100" : "opacity-0")}/>
                                                                    {visitor.name} ({visitor.company})
                                                                </command_1.CommandItem>))}
                                                        </command_1.CommandGroup>
                                                    </command_1.CommandList>
                                                </command_1.Command>
                                            </popover_1.PopoverContent>
                                        </popover_1.Popover>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="grid gap-2">
                                            <label_1.Label htmlFor="visitor-name">Nombre</label_1.Label>
                                            <input_1.Input id="visitor-name" placeholder="Nombre del visitante" value={visitorName} onChange={(e) => setVisitorName(e.target.value)}/>
                                        </div>
                                        <div className="grid gap-2">
                                            <label_1.Label htmlFor="visitor-company">Empresa</label_1.Label>
                                            <div className="flex items-center gap-2">
                                                <input_1.Input id="visitor-company" placeholder="Nombre de la empresa" value={visitorCompany} onChange={(e) => setVisitorCompany(e.target.value)} className="w-full"/>
                                                <button_1.Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)} disabled={isLoading || !visitorName || !visitorCompany}>
                                                    <lucide_react_1.Star className={(0, utils_1.cn)("h-5 w-5", isFavorite ? "fill-primary text-primary" : "text-muted-foreground")}/>
                                                </button_1.Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4">
                                        <button_1.Button onClick={handleVisitorEntry} className='w-full' disabled={isLoading || !visitorName || !visitorCompany}>
                                            <lucide_react_1.UserPlus className='mr-2'/>
                                            Registrar Visita
                                        </button_1.Button>
                                    </div>
                                </>)}
                            </div>
                        </div>
                    </accordion_1.AccordionContent>
                </accordion_1.AccordionItem>
            </accordion_1.Accordion>
      </card_1.CardHeader>
    </card_2.Card>);
}
//# sourceMappingURL=punch-clock.js.map