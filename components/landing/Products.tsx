'use client'

import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Package, 
  CreditCard, 
  Users, 
  TrendingUp, 
  Shield,
  Smartphone,
  Cloud,
  ArrowRight
} from 'lucide-react'

const Products = () => {
  const products = [
    {
      title: "Gestión por WhatsApp",
      description: "Controla todas tus finanzas desde WhatsApp con audios, fotos y comandos simples",
      icon: <BarChart3 className="w-8 h-8" />,
      features: [
        "Registra ventas con mensajes de audio",
        "Carga gastos con fotos de facturas",
        "Recibe reportes automáticos",
        "Comandos simples y naturales"
      ],
      color: "green"
    },
    {
      title: "Reconocimiento Inteligente",
      description: "IA que procesa tus audios y fotos para extraer información financiera automáticamente",
      icon: <Package className="w-8 h-8" />,
      features: [
        "Procesamiento de audio a texto",
        "Extracción de datos de facturas",
        "Categorización automática",
        "Validación de información"
      ],
      color: "blue"
    },
    {
      title: "Reportes Automáticos",
      description: "Recibe reportes financieros detallados directamente en tu WhatsApp",
      icon: <CreditCard className="w-8 h-8" />,
      features: [
        "Reportes diarios/semanales/mensuales",
        "Gráficos y estadísticas",
        "Alertas personalizadas",
        "Exportación de datos"
      ],
      color: "purple"
    },
    {
      title: "Integración Total",
      description: "Conecta con tus sistemas existentes y mantén todo sincronizado",
      icon: <Users className="w-8 h-8" />,
      features: [
        "Sincronización en tiempo real",
        "Acceso web complementario",
        "Backup automático",
        "API para integraciones"
      ],
      color: "orange"
    }
  ]

  const advantages = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Solo WhatsApp",
      description: "No necesitas descargar apps adicionales, todo desde WhatsApp"
    },
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Procesamiento IA",
      description: "Inteligencia artificial que entiende tus audios y fotos"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Seguridad Total",
      description: "Encriptación end-to-end y respaldos automáticos"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Crecimiento Simple",
      description: "Escala tu negocio sin complicaciones tecnológicas"
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: "bg-green-50 border-green-200 text-green-600",
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      orange: "bg-orange-50 border-orange-200 text-orange-600"
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.green
  }

  return (
    <section id="productos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Nuestros <span className="text-green-600">Productos</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Soluciones completas y especializadas para la gestión integral de empresas en todos los sectores
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {products.map((product, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${getColorClasses(product.color)}`}>
                {product.icon}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.title}</h3>
              <p className="text-gray-600 mb-6">{product.description}</p>
              
              <ul className="space-y-3 mb-6">
                {product.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button variant="outline" className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50">
                Conocer más
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>

        {/* Advantages */}
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir Fridoom?</h3>
            <p className="text-gray-600 text-lg">Ventajas que nos hacen únicos en el mercado</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-green-600">
                    {advantage.icon}
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{advantage.title}</h4>
                <p className="text-gray-600 text-sm">{advantage.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">¿Listo para manejar tus finanzas desde WhatsApp?</h3>
            <p className="text-lg mb-8 text-green-100">
              Únete a miles de empresas que ya registran sus ventas y gastos de la forma más simple
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium text-lg">
                Empezar gratis
              </Button>
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-full font-medium text-lg">
                Agendar demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Products
