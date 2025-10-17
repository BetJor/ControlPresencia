import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTerminals } from "@/lib/mock-data";

export default function TerminalsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Terminales</CardTitle>
                <CardDescription>Gestiona tus terminales de fichaje.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>La tabla de datos de terminales se mostrará aquí.</p>
                 <pre className="mt-4 bg-slate-100 p-4 rounded-lg dark:bg-slate-800">
                    {JSON.stringify(mockTerminals, null, 2)}
                </pre>
            </CardContent>
        </Card>
    )
}
