import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockEmployees } from "@/lib/mock-data";

export default function EmployeesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Employees</CardTitle>
                <CardDescription>Manage your employees and their roles.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Employee data table will be displayed here.</p>
                <pre className="mt-4 bg-slate-100 p-4 rounded-lg dark:bg-slate-800">
                    {JSON.stringify(mockEmployees, null, 2)}
                </pre>
            </CardContent>
        </Card>
    )
}
