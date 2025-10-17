import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockIncidents } from "@/lib/mock-data";

export default function IncidentsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Incidents</CardTitle>
                <CardDescription>Manage incident types for punches.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Incident data table will be displayed here.</p>
                <pre className="mt-4 bg-slate-100 p-4 rounded-lg dark:bg-slate-800">
                    {JSON.stringify(mockIncidents, null, 2)}
                </pre>
            </CardContent>
        </Card>
    )
}
