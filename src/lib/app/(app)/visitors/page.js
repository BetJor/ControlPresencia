"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VisitorsPage;
const card_1 = require("@/components/ui/card");
const table_1 = require("@/components/ui/table");
const firebase_1 = require("@/firebase");
const firestore_1 = require("firebase/firestore");
const lucide_react_1 = require("lucide-react");
function VisitorsPage() {
    const firestore = (0, firebase_1.useFirestore)();
    const favoriteVisitorsCollection = (0, firebase_1.useMemoFirebase)(() => {
        if (!firestore)
            return null;
        return (0, firestore_1.collection)(firestore, 'favorite_visitors');
    }, [firestore]);
    const { data: favoriteVisitors, isLoading } = (0, firebase_1.useCollection)(favoriteVisitorsCollection);
    return (<card_1.Card>
            <card_1.CardHeader>
                <card_1.CardTitle className="font-headline flex items-center gap-2">
                    <lucide_react_1.Star className="h-6 w-6 text-primary"/>
                    Visitas Favoritas
                </card_1.CardTitle>
                <card_1.CardDescription>Una lista de tus visitas recurrentes o importantes.</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
                {isLoading ? (<div className="flex items-center justify-center py-8">
                        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                        <p className="ml-2">Cargando visitas favoritas...</p>
                    </div>) : favoriteVisitors && favoriteVisitors.length > 0 ? (<table_1.Table>
                        <table_1.TableHeader>
                            <table_1.TableRow>
                                <table_1.TableHead>Nombre</table_1.TableHead>
                                <table_1.TableHead>Empresa</table_1.TableHead>
                            </table_1.TableRow>
                        </table_1.TableHeader>
                        <table_1.TableBody>
                            {favoriteVisitors.map((visitor) => (<table_1.TableRow key={visitor.id}>
                                    <table_1.TableCell className="font-medium">{visitor.name}</table_1.TableCell>
                                    <table_1.TableCell>{visitor.company}</table_1.TableCell>
                                </table_1.TableRow>))}
                        </table_1.TableBody>
                    </table_1.Table>) : (<div className="text-center text-muted-foreground py-8">
                        <p>Aún no tienes ninguna visita guardada como favorita.</p>
                        <p className="text-sm">Puedes añadirlas desde la sección de Recepción en el Panel al registrar una nueva visita.</p>
                    </div>)}
            </card_1.CardContent>
        </card_1.Card>);
}
//# sourceMappingURL=page.js.map