"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Input } from "@/shared/components/Input";
import Link from "next/link";

export default function Signup() {
  const [storeData, setStoreData] = useState({
    storeName: "",
    subdomain: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Debug log for state changes
  useEffect(() => {
    console.log('StoreData updated:', storeData);
  }, [storeData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    console.log('Input change:', { name, value });
    
    if (name === "storeName") {
      const subdomain = value.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '');
      console.log('StoreName change:', { value, subdomain });
      setStoreData(prev => ({
        ...prev,
        [name]: value,
        subdomain: subdomain
      }));
    } else if (name === "subdomain") {
      setStoreData(prev => ({
        ...prev,
        [name]: value.toLowerCase().replace(/[^a-z0-9]/g, '')
      }));
    } else {
      setStoreData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (storeData.password !== storeData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (storeData.subdomain.length < 3) {
      setError("El subdominio debe tener al menos 3 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      // Call API to create tenant and user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeName: storeData.storeName,
          subdomain: storeData.subdomain,
          ownerName: storeData.ownerName,
          email: storeData.email,
          password: storeData.password
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Error al crear la tienda");
        return;
      }

      // Store auth token and user data in localStorage
      if (data.data.auth) {
        localStorage.setItem('auth_token', data.data.auth.token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
        localStorage.setItem('tenant_data', JSON.stringify(data.data.tenant));
      }

      // Redirect to dashboard with tenant subdomain
      const tenantUrl = `/${storeData.subdomain}/dashboard`;
      router.push(tenantUrl);

    } catch (err) {
      setError("Error al crear la tienda. Por favor intente nuevamente.");
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">Zylos</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Crear Nueva Tienda
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configura tu negocio en minutos y empieza a vender hoy mismo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Store Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nombre de la Tienda *
              </label>
              <input
                id="storeName"
                name="storeName"
                type="text"
                value={storeData.storeName}
                onChange={handleInputChange}
                placeholder="Mi Tienda S.A."
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Subdominio *
              </label>
              <div className="flex">
                <input
                  id="subdomain"
                  name="subdomain"
                  type="text"
                  value={storeData.subdomain}
                  onChange={handleInputChange}
                  placeholder="mitienda"
                  required
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="inline-flex items-center px-3 border border-l-0 border-gray-300 bg-gray-50 rounded-r-md">
                  <span className="text-sm text-gray-600">.zylos.com</span>
                </div>
              </div>
              {storeData.subdomain && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Tu tienda estará en: <strong>{storeData.subdomain}.zylos.com</strong>
                </p>
              )}
            </div>
          </div>

          {/* Owner Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="ownerName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Nombre del Administrador *
              </label>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                value={storeData.ownerName}
                onChange={handleInputChange}
                placeholder="Juan Pérez"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Correo Electrónico *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={storeData.email}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Contraseña *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={storeData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirmar Contraseña *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={storeData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full text-lg py-3" 
            disabled={isLoading}
          >
            {isLoading ? "Creando tienda..." : "Crear Tienda Gratis"}
          </Button>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Al crear tu tienda, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <Link 
              href="/auth/login" 
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>

        {/* Features reminder */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">✨ Incluye:</h3>
          <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
            <li>• Gestión completa de inventario</li>
            <li>• Sistema de ventas POS</li>
            <li>• Control financiero y reportes</li>
            <li>• Soporte multi-usuario con roles</li>
            <li>• Acceso vía subdominio propio</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}