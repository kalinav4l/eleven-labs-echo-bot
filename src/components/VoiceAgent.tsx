
import React, { useState, useEffect } from 'react'
import { useConversation } from '@11labs/react'
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const VoiceAgent: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [agentId] = useState('fp62KWgF1zlxF7sQiHaw') // Folosesc agent ID-ul din exemplu
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to voice agent')
      setIsConnected(true)
    },
    onDisconnect: () => {
      console.log('Disconnected from voice agent')
      setIsConnected(false)
    },
    onError: (error) => {
      console.error('Voice agent error:', error)
    }
  })

  const { status, isSpeaking } = conversation

  const handleStartConversation = async () => {
    try {
      // Cerere permisiune microfon
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Start conversație cu agent ID
      await conversation.startSession({ agentId })
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  const handleEndConversation = async () => {
    try {
      await conversation.endSession()
    } catch (error) {
      console.error('Error ending conversation:', error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Status indicator */}
      <div className="text-center">
        <div className={cn(
          "w-32 h-32 rounded-full border-4 transition-all duration-500 relative",
          isConnected ? "border-green-500 shadow-green-500/50" : "border-cyan-500 shadow-cyan-500/50",
          isSpeaking && "animate-pulse"
        )}
        style={{
          boxShadow: isConnected 
            ? '0 0 50px rgba(34, 197, 94, 0.3)' 
            : '0 0 50px rgba(34, 211, 238, 0.3)'
        }}>
          {/* Center indicator */}
          <div className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "w-16 h-16 rounded-full transition-all duration-300",
            isConnected ? "bg-green-500" : "bg-cyan-500",
            isSpeaking && "animate-ping"
          )}>
            <div className="absolute inset-4 bg-white rounded-full" />
          </div>
          
          {/* Animated rings when speaking */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-green-300 animate-ping" style={{ animationDelay: '0.2s' }} />
            </>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-cyan-400 font-mono text-lg">
            {isConnected ? 'CONECTAT LA JARVIS' : 'JARVIS OFFLINE'}
          </p>
          <p className="text-cyan-400/60 text-sm font-mono mt-2">
            {isConnected 
              ? (isSpeaking ? 'JARVIS VORBEȘTE...' : 'VORBEȘTE ACUM, SIR')
              : 'APĂSAȚI PENTRU A CONECTA'
            }
          </p>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex gap-4">
        {!isConnected ? (
          <Button
            onClick={handleStartConversation}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-mono border border-green-500"
            style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
          >
            <Phone className="w-6 h-6 mr-2" />
            CONECTEAZĂ LA JARVIS
          </Button>
        ) : (
          <Button
            onClick={handleEndConversation}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-mono border border-red-500"
            style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}
          >
            <PhoneOff className="w-6 h-6 mr-2" />
            DECONECTEAZĂ
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center max-w-md">
        <p className="text-cyan-400/70 text-sm font-mono leading-relaxed">
          {!isConnected 
            ? "Conectați-vă pentru a vorbi direct cu JARVIS. Asigurați-vă că microfonul este activat."
            : "Vorbiți normal. JARVIS vă ascultă și va răspunde automat."
          }
        </p>
      </div>
    </div>
  )
}
