import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockIncidents } from "@/lib/mock-data";

export default function IncidentsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Incidencias</CardTitle>
                <CardDescription>Gestiona los tipos de incidencias para los fichajes.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>La tabla de datos de incidencias se mostrará aquí.</p>
                <pre className="mt-4 bg-slate-100 p-4 rounded-lg dark:bg-slate-800">
                    {JSON.stringify(mockIncidents, null, 2)}
                </pre>
            </CardContent>
        </Card>
    )
}
