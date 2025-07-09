'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Shield, Users } from 'lucide-react'

const Hero = () => {
  return (
    <section id="inicio" className="relative min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 pt-24">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Cg fill-rule=%22evenodd%22%3E%3Cg fill=%22%2316a34a%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center min-h-screen py-20">
          {/* Left side - Content */}
          <div className="lg:w-1/2 lg:pr-12">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Gestiona las finanzas de tu empresa
                <span className="text-green-600"> desde WhatsApp</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                La forma más fácil de manejar tus finanzas. Envía audios para registrar ingresos, 
                fotos de facturas para gastos, y controla todo desde tu WhatsApp.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Link href="/auth/login">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium text-lg transition-colors flex items-center gap-2">
                    Empezar ahora
                    <ArrowRight size={20} />
                  </Button>
                </Link>
                <Button variant="outline" className="px-8 py-3 rounded-full font-medium text-lg border-2 border-green-600 text-green-600 hover:bg-green-50">
                  Ver demo
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">5,000+</div>
                    <div className="text-sm text-gray-600">Empresas Activas</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">$50M+</div>
                    <div className="text-sm text-gray-600">En Transacciones</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">30+</div>
                    <div className="text-sm text-gray-600">Años de Experiencia</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <div className="relative">
              {/* Main dashboard mockup */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-white text-2xl">💬</div>
                    <h3 className="text-white font-semibold text-lg">Control desde WhatsApp</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-white/80 text-sm">Ingresos</div>
                      <div className="text-white font-bold text-xl">$45,230</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-white/80 text-sm">Gastos</div>
                      <div className="text-white font-bold text-xl">$32,180</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="text-green-600 text-sm">🎤</div>
                      </div>
                      <div>
                        <div className="font-medium">Audio: &quot;Vendí 200 litros&quot;</div>
                        <div className="text-sm text-gray-500">Vía WhatsApp - Hoy</div>
                      </div>
                    </div>
                    <div className="text-green-600 font-semibold">+$2,400</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="text-blue-600 text-sm">📷</div>
                      </div>
                      <div>
                        <div className="font-medium">Foto: Factura alimento</div>
                        <div className="text-sm text-gray-500">Vía WhatsApp - Ayer</div>
                      </div>
                    </div>
                    <div className="text-red-600 font-semibold">-$1,200</div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <div className="text-white font-bold text-sm">+25%</div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
