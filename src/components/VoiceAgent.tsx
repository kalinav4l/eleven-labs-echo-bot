
import React, { useState } from 'react'
import { useConversation } from '@11labs/react'
import { cn } from '@/lib/utils'
import { InfoOverlay } from './InfoOverlay'

export const VoiceAgent: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [agentId] = useState('fp62KWgF1zlxF7sQiHaw')
  const [lastMessage, setLastMessage] = useState('')
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to voice agent')
      setIsConnected(true)
    },
    onDisconnect: () => {
      console.log('Disconnected from voice agent')
      setIsConnected(false)
      setLastMessage('')
    },
    onError: (error) => {
      console.error('Voice agent error:', error)
    },
    onMessage: (message) => {
      console.log('Message received:', message)
      if (message.message && message.source === 'ai') {
        setLastMessage(message.message)
      }
    }
  })

  const { isSpeaking } = conversation

  const handleClick = async () => {
    try {
      if (isConnected) {
        await conversation.endSession()
      } else {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        await conversation.startSession({ agentId })
      }
    } catch (error) {
      console.error('Error with conversation:', error)
    }
  }

  return (
    <>
      <div 
        className="relative cursor-pointer select-none"
        onClick={handleClick}
      >
        {/* Outer ring */}
        <div 
          className={cn(
            "w-48 h-48 rounded-full border-4 transition-all duration-500 relative flex items-center justify-center",
            isConnected ? "border-green-400" : "border-gray-600"
          )}
          style={{
            background: 'radial-gradient(circle, rgba(20,20,20,0.8) 0%, rgba(0,0,0,0.9) 100%)',
            boxShadow: isConnected 
              ? '0 0 40px rgba(34, 197, 94, 0.3), inset 0 0 30px rgba(0,0,0,0.8)' 
              : '0 0 20px rgba(75, 85, 99, 0.2), inset 0 0 30px rgba(0,0,0,0.8)'
          }}
        >
          {/* Status text */}
          <div className="text-center">
            <div className={cn(
              "text-2xl font-bold mb-1",
              isConnected ? "text-green-400" : "text-gray-400"
            )}>
              {isConnected ? (isSpeaking ? "SPEAKING" : "LISTENING") : "OFFLINE"}
            </div>
            <div className={cn(
              "text-xs opacity-70",
              isConnected ? "text-green-300" : "text-gray-500"
            )}>
              {isConnected ? "Click to disconnect" : "Click to connect"}
            </div>
          </div>

          {/* Animated rings when speaking */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75" />
              <div className="absolute inset-2 rounded-full border-2 border-green-300 animate-ping opacity-50" style={{ animationDelay: '0.3s' }} />
            </>
          )}
        </div>
      </div>

      {/* Info Overlay */}
      <InfoOverlay 
        message={lastMessage} 
        isVisible={isConnected && isSpeaking} 
      />
    </>
  )
}
