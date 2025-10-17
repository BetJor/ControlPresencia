"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = AppLayout;
const app_sidebar_1 = require("@/components/shared/app-sidebar");
const header_1 = require("@/components/shared/header");
exports.metadata = {
    title: 'Panel de Clockwork',
    description: 'Seguimiento de Asistencia en Tiempo Real',
};
function AppLayout({ children, }) {
    return (<div className="flex min-h-screen w-full flex-col bg-muted/40">
      <app_sidebar_1.default />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header_1.default />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>);
}
//# sourceMappingURL=layout.js.map