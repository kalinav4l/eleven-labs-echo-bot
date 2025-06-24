import React from 'react'
import AIAgentInterface from '@/components/AIAgentInterface'
import HamburgerMenu from '@/components/HamburgerMenu'
import { useIsMobile } from '@/hooks/use-mobile'

const Index = () => {
  const isMobile = useIsMobile()
  
  return (
    // MODIFICARE 1: Pe containerul principal
    // Am schimbat 'min-h-screen' în 'h-screen'
    // Am ȘTERS 'items-center' și 'justify-center' pentru a alinia totul în colțul stânga-sus
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex relative overflow-hidden">
      
      {/* Bara din stânga. Rămâne la fel. */}
      <HamburgerMenu />
      
      {/* Efectele de fundal. Rămân la fel. */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* MODIFICARE 2: Containerul conținutului din dreapta */}
      {/* Am înlocuit 'div' cu 'main' pentru semantică. */}
      {/* Am ADĂUGAT 'flex-1' pentru a ocupa spațiul liber. */}
      {/* Am ADĂUGAT 'overflow-y-auto' pentru a activa scroll-ul doar aici. */}
      {/* Am ȘTERS 'w-full' (nu mai e necesar). */}
      {/* Am schimbat padding-ul pentru un aspect mai bun. */}
      <main className={`relative z-10 flex-1 overflow-y-auto ${isMobile ? 'p-2' : 'p-6'}`}>
        <AIAgentInterface />
      </main>

    </div>
  )
}

export default Index