import { determineStaffPresent } from '@/ai/flows/determine-staff-present';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockEmployees, mockPunches } from '@/lib/mock-data';
import type { Employee } from '@/lib/types';
import { Users } from 'lucide-react';

// Helper function to get punches for today
const getTodaysPunches = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return mockPunches.filter(punch => {
    const punchDate = new Date(punch.timestamp);
    return punchDate >= today && punchDate < tomorrow;
  });
};

export default async function PresentStaff() {
  const employeeIds = mockEmployees.map((e) => e.id);
  const todaysPunches = getTodaysPunches();
  
  const dailyPunchCounts = employeeIds.reduce((acc, employeeId) => {
    acc[employeeId] = todaysPunches.filter(p => p.employeeId === employeeId).length;
    return acc;
  }, {} as Record<string, number>);

  const { presentEmployeeIds } = await determineStaffPresent({
    employeeIds,
    dailyPunchCounts,
  });

  const presentStaff: Employee[] = mockEmployees.filter(employee =>
    presentEmployeeIds.includes(employee.id)
  );

  return (
    <Card className="sm:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle className="font-headline flex items-center gap-2">
            <Users className="h-6 w-6" />
            Staff on Site
        </CardTitle>
      </CardHeader>
      <CardContent>
        {presentStaff.length > 0 ? (
          <div className="flex -space-x-2 overflow-hidden">
            {presentStaff.map((employee) => (
              <Avatar key={employee.id} className="inline-block h-12 w-12 rounded-full border-2 border-card">
                <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                <AvatarFallback>{employee.name.charAt(0)}{employee.cognoms.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No staff currently on site.</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{presentStaff.length}</span> out of {mockEmployees.length} employees are currently present.
        </p>
      </CardContent>
    </Card>
  );
}
