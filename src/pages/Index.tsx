
import React from 'react'
import { VoiceAgent } from '@/components/VoiceAgent'
import HamburgerMenu from '@/components/HamburgerMenu'

const Index = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative">
      <HamburgerMenu />
      <VoiceAgent />
      
      {/* ElevenLabs Conversational AI Widget */}
      <elevenlabs-convai agent-id="agent_01jwtnqwkteha801e4e1kyr8yz"></elevenlabs-convai>
    </div>
  )
}

export default Index
