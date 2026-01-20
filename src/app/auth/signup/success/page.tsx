"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import Link from "next/link";
import { getSignupCookie, clearSignupCookie, type SignupCookieData } from "@/shared/utils/signupCookie";
import { Tenant, User } from "@/shared/types/schemas";

interface SignupSuccessData {
  user: User;
  tenant: Tenant;
  redirectUrl: string;
}

function SignupSuccessContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [signupData, setSignupData] = useState<SignupCookieData | null>(null);
  
  // Obtener datos del signup después de montar el componente
  useEffect(() => {
    const data = getSignupCookie();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSignupData(data);
    
  }, []); // Solo ejecutar al montar

  const handleGoToPlatform = () => {
    if (signupData?.redirectUrl) {
      setIsLoading(true);
      // Limpiar cookie
      clearSignupCookie();
      
      console.log('🚀 Redirigiendo al subdominio del tenant:', signupData.redirectUrl);
      
      // Redirigir al subdominio del tenant
      window.location.href = signupData.redirectUrl;
    }
  };

  if (!signupData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Sesión Expirada
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              La sesión de registro ha expirado. Por favor, intenta registrarte nuevamente.
            </p>
            <Link href="/auth/signup">
              <Button className="w-full">
                Volver al Registro
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 dark:from-green-900/20 dark:to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            ¡Tienda Creada Exitosamente!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
            Tu tienda <span className="font-semibold text-blue-600 dark:text-blue-400">"{signupData.tenant.name}"</span> ha sido configurada y lista para usar.
          </p>

          {/* User Information */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Información de tu Cuenta
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Nombre:</span>
                <span className="font-medium text-slate-900 dark:text-white">{signupData.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Email:</span>
                <span className="font-medium text-slate-900 dark:text-white">{signupData.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Rol:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400 capitalize">{signupData.user.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Tienda:</span>
                <span className="font-medium text-slate-900 dark:text-white">{signupData.tenant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Subdominio:</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{signupData.tenant.subdomain}.zylos.com</span>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Importante:</strong> Guarda esta información. Tu tienda está accesible en 
              <span className="font-semibold"> {signupData.tenant.subdomain}.zylos.com</span>
            </p>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleGoToPlatform}
            disabled={isLoading}
            className="w-full text-lg py-4"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Redirigiendo a tu Tienda...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Ir a mi Tienda
              </span>
            )}
          </Button>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Necesitarás hacer login con tu email y contraseña cuando llegues a tu tienda.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function SignupSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-slate-100 dark:from-green-900/20 dark:to-slate-900 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    }>
      <SignupSuccessContent />
    </Suspense>
  );
}