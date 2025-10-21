'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Clock } from "lucide-react";
import Image from "next/image";
import { useAuth, useUser, initiateGoogleSignIn } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Google Icon SVG component
const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <title>Google</title>
    <path
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.58 2.6-5.82 2.6-4.96 0-9-3.96-9-9s4.04-9 9-9c2.86 0 4.64 1.25 5.74 2.25l2.43-2.33C18.4 2.02 15.65 1 12.48 1 5.8 1 1 5.8 1 12s4.8 11 11.48 11c3.54 0 6.3-1.2 8.35-3.35 2.1-2.1 2.8-5.05 2.8-7.95v-1.2H12.48z"
      fill="currentColor"
    />
  </svg>
);


export default function LoginPage() {
  const loginBg = PlaceHolderImages.find(p => p.id === 'login-background');
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // If we are done loading and the user is logged in, redirect to the dashboard.
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    if(auth) {
      initiateGoogleSignIn(auth);
    }
  };
  
  // Show a loading state while checking for user or during login process
  if (isUserLoading || isLoggingIn || user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-muted-foreground">{isLoggingIn ? 'Iniciando sesión...' : 'Cargando...'}</p>
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
              Inicia sessió amb el teu compte de Google per accedir.
            </p>
          </div>
          <div className="grid gap-4">
            <Button onClick={handleGoogleLogin} className="w-full" variant="outline" disabled={isLoggingIn}>
              <GoogleIcon />
              Entra amb Google
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
