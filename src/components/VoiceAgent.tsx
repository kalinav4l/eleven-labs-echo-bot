
import React, { useState, useRef } from 'react'
import { useConversation } from '@11labs/react'
import { cn } from '@/lib/utils'
import { InfoOverlay } from './InfoOverlay'
import { FloatingWords } from './FloatingWords'

const availableAgents = [
  { id: 'agent_01jwryy4w5e8fsta9v9j304zzq', name: 'Asistent Principal' },
  { id: 'VfDh7pN17jYNykYNZrJb', name: 'Asistent Secundar' }
]

export const VoiceAgent: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState('agent_01jwryy4w5e8fsta9v9j304zzq')
  const [lastMessage, setLastMessage] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const isConnectingRef = useRef(false)
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to voice agent:', selectedAgentId)
      setIsConnected(true)
      isConnectingRef.current = false
    },
    onDisconnect: () => {
      console.log('Disconnected from voice agent')
      setIsConnected(false)
      setLastMessage('')
      setUserMessage('')
      isConnectingRef.current = false
    },
    onError: (error) => {
      console.error('Voice agent error:', error)
      isConnectingRef.current = false
    },
    onMessage: (message) => {
      console.log('Message received:', message)
      if (message.message) {
        if (message.source === 'ai') {
          setLastMessage(message.message)
        } else if (message.source === 'user') {
          setUserMessage(message.message)
        }
      }
    }
  })

  const { isSpeaking } = conversation

  const handleClick = async () => {
    try {
      if (isConnected) {
        console.log('Disconnecting from agent...')
        await conversation.endSession()
      } else {
        if (isConnectingRef.current) {
          console.log('Already connecting, please wait...')
          return
        }
        
        isConnectingRef.current = true
        console.log('Requesting microphone access...')
        await navigator.mediaDevices.getUserMedia({ audio: true })
        
        console.log('Starting session with agent:', selectedAgentId)
        await conversation.startSession({ agentId: selectedAgentId })
      }
    } catch (error) {
      console.error('Error with conversation:', error)
      isConnectingRef.current = false
    }
  }

  const handleAgentSelect = (agentId: string) => {
    if (!isConnected) {
      setSelectedAgentId(agentId)
    }
  }

  return (
    <>
      <div className="flex flex-col items-center space-y-8">
        {/* Main Voice Agent Circle */}
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
              {selectedAgentId && (
                <div className="text-xs text-cyan-400 mt-1 font-mono">
                  Agent: {selectedAgentId.substring(0, 8)}...
                </div>
              )}
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

        {/* Agent Selection Section */}
        <div className="bg-gray-800 rounded-lg p-4 w-80">
          <h3 className="text-gray-300 text-sm font-medium mb-3 text-center">Selectează Asistentul</h3>
          <div className="space-y-2">
            {availableAgents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => handleAgentSelect(agent.id)}
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200",
                  selectedAgentId === agent.id 
                    ? "bg-cyan-600 text-white" 
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600",
                  isConnected && "cursor-not-allowed opacity-50"
                )}
              >
                <div className={cn(
                  "w-3 h-3 rounded-full mr-3 transition-colors",
                  selectedAgentId === agent.id ? "bg-white" : "bg-gray-500"
                )} />
                <div className="flex-1">
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-xs opacity-70 font-mono">
                    {agent.id.substring(0, 12)}...
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isConnected && (
            <div className="text-xs text-gray-400 mt-2 text-center">
              Deconectează-te pentru a schimba asistentul
            </div>
          )}
        </div>
      </div>

      {/* Floating Words for User Input */}
      <FloatingWords 
        message={userMessage} 
        isVisible={isConnected && userMessage.length > 0} 
      />

      {/* Info Overlay for AI responses */}
      <InfoOverlay 
        message={lastMessage} 
        isVisible={isConnected && isSpeaking} 
      />
    </>
  )
}
