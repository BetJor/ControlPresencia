'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Clock } from "lucide-react";
import Image from "next/image";
import { useAuth, useUser, initiateAnonymousSignIn } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const loginBg = PlaceHolderImages.find(p => p.id === 'login-background');
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // If the user is logged in, redirect to the dashboard.
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleAnonymousLogin = () => {
    setIsLoggingIn(true);
    initiateAnonymousSignIn(auth);
  };
  
  // Show a loading state while checking for user or during login process
  if (isUserLoading || isLoggingIn || user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-muted-foreground">Cargando...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-headline">Clockwork</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Pulsa el botón para acceder a la aplicación.
            </p>
          </div>
          <div className="grid gap-4">
            <Button onClick={handleAnonymousLogin} className="w-full">
              Acceder como invitado
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {loginBg && (
          <Image
            src={loginBg.imageUrl}
            alt={loginBg.description}
            data-ai-hint={loginBg.imageHint}
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
      </div>
    </div>
  );
}
