import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTerminals } from "@/lib/mock-data";

export default function TerminalsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Terminals</CardTitle>
                <CardDescription>Manage your attendance terminals.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Terminal data table will be displayed here.</p>
                 <pre className="mt-4 bg-slate-100 p-4 rounded-lg dark:bg-slate-800">
                    {JSON.stringify(mockTerminals, null, 2)}
                </pre>
            </CardContent>
        </Card>
    )
}
