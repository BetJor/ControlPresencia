'use client';

import { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sheet as SheetIcon } from 'lucide-react';
import { useFirebaseApp } from '@/firebase';

export default function AppSheetPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const app = useFirebaseApp();

  const handleTestFunction = async () => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    try {
      if (!app) {
        throw new Error("Firebase app no està inicialitzada.");
      }
      const functions = getFunctions(app, 'europe-west1');
      const getDadesAppSheet = httpsCallable(functions, 'getDadesAppSheet');
      const response = await getDadesAppSheet();
      setResult(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ha ocorregut un error desconegut.');
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <SheetIcon className="h-6 w-6" />
            Prova de Funció d'AppSheet
        </CardTitle>
        <CardDescription>
          Fes clic al botó per invocar la funció `getDadesAppSheet` i veure el resultat de l'API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleTestFunction} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Provant...
            </>
          ) : (
            'Provar Funció'
          )}
        </Button>
        
        {error && (
            <div>
                <h3 className="font-semibold text-destructive">Error:</h3>
                <pre className="mt-2 w-full rounded-md bg-muted p-4 text-sm text-destructive">
                    {error}
                </pre>
            </div>
        )}

        {result && (
          <div>
            <h3 className="font-semibold">Resultat:</h3>
            <pre className="mt-2 w-full rounded-md bg-muted p-4 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
