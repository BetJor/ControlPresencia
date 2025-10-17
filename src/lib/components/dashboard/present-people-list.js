"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PresentPeopleList;
const card_1 = require("@/components/ui/card");
const table_1 = require("@/components/ui/table");
const firebase_1 = require("@/firebase");
const firestore_1 = require("firebase/firestore");
const lucide_react_1 = require("lucide-react");
const accordion_1 = require("@/components/ui/accordion");
const button_1 = require("../ui/button");
const react_1 = require("react");
const tooltip_1 = require("../ui/tooltip");
function PresentPeopleList() {
    const firestore = (0, firebase_1.useFirestore)();
    const [presentVisitors, setPresentVisitors] = (0, react_1.useState)([]);
    // Col·leccions de Firestore
    const usuarisDinsCollection = (0, firebase_1.useMemoFirebase)(() => (firestore ? (0, firestore_1.collection)(firestore, 'usuaris_dins') : null), [firestore]);
    const visitorsCollection = (0, firebase_1.useMemoFirebase)(() => {
        if (!firestore)
            return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return (0, firestore_1.query)((0, firestore_1.collection)(firestore, 'visit_registrations'), (0, firestore_1.where)('timestamp', '>=', today));
    }, [firestore]);
    // Obtenció de dades
    const { data: presentStaff, isLoading: staffLoading } = (0, firebase_1.useCollection)(usuarisDinsCollection);
    const { data: visitors, isLoading: visitorsLoading } = (0, firebase_1.useCollection)(visitorsCollection);
    // Actualitza les visites presents quan canvien les dades
    (0, react_1.useEffect)(() => {
        if (visitors) {
            setPresentVisitors(visitors);
        }
    }, [visitors]);
    const handleVisitorCheckout = (visitorId) => {
        if (firestore && visitorId) {
            const visitorDocRef = (0, firestore_1.doc)(firestore, 'visit_registrations', visitorId);
            (0, firebase_1.deleteDocumentNonBlocking)(visitorDocRef);
        }
    };
    const handleEmployeeCheckout = (employeeId) => {
        if (firestore && employeeId) {
            const employeeDocRef = (0, firestore_1.doc)(firestore, 'usuaris_dins', employeeId);
            (0, firebase_1.deleteDocumentNonBlocking)(employeeDocRef);
        }
    };
    const isLoading = staffLoading || visitorsLoading;
    const totalPresent = ((presentStaff === null || presentStaff === void 0 ? void 0 : presentStaff.length) || 0) + presentVisitors.length;
    const getFormattedTime = (timestamp) => {
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleTimeString();
        }
        return 'N/A';
    };
    return (<card_1.Card>
      <card_1.CardHeader>
        <card_1.CardTitle className="font-headline flex items-center gap-2">
          <lucide_react_1.Users className="h-6 w-6"/>
          Persones a l'Oficina ({isLoading ? '...' : totalPresent})
        </card_1.CardTitle>
        <card_1.CardDescription>
          Una llista de les persones que són actualment a les instal·lacions.
          Actualitzat en temps real.
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        {isLoading ? (<div className="flex items-center justify-center py-8">
            <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
            <p className="ml-2">Actualizando lista de presencia...</p>
          </div>) : (<tooltip_1.TooltipProvider>
            <accordion_1.Accordion type="multiple" defaultValue={['visitors', 'employees']}>
              <accordion_1.AccordionItem value="visitors">
                <accordion_1.AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Contact className="h-5 w-5"/>
                    <span>Visites ({presentVisitors.length})</span>
                  </div>
                </accordion_1.AccordionTrigger>
                <accordion_1.AccordionContent>
                  {presentVisitors.length > 0 ? (<table_1.Table>
                      <table_1.TableHeader>
                        <table_1.TableRow>
                          <table_1.TableHead>Nom</table_1.TableHead>
                          <table_1.TableHead className="hidden sm:table-cell">
                            Empresa
                          </table_1.TableHead>
                          <table_1.TableHead className="hidden sm:table-cell">
                            Hora Entrada
                          </table_1.TableHead>
                          <table_1.TableHead className="text-right">Accions</table_1.TableHead>
                        </table_1.TableRow>
                      </table_1.TableHeader>
                      <table_1.TableBody>
                        {presentVisitors.map((visitor) => (<table_1.TableRow key={`vis-${visitor.id}`}>
                            <table_1.TableCell>
                              <div className="font-medium">{visitor.name}</div>
                            </table_1.TableCell>
                            <table_1.TableCell className="hidden sm:table-cell">
                              {visitor.company}
                            </table_1.TableCell>
                            <table_1.TableCell className="hidden sm:table-cell">
                              {getFormattedTime(visitor.timestamp)}
                            </table_1.TableCell>
                            <table_1.TableCell className="text-right">
                              <tooltip_1.Tooltip>
                                <tooltip_1.TooltipTrigger asChild>
                                  <button_1.Button variant="ghost" size="icon" onClick={() => handleVisitorCheckout(visitor.id)}>
                                    <lucide_react_1.LogOut className="h-4 w-4"/>
                                  </button_1.Button>
                                </tooltip_1.TooltipTrigger>
                                <tooltip_1.TooltipContent>
                                  <p>Marcar Sortida</p>
                                </tooltip_1.TooltipContent>
                              </tooltip_1.Tooltip>
                            </table_1.TableCell>
                          </table_1.TableRow>))}
                      </table_1.TableBody>
                    </table_1.Table>) : (<div className="p-4 text-center text-muted-foreground">
                      No hi ha visites a l'oficina.
                    </div>)}
                </accordion_1.AccordionContent>
              </accordion_1.AccordionItem>
              <accordion_1.AccordionItem value="employees">
                <accordion_1.AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.User className="h-5 w-5"/>
                    <span>Empleats ({(presentStaff === null || presentStaff === void 0 ? void 0 : presentStaff.length) || 0})</span>
                  </div>
                </accordion_1.AccordionTrigger>
                <accordion_1.AccordionContent>
                  {presentStaff && presentStaff.length > 0 ? (<table_1.Table>
                      <table_1.TableHeader>
                        <table_1.TableRow>
                          <table_1.TableHead>Cognoms</table_1.TableHead>
                          <table_1.TableHead>Nom</table_1.TableHead>
                          <table_1.TableHead className="hidden sm:table-cell">
                            Hora Darrera Entrada
                          </table_1.TableHead>
                          <table_1.TableHead className="text-right">Accions</table_1.TableHead>
                        </table_1.TableRow>
                      </table_1.TableHeader>
                      <table_1.TableBody>
                        {presentStaff.map((employee) => (<table_1.TableRow key={`emp-${employee.id}`}>
                            <table_1.TableCell className="font-medium">
                              {employee.cognoms}
                            </table_1.TableCell>
                            <table_1.TableCell>{employee.nom}</table_1.TableCell>
                            <table_1.TableCell className="hidden sm:table-cell">
                              {getFormattedTime(employee.horaDarreraEntrada)}
                            </table_1.TableCell>
                             <table_1.TableCell className="text-right">
                              <tooltip_1.Tooltip>
                                <tooltip_1.TooltipTrigger asChild>
                                  <button_1.Button variant="ghost" size="icon" onClick={() => handleEmployeeCheckout(employee.id)}>
                                    <lucide_react_1.LogOut className="h-4 w-4"/>
                                  </button_1.Button>
                                </tooltip_1.TooltipTrigger>
                                <tooltip_1.TooltipContent>
                                  <p>Marcar Sortida</p>
                                </tooltip_1.TooltipContent>
                              </tooltip_1.Tooltip>
                            </table_1.TableCell>
                          </table_1.TableRow>))}
                      </table_1.TableBody>
                    </table_1.Table>) : (<div className="p-4 text-center text-muted-foreground">
                      No hi ha empleats a l'oficina.
                    </div>)}
                </accordion_1.AccordionContent>
              </accordion_1.AccordionItem>
            </accordion_1.Accordion>
          </tooltip_1.TooltipProvider>)}
        {totalPresent === 0 && !isLoading && (<div className="pt-4 text-center text-muted-foreground">
            No hi ha ningú a l'oficina en aquest moment.
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
//# sourceMappingURL=present-people-list.js.map