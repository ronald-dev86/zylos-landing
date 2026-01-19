// Componente para gestión de cookies de signup
"use client";

import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { getSignupCookie, setSignupCookieClient, clearSignupCookie, type SignupCookieData } from "@/shared/utils/signupCookie";
import { getBaseDomain } from "@/shared/utils/domainConfig";

export default function CookieManager() {
  const [cookieData, setCookieData] = useState<SignupCookieData | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Leer cookies al montar
  useState(() => {
    const data = getSignupCookie();
    setCookieData(data);
  });

  const handleSetCookie = () => {
    const exampleData: SignupCookieData = {
      user: {
        id: "demo-user-id",
        email: "demo@ejemplo.com",
        name: "Usuario Demo",
        role: "admin"
      },
      tenant: {
        id: "demo-tenant-id",
        name: "Tienda Demo",
        subdomain: "demo"
      },
      redirectUrl: `https://demo.${getBaseDomain()}/login`
    };

    setSignupCookieClient(exampleData);
    setCookieData(exampleData);
    setShowForm(false);
  };

  const handleClearCookie = () => {
    clearSignupCookie();
    setCookieData(null);
    setShowForm(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setShowForm(!showForm)}
        size="sm"
        variant="outline"
        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
      >
        🍪 Cookies
      </Button>

      {showForm && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Gestión de Cookies</h3>
            
            {/* Estado Actual */}
            <div className="text-sm">
              <p className="font-medium text-slate-700 dark:text-slate-300">Estado:</p>
              {cookieData ? (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300">
                  <p>✅ Cookie encontrada</p>
                  <p className="text-xs mt-1">Usuario: {cookieData.user.email}</p>
                  <p className="text-xs">Tenant: {cookieData.tenant.name}</p>
                </div>
              ) : (
                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300">
                  <p>❌ Sin cookies de signup</p>
                </div>
              )}
            </div>

            {/* Botones de Acción */}
            <div className="space-y-2">
              {!cookieData && (
                <Button
                  onClick={handleSetCookie}
                  size="sm"
                  className="w-full"
                >
                  🧪 Establecer Cookie Demo
                </Button>
              )}
              
              {cookieData && (
                <Button
                  onClick={handleClearCookie}
                  size="sm"
                  variant="destructive"
                  className="w-full"
                >
                  🗑️ Limpiar Cookie
                </Button>
              )}
            </div>

            {/* Información */}
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
              <p><strong>Uso:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Establecer cookie para simular signup exitoso</li>
                <li>Ir a /auth/signup/success para ver los datos</li>
                <li>Limpiar cookie para resetear el estado</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}