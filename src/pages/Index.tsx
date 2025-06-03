
import React from 'react'
import { VoiceAgent } from '@/components/VoiceAgent'
import HamburgerMenu from '@/components/HamburgerMenu'

const Index = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative">
      <HamburgerMenu />
      <VoiceAgent />
    </div>
  )
}

export default Index
