'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/20">
        <div className="flex justify-between items-center h-16 px-6">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Image 
                src="/LogoFridoomCompanies.svg" 
                alt="Fridoom by companies" 
                width={32}
                height={32}
                className="h-8 w-auto"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('nosotros')}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Nosotros
              </button>
              <button
                onClick={() => scrollToSection('productos')}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Productos
              </button>
              <button
                onClick={() => scrollToSection('blog')}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Blog
              </button>
              <button
                onClick={() => scrollToSection('contacto')}
                className="text-gray-700 hover:text-green-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Contacto
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/auth/login">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-colors">
                Únirme
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden mt-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
          <div className="px-4 pt-4 pb-6 space-y-1">
            <button
              onClick={() => scrollToSection('nosotros')}
              className="block w-full text-left text-gray-700 hover:text-green-600 px-3 py-2 text-base font-medium transition-colors"
            >
              Nosotros
            </button>
            <button
              onClick={() => scrollToSection('productos')}
              className="block w-full text-left text-gray-700 hover:text-green-600 px-3 py-2 text-base font-medium transition-colors"
            >
              Productos
            </button>
            <button
              onClick={() => scrollToSection('blog')}
              className="block w-full text-left text-gray-700 hover:text-green-600 px-3 py-2 text-base font-medium transition-colors"
            >
              Blog
            </button>
            <button
              onClick={() => scrollToSection('contacto')}
              className="block w-full text-left text-gray-700 hover:text-green-600 px-3 py-2 text-base font-medium transition-colors"
            >
              Contacto
            </button>
            <div className="pt-4">
              <Link href="/auth/login">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-colors">
                  Únirme
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
