"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Header;
const link_1 = require("next/link");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const sheet_1 = require("@/components/ui/sheet");
const image_1 = require("next/image");
const placeholder_images_1 = require("@/lib/placeholder-images");
function Header() {
    const userAvatar = placeholder_images_1.PlaceHolderImages.find(p => p.id === 'user1');
    return (<header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <sheet_1.Sheet>
        <sheet_1.SheetTrigger asChild>
          <button_1.Button size="icon" variant="outline" className="sm:hidden">
            <lucide_react_1.PanelLeft className="h-5 w-5"/>
            <span className="sr-only">Abrir Menú</span>
          </button_1.Button>
        </sheet_1.SheetTrigger>
        <sheet_1.SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
             <link_1.default href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
              <lucide_react_1.Clock className="h-6 w-6 text-primary"/>
              <span className="font-headline text-xl">Clockwork</span>
            </link_1.default>
            <link_1.default href="/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <lucide_react_1.Home className="h-5 w-5"/>
              Panel
            </link_1.default>
            <link_1.default href="/employees" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <lucide_react_1.Users className="h-5 w-5"/>
              Empleados
            </link_1.default>
            <link_1.default href="/visitors" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <lucide_react_1.Contact className="h-5 w-5"/>
              Visitas
            </link_1.default>
            <link_1.default href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <lucide_react_1.Settings className="h-5 w-5"/>
              Ajustes
            </link_1.default>
          </nav>
        </sheet_1.SheetContent>
      </sheet_1.Sheet>
      
      <div className="flex items-center gap-2">
          <link_1.default href="/dashboard" className="hidden items-center gap-2 text-lg font-semibold md:flex">
             <lucide_react_1.Clock className="h-6 w-6 text-primary"/>
             <span className="font-headline text-xl">Clockwork</span>
          </link_1.default>
      </div>

      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Search could go here if needed */}
      </div>
      <dropdown_menu_1.DropdownMenu>
        <dropdown_menu_1.DropdownMenuTrigger asChild>
          <button_1.Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            {userAvatar && (<image_1.default src={userAvatar.imageUrl} width={36} height={36} alt="Avatar" data-ai-hint={userAvatar.imageHint} className="overflow-hidden rounded-full"/>)}
          </button_1.Button>
        </dropdown_menu_1.DropdownMenuTrigger>
        <dropdown_menu_1.DropdownMenuContent align="end">
          <dropdown_menu_1.DropdownMenuLabel>Mi Cuenta</dropdown_menu_1.DropdownMenuLabel>
          <dropdown_menu_1.DropdownMenuSeparator />
          <dropdown_menu_1.DropdownMenuItem>Ajustes</dropdown_menu_1.DropdownMenuItem>
          <dropdown_menu_1.DropdownMenuItem>Soporte</dropdown_menu_1.DropdownMenuItem>
          <dropdown_menu_1.DropdownMenuSeparator />
          <dropdown_menu_1.DropdownMenuItem asChild>
            <link_1.default href="/login">Cerrar sesión</link_1.default>
          </dropdown_menu_1.DropdownMenuItem>
        </dropdown_menu_1.DropdownMenuContent>
      </dropdown_menu_1.DropdownMenu>
    </header>);
}
//# sourceMappingURL=header.js.map