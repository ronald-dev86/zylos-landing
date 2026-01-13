"use client";

import { useState } from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import Link from "next/link";
import { useAuth } from "@/shared/contexts/AuthContext";

export default function Landing() {
  const { user, isAuthenticated, tenant } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: 'Básico',
      description: 'Perfecto para pequeñas tiendas',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Hasta 3 usuarios',
        '100 productos',
        'Ventas POS básicas',
        'Reportes básicos',
        'Soporte por email'
      ]
    },
    {
      name: 'Negocios',
      description: 'Ideal para empresas en crecimiento',
      monthlyPrice: 29,
      annualPrice: 24,
      popular: true,
      features: [
        'Hasta 15 usuarios',
        'Productos ilimitados',
        'Ventas POS avanzadas',
        'Gestión de proveedores',
        'Control financiero completo',
        'Reportes avanzados',
        'Soporte prioritario'
      ]
    },
    {
      name: 'Premium',
      description: 'Para grandes empresas',
      monthlyPrice: 99,
      annualPrice: 79,
      features: [
        'Usuarios ilimitados',
        'Todo lo de Negocios',
        'Múltiples sucursales',
        'Integraciones API',
        'Analytics avanzado',
        'Backup diario',
        'Soporte 24/7',
        'Manager dedicado'
      ]
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Zylos</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">Precios</a>
              <a href="#features" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">Características</a>
              {isAuthenticated ? (
                <Link href={`https://${tenant?.subdomain}.zylos.com/dashboard`}>
                  <Button>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost">Iniciar Sesión</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button>Crear Tienda</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ERP/POS Multi-tenant
              </span>
              <br />
              para tu Negocio
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Gestiona inventario, ventas y finanzas en un solo lugar. 
              Escalable, seguro y diseñado para crecimiento masivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Comenzar Gratis
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Ver Demo
                </Button>
              </Link>
            </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Todo lo que necesitas para crecer
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Funcionalidades enterprise a un costo accesible
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Multi-tenancy</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Aislamiento total de datos con subdominios dedicados para cada tienda
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Inventario Inteligente</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Trazabilidad completa con movimientos de stock y gestión automatizada
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Control Financiero</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Libro mayor inmutable, gestión de créditos y deudas con reportes en tiempo real
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Seguridad Enterprise</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Row Level Security, RBAC y encriptación de datos end-to-end
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Alto Rendimiento</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Edge computing, caché inteligente y arquitectura serverless
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Escalabilidad Infinita</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Multi-región, auto-scaling y respaldos automáticos
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Planes para cada necesidad
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Elige el plan perfecto para tu negocio y escala cuando lo necesites
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Mensual
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    billingCycle === 'annual'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Anual
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Ahorra 20%
                  </span>
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <Card key={plan.name} className={`p-8 relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Más Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">/mes</span>
                      {billingCycle === 'annual' && plan.monthlyPrice > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                          Ahorrando ${(plan.monthlyPrice - plan.annualPrice) * 12}/año
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full"
                      variant={plan.monthlyPrice === 0 ? "outline" : plan.popular ? "primary" : "outline"}
                    >
                      {plan.monthlyPrice === 0 ? 'Comenzar Gratis' : `Elegir ${plan.name}`}
                    </Button>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Todos los planes incluyen subdominio personalizado y SSL
              </p>
              <div className="flex justify-center space-x-8 text-sm text-slate-500 dark:text-slate-400">
                <span>✅ Cancela cuando quieras</span>
                <span>✅ Actualiza o degrada tu plan</span>
                <span>✅ 14 días de prueba gratuita</span>
              </div>
              {billingCycle === 'annual' && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    💡 Ahorra 20% con planes anuales
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Listo para transformar tu negocio?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Únete a cientos de empresas que ya confían en Zylos
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3 bg-white text-blue-600 hover:bg-blue-50">
                Crear mi Tienda Gratis
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Zylos</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              © 2024 Zylos. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}