"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Error Inesperado
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Ha ocurrido un error al procesar tu solicitud.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-left">
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={reset}
            className="w-full"
          >
            Intentar Nuevamente
          </Button>
          
          <Link href="/landing">
            <Button variant="outline" className="w-full">
              Ir al Inicio
            </Button>
          </Link>
        </div>

        <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          Si el problema persiste, contacta a soporte@zylos.com
        </div>
      </Card>
    </div>
  );
}