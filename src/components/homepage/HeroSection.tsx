
import React from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Automatizează Telefonia.
          <br />
          <span className="text-[#0A5B4C]">Personalizează Vocea.</span>
          <br />
          Crește Afacerea.
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Platforma AI care transformă interacțiunile cu clienții: de la transcrieri inteligente 
          și agenți vocali autonomi, la mesagerie automată pe SMS și Viber.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            onClick={() => navigate('/')}
            className="bg-[#0A5B4C] hover:bg-[#084a3f] text-white px-8 py-4 text-lg"
          >
            Creează Primul Agent Gratuit
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
          >
            Vezi o Demonstrație
          </Button>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
