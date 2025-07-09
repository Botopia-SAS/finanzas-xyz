import React from 'react'
import {
  Navbar,
  Hero,
  AboutUs,
  Products,
  Testimonials,
  Blog,
  Contact,
  Footer
} from '@/components/landing'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <AboutUs />
      <Products />
      <Testimonials />
      <Blog />
      <Contact />
      <Footer />
    </div>
  )
}

export default HomePage