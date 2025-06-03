
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

  const toggleAgentSelector = () => {
    if (!isConnected && !isSpeaking) {
      setIsAgentSelectorOpen(!isAgentSelectorOpen)
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

      {/* Agent Selector - Show only when not connected and not speaking */}
      {!isConnected && !isSpeaking && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          {/* Expandable Agent Selection with iPhone-style wheel */}
          {isAgentSelectorOpen && (
            <div className="mb-4 bg-gray-900/95 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 shadow-2xl">
              <div className="text-center mb-4">
                <h3 className="text-white text-lg font-semibold">Alege Agentul</h3>
              </div>
              <WheelPicker
                items={availableAgents}
                selectedValue={selectedAgentId}
                onSelectionChange={handleAgentSelect}
                className="w-64"
              />
            </div>
          )}
          
          {/* Toggle Button */}
          <div
            onClick={toggleAgentSelector}
            className="w-12 h-12 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-all duration-200"
          >
            {isAgentSelectorOpen ? (
              <ChevronDown className="w-6 h-6 text-gray-300" />
            ) : (
              <ChevronUp className="w-6 h-6 text-gray-300" />
            )}
          </div>
        </div>
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
