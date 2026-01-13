import { Button } from "@/shared/components/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            404
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 mt-4">
            Página No Encontrada
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            La tienda que buscas no existe o fue movida a otra ubicación.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/landing">
              <Button className="w-full sm:w-auto">
                Ir a Zylos
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full sm:w-auto">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            ¿Eres dueño de una tienda? Verifica:
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 text-left space-y-1">
            <li>• El subdominio esté escrito correctamente</li>
            <li>• Tu cuenta esté activa y configurada</li>
            <li>• No tengas problemas de conexión</li>
          </ul>
        </div>

        <div className="mt-8">
          <Link 
            href="/auth/signup" 
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ¿No tienes tienda? Crear una nueva →
          </Link>
        </div>
      </div>
    </div>
  );
}