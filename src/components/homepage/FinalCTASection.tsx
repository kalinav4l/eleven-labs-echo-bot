
import React from 'react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const FinalCTASection = () => {
  const navigate = useNavigate()

  return (
    <section className="py-20 bg-gradient-to-r from-[#0A5B4C] to-teal-600 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ești gata să îți transformi afacerea?
        </h2>
        
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Alătură-te miilor de companii care și-au automatizat comunicarea cu clienții folosind Kalina AI
        </p>

        <Button 
          size="lg"
          onClick={() => navigate('/auth')}
          className="bg-white text-[#0A5B4C] hover:bg-gray-100 px-12 py-4 text-lg font-semibold"
        >
          Creează Cont Gratuit Acum
        </Button>
      </div>
    </section>
  )
}

export default FinalCTASection
