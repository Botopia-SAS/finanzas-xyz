'use client'

import { CheckCircle, Target, Heart, Award } from 'lucide-react'

const AboutUs = () => {
  const features = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Soluciones Multisector",
      description: "Diseñado para empresas de todos los sectores: agropecuario, tecnología, manufactura, servicios y más."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Soluciones Integrales",
      description: "Desde el control de inventarios hasta la gestión financiera, todo en una sola plataforma."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Compromiso Empresarial",
      description: "Apoyamos el crecimiento de empresas en todos los sectores con tecnología accesible y confiable."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Calidad Garantizada",
      description: "Respaldados por miles de empresas que confían en nosotros para gestionar sus finanzas."
    }
  ]

  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Sobre <span className="text-green-600">Fridoom</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Revolucionamos la gestión financiera permitiendo que manejes todo desde WhatsApp. 
            La forma más simple y natural de controlar las finanzas de tu empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left side - Content */}
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Finanzas tan fáciles como enviar un WhatsApp
            </h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              ¿Te imaginas registrar tus ventas enviando un audio a WhatsApp? ¿O cargar gastos 
              simplemente enviando una foto de la factura? Con Fridoom es posible. Hemos 
              transformado la gestión financiera en algo tan simple como chatear.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Control por Audios</h4>
                  <p className="text-gray-600">Registra ventas y transacciones enviando audios por WhatsApp</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Facturas por Foto</h4>
                  <p className="text-gray-600">Carga gastos instantáneamente enviando fotos de facturas</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Reportes Automáticos</h4>
                  <p className="text-gray-600">Recibe reportes financieros automáticamente en tu WhatsApp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Image/Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">5,000+</div>
                  <div className="text-gray-700 font-medium">Empresas</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">$50M+</div>
                  <div className="text-gray-700 font-medium">Gestionados</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">30+</div>
                  <div className="text-gray-700 font-medium">Años</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-600 mb-2">99%</div>
                  <div className="text-gray-700 font-medium">Satisfacción</div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <div className="text-green-600">
                  {feature.icon}
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutUs
