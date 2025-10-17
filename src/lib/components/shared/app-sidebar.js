"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppSidebar;
const link_1 = require("next/link");
const lucide_react_1 = require("lucide-react");
const tooltip_1 = require("@/components/ui/tooltip");
const navigation_1 = require("next/navigation");
const utils_1 = require("@/lib/utils");
const navItems = [
    { href: '/dashboard', icon: lucide_react_1.Home, label: 'Panel' },
    { href: '/employees', icon: lucide_react_1.Users, label: 'Empleados' },
    { href: '/visitors', icon: lucide_react_1.Contact, label: 'Visitas' },
];
function AppSidebar() {
    const pathname = (0, navigation_1.usePathname)();
    return (<aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <tooltip_1.TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          {navItems.map((item) => (<tooltip_1.Tooltip key={item.href}>
              <tooltip_1.TooltipTrigger asChild>
                <link_1.default href={item.href} className={(0, utils_1.cn)('flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8', pathname.startsWith(item.href)
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground')}>
                  <item.icon className="h-5 w-5"/>
                  <span className="sr-only">{item.label}</span>
                </link_1.default>
              </tooltip_1.TooltipTrigger>
              <tooltip_1.TooltipContent side="right">{item.label}</tooltip_1.TooltipContent>
            </tooltip_1.Tooltip>))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <tooltip_1.Tooltip>
            <tooltip_1.TooltipTrigger asChild>
              <link_1.default href="#" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8">
                <lucide_react_1.Settings className="h-5 w-5"/>
                <span className="sr-only">Ajustes</span>
              </link_1.default>
            </tooltip_1.TooltipTrigger>
            <tooltip_1.TooltipContent side="right">Ajustes</tooltip_1.TooltipContent>
          </tooltip_1.Tooltip>
        </nav>
      </tooltip_1.TooltipProvider>
    </aside>);
}
//# sourceMappingURL=app-sidebar.js.map