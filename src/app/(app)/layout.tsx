import type { Metadata } from 'next';
import AppSidebar from '@/components/shared/app-sidebar';
import Header from '@/components/shared/header';

export const metadata: Metadata = {
  title: 'Panel de Control de Presència',
  description: 'Seguimiento de Asistencia en Tiempo Real',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AppSidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
