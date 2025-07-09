'use client'

import { Star, Quote } from 'lucide-react'

const Testimonials = () => {
  const testimonials = [
    {
      name: "Carlos Mendoza",
      role: "Propietario de Hacienda La Esperanza",
      company: "Sector Agropecuario",
      testimonial: "Fridoom transformó completamente la gestión de nuestra hacienda. Ahora tenemos control total sobre nuestras finanzas y podemos tomar decisiones más informadas. La facilidad de uso es increíble.",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      name: "María Elena Rodríguez",
      role: "Directora Financiera",
      company: "TechSolutions SAS",
      testimonial: "Desde que implementamos Fridoom, nuestros reportes financieros son más precisos y rápidos. El control de inventarios nos ha ayudado a reducir costos significativamente en nuestra empresa de tecnología.",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      name: "José Antonio Vega",
      role: "Gerente General",
      company: "Manufacturas del Norte",
      testimonial: "La gestión de créditos nunca había sido tan sencilla. Fridoom nos permite mantener un control exhaustivo de nuestros préstamos y planificar mejor nuestras inversiones industriales.",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      name: "Ana Patricia Sánchez",
      role: "Administradora",
      company: "Servicios Empresariales Pro",
      testimonial: "El soporte técnico es excepcional. Siempre están dispuestos a ayudarnos y entienden perfectamente las necesidades de diferentes tipos de empresas, no solo del sector agropecuario.",
      rating: 5,
      image: "/api/placeholder/60/60"
    }
  ]

  const renderStars = (rating: number) => {
    return Array(rating).fill(0).map((_, index) => (
      <Star key={index} className="w-4 h-4 text-yellow-400 fill-current" />
    ))
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Lo que dicen nuestros <span className="text-green-600">clientes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Testimonios reales de empresarios de diversos sectores que han transformado sus negocios con Fridoom
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 relative hover:shadow-lg transition-shadow">
              <div className="absolute top-4 right-4 text-green-200">
                <Quote className="w-8 h-8" />
              </div>
              
              <div className="flex items-center gap-1 mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              <blockquote className="text-gray-700 text-lg mb-6 leading-relaxed">
                &quot;{testimonial.testimonial}&quot;
              </blockquote>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-lg">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm text-green-600">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 lg:p-12">
          <div className="text-center text-white mb-8">
            <h3 className="text-3xl font-bold mb-4">Resultados que hablan por sí solos</h3>
            <p className="text-lg text-green-100">
              Nuestros clientes han logrado mejoras significativas en sus negocios
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">40%</div>
              <div className="text-green-100">Reducción en costos operativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">60%</div>
              <div className="text-green-100">Mejora en tiempo de reportes</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-green-100">Satisfacción del cliente</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
