
import React, { useState, useRef } from 'react'
import { useConversation } from '@11labs/react'
import { cn } from '@/lib/utils'
import { InfoOverlay } from './InfoOverlay'
import { FloatingWords } from './FloatingWords'
import { WheelPicker } from './WheelPicker'
import { ChevronUp, ChevronDown } from 'lucide-react'

const availableAgents = [
  { id: 'agent_01jwryy4w5e8fsta9v9j304zzq', name: 'Borea' },
  { id: 'VfDh7pN17jYNykYNZrJb', name: 'Jesica' },
  { id: 'agent_01jws2mjsjeh398vfnfd6k5hq0', name: 'Ana' }
]

export const VoiceAgent: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState('agent_01jwryy4w5e8fsta9v9j304zzq')
  const [lastMessage, setLastMessage] = useState('')
  const [userMessage, setUserMessage] = useState('')
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false)
  const [showWheelPicker, setShowWheelPicker] = useState(false)
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
      setIsAgentSelectorOpen(false)
    }
  }

  const toggleAgentSelector = () => {
    if (!isConnected && !isSpeaking) {
      setIsAgentSelectorOpen(!isAgentSelectorOpen)
    }
  }

  const openWheelPicker = () => {
    if (!isConnected && !isSpeaking) {
      setShowWheelPicker(true)
    }
  }

  const closeWheelPicker = () => {
    setShowWheelPicker(false)
  }

  const handleWheelAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId)
  }

  const getSelectedAgentName = () => {
    const agent = availableAgents.find(a => a.id === selectedAgentId)
    return agent ? agent.name : 'Unknown'
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
      </div>

      {/* Agent Selector Button - Show only when not connected and not speaking */}
      {!isConnected && !isSpeaking && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          {/* Selected Agent Display */}
          <div className="mb-4 text-center">
            <button
              onClick={openWheelPicker}
              className="px-6 py-3 bg-gray-800 border-2 border-gray-600 rounded-full text-white hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-sm font-medium">{getSelectedAgentName()}</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Wheel Picker Modal */}
      {showWheelPicker && (
        <WheelPicker
          items={availableAgents}
          selectedId={selectedAgentId}
          onSelect={handleWheelAgentSelect}
          onClose={closeWheelPicker}
        />
      )}

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
