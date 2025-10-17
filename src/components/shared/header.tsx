import Link from 'next/link';
import {
  Home,
  Users,
  Computer,
  AlertTriangle,
  Settings,
  Clock,
  PanelLeft,
  Contact,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Header() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user1');
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Abrir Menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Clock className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Clockwork</span>
            </Link>
            <Link href="/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Home className="h-5 w-5" />
              Panel
            </Link>
            <Link href="/employees" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Users className="h-5 w-5" />
              Empleados
            </Link>
            <Link href="/visitors" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Contact className="h-5 w-5" />
              Visitas
            </Link>
             <Link href="/incidents" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <AlertTriangle className="h-5 w-5" />
              Incidencias
            </Link>
            <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
              Ajustes
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="#">Panel</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {/* Example breadcrumb extension */}
          {/* <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Recent Punches</BreadcrumbPage>
          </BreadcrumbItem> */}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Search could go here if needed */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            {userAvatar && (
                 <Image
                    src={userAvatar.imageUrl}
                    width={36}
                    height={36}
                    alt="Avatar"
                    data-ai-hint={userAvatar.imageHint}
                    className="overflow-hidden rounded-full"
                />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Ajustes</DropdownMenuItem>
          <DropdownMenuItem>Soporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/login">Cerrar sesión</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
