'use client';

import Link from 'next/link';
import {
  Home,
  Users,
  Settings,
  Clock,
  PanelLeft,
  Contact,
  Sheet as SheetIcon,
} from 'lucide-react';
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
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';


export default function Header() {
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const userAvatarUrl = user?.photoURL || PlaceHolderImages.find(p => p.id === 'user5')?.imageUrl;

    const handleSignOut = () => {
        if (auth) {
            signOut(auth).then(() => {
                router.push('/login');
            });
        }
    };

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
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Clock className="h-6 w-6 text-primary" />
              <span className="font-headline text-xl">Control de Presència</span>
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
            <Link href="/appsheet" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <SheetIcon className="h-5 w-5" />
              AppSheet
            </Link>
            <Link href="#" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
              Ajustes
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden items-center gap-2 text-lg font-semibold md:flex">
             <Clock className="h-6 w-6 text-primary" />
             <span className="font-headline text-xl">Control de Presència</span>
          </Link>
      </div>

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
            {userAvatarUrl && (
                 <Image
                    src={userAvatarUrl}
                    width={36}
                    height={36}
                    alt={user?.displayName || 'Avatar'}
                    className="overflow-hidden rounded-full"
                />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.displayName || user?.email || 'Mi Cuenta'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Ajustes</DropdownMenuItem>
          <DropdownMenuItem>Soporte</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
