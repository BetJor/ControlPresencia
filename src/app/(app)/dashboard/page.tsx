import PresentPeopleList from "@/components/dashboard/present-people-list";
import PunchClock from "@/components/dashboard/punch-clock";

export default function DashboardPage() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <PunchClock />
      </div>
      <PresentPeopleList />
    </div>
  );
}
