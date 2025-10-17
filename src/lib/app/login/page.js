"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LoginPage;
const button_1 = require("@/components/ui/button");
const placeholder_images_1 = require("@/lib/placeholder-images");
const lucide_react_1 = require("lucide-react");
const image_1 = require("next/image");
const firebase_1 = require("@/firebase");
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const lucide_react_2 = require("lucide-react");
function LoginPage() {
    const loginBg = placeholder_images_1.PlaceHolderImages.find(p => p.id === 'login-background');
    const auth = (0, firebase_1.useAuth)();
    const { user, isUserLoading } = (0, firebase_1.useUser)();
    const router = (0, navigation_1.useRouter)();
    const [isLoggingIn, setIsLoggingIn] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        // If we are done loading and the user is logged in, redirect to the dashboard.
        if (!isUserLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);
    const handleAnonymousLogin = () => {
        setIsLoggingIn(true);
        if (auth) {
            (0, firebase_1.initiateAnonymousSignIn)(auth);
        }
    };
    // Show a loading state while checking for user or during login process
    if (isUserLoading || isLoggingIn || user) {
        return (<div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <lucide_react_2.Loader2 className="h-12 w-12 text-primary animate-spin"/>
                <p className="text-muted-foreground">{isLoggingIn ? 'Iniciando sesión...' : 'Cargando...'}</p>
            </div>
        </div>);
    }
    return (<div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <lucide_react_1.Clock className="h-8 w-8 text-primary"/>
              <h1 className="text-3xl font-bold font-headline">Clockwork</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Pulsa el botón para acceder a la aplicación.
            </p>
          </div>
          <div className="grid gap-4">
            <button_1.Button onClick={handleAnonymousLogin} className="w-full" disabled={isLoggingIn}>
              Acceder como invitado
            </button_1.Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {loginBg && (<image_1.default src={loginBg.imageUrl} alt={loginBg.description} data-ai-hint={loginBg.imageHint} width="1920" height="1080" className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"/>)}
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map