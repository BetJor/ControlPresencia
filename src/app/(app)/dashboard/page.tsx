import PresentPeopleList from "@/components/dashboard/present-people-list";
import PunchClock from "@/components/dashboard/punch-clock";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { getFirebase } from "@/firebase/provider";
import { initializeFirebase } from "@/firebase";
import { mockEmployees, mockTerminals } from "@/lib/mock-data";

// This is a one-time setup function to seed initial data.
async function seedInitialData() {
    const { firestore } = initializeFirebase();
    if (firestore) {
        // Seed Employees
        const employeesCollection = collection(firestore, 'employees');
        const employeesSnapshot = await getDocs(employeesCollection);
        if (employeesSnapshot.empty) {
            console.log("Seeding employees...");
            for (const employee of mockEmployees) {
                await addDoc(employeesCollection, {
                    id: employee.id, // Keep original mock ID for consistency
                    name: employee.name,
                    cognoms: employee.cognoms,
                    role: employee.role,
                    avatarUrl: employee.avatarUrl
                });
            }
        }

        // Seed Terminals
        const terminalsCollection = collection(firestore, 'terminals');
        const terminalsSnapshot = await getDocs(terminalsCollection);
        if (terminalsSnapshot.empty) {
            console.log("Seeding terminals...");
            for (const terminal of mockTerminals) {
                await addDoc(terminalsCollection, terminal);
            }
        }
    }
}


export default async function DashboardPage() {
  await seedInitialData();

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <PunchClock />
      <PresentPeopleList />
    </div>
  );
}
