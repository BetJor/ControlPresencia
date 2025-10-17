import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockVisitors } from "@/lib/mock-data";

export default function VisitorsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Visitas</CardTitle>
                <CardDescription>Gestiona las visitas a la oficina.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>La tabla de datos de visitas se mostrará aquí.</p>
                <pre className="mt-4 bg-slate-100 p-4 rounded-lg dark:bg-slate-800">
                    {JSON.stringify(mockVisitors, null, 2)}
                </pre>
            </CardContent>
        </Card>
    )
}
