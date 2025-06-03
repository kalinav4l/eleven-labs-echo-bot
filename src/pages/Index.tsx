
import React from 'react'
import AIAgentInterface from '@/components/AIAgentInterface'
import HamburgerMenu from '@/components/HamburgerMenu'

const Index = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <HamburgerMenu />
      
      <div className="relative z-10 w-full">
        <AIAgentInterface />
      </div>
    </div>
  )
}

export default Index
