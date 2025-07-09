'use client'

import { Button } from '@/components/ui/button'

const Blog = () => {
  return (
    <section id="blog" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Nuestro <span className="text-green-600">Blog</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Contenido especializado sobre gestión financiera empresarial desde WhatsApp
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">📱💰</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Próximamente
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Estamos preparando contenido increíble sobre cómo revolucionar la gestión financiera de tu empresa con nuestra plataforma de WhatsApp
            </p>
          </div>

          {/* Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
              <div className="text-3xl mb-3">🎤</div>
              <h4 className="font-semibold text-gray-900 mb-2">Control por Audio</h4>
              <p className="text-sm text-gray-600">
                Cómo registrar ingresos y gastos solo con tu voz
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="text-3xl mb-3">📸</div>
              <h4 className="font-semibold text-gray-900 mb-2">Facturas Inteligentes</h4>
              <p className="text-sm text-gray-600">
                Sube fotos de facturas y automatiza tu contabilidad
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-semibold text-gray-900 mb-2">Reportes Automáticos</h4>
              <p className="text-sm text-gray-600">
                Recibe reportes financieros sin complicaciones
              </p>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">¡Sé el primero en conocer nuestro contenido!</h3>
            <p className="text-lg mb-6 text-green-100">
              Suscríbete y recibe tips exclusivos sobre gestión financiera desde WhatsApp
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium">
                Suscribirme
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Blog
