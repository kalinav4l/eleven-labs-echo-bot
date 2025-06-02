
import React, { useState, useEffect } from 'react'
import { VoiceAgent } from '@/components/VoiceAgent'

const Index = () => {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    setIsActive(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_70%)]" />
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 font-mono">
            JARVIS
          </h1>
          <p className="text-cyan-300/80 text-xl font-mono">
            Just A Rather Very Intelligent System
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-400" />
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-400" />
          </div>
          <p className="text-cyan-400/60 text-sm font-mono mt-4">
            CONVERSATIONAL AI | INTERFAȚĂ VOCALĂ DIRECTĂ
          </p>
        </div>

        {/* Voice Agent Interface */}
        <VoiceAgent />

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-cyan-400/60 text-sm font-mono">
            STARK INDUSTRIES © 2024 | CONVERSAȚIE VOCALĂ ACTIVĂ
          </p>
        </div>
      </div>
    </div>
  )
}

export default Index
