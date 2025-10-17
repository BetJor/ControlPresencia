"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmployeesPage;
const card_1 = require("@/components/ui/card");
const mock_data_1 = require("@/lib/mock-data");
function EmployeesPage() {
    return (<card_1.Card>
            <card_1.CardHeader>
                <card_1.CardTitle className="font-headline">Empleados</card_1.CardTitle>
                <card_1.CardDescription>Gestiona tus empleados y sus roles.</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
                <p>La tabla de datos de empleados se mostrará aquí.</p>
                <pre className="mt-4 bg-slate-100 p-4 rounded-lg dark:bg-slate-800">
                    {JSON.stringify(mock_data_1.mockEmployees, null, 2)}
                </pre>
            </card_1.CardContent>
        </card_1.Card>);
}
//# sourceMappingURL=page.js.map