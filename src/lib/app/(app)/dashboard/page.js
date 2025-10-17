"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const present_people_list_1 = require("@/components/dashboard/present-people-list");
const punch_clock_1 = require("@/components/dashboard/punch-clock");
function DashboardPage() {
    return (<div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <punch_clock_1.default />
      <present_people_list_1.default />
    </div>);
}
//# sourceMappingURL=page.js.map