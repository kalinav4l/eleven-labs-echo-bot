
import React from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/30 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-[#0A5B4C] to-teal-600 rounded-lg"></div>
          <span className="text-xl font-bold text-gray-900">Kalina AI</span>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-[#0A5B4C] transition-colors">
            Caracteristici
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-[#0A5B4C] transition-colors">
            Prețuri
          </a>
          <a href="#testimonials" className="text-gray-600 hover:text-[#0A5B4C] transition-colors">
            Pentru Cine?
          </a>
          <a href="#contact" className="text-gray-600 hover:text-[#0A5B4C] transition-colors">
            Contact
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/auth')}
            className="text-gray-600 hover:text-[#0A5B4C]"
          >
            Conectare
          </Button>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-[#0A5B4C] hover:bg-[#084a3f] text-white px-6"
          >
            Creează Cont Gratuit
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
