
import React, { useState, useRef } from 'react'
import { useConversation } from '@11labs/react'
import { cn } from '@/lib/utils'
import { InfoOverlay } from './InfoOverlay'
import { FloatingWords } from './FloatingWords'
import { WheelPicker } from './WheelPicker'

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

  const startConversation = async () => {
    try {
      if (isConnectingRef.current) {
        console.log('Already connecting, please wait...')
        return
      }
      
      isConnectingRef.current = true
      console.log('Requesting microphone access...')
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      console.log('Starting session with agent:', selectedAgentId)
      await conversation.startSession({ agentId: selectedAgentId })
    } catch (error) {
      console.error('Error starting conversation:', error)
      isConnectingRef.current = false
    }
  }

  const stopConversation = async () => {
    try {
      console.log('Disconnecting from agent...')
      await conversation.endSession()
    } catch (error) {
      console.error('Error stopping conversation:', error)
    }
  }

  const handleAgentSelect = (agentId: string) => {
    if (!isConnected) {
      setSelectedAgentId(agentId)
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
        {/* Agent Selection Wheel - Show when not connected */}
        {!isConnected && (
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center mb-4">
              <h1 className="text-white text-3xl font-bold mb-2">Alege Agentul</h1>
              <p className="text-gray-400 text-lg">Selectează agentul cu care vrei să vorbești</p>
            </div>
            
            <WheelPicker
              items={availableAgents}
              selectedValue={selectedAgentId}
              onSelectionChange={handleAgentSelect}
              className="w-80"
            />
            
            <button
              onClick={startConversation}
              disabled={isConnectingRef.current}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-full text-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnectingRef.current ? 'Se conectează...' : 'Începe Conversația'}
            </button>
          </div>
        )}

        {/* Connected State - Simple status display */}
        {isConnected && (
          <div className="flex flex-col items-center space-y-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {isSpeaking ? "VORBEȘTE" : "ASCULTĂ"}
              </div>
              <div className="text-lg text-green-300 mb-4">
                Agent: {availableAgents.find(a => a.id === selectedAgentId)?.name}
              </div>
              <button
                onClick={stopConversation}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-200"
              >
                Oprește Conversația
              </button>
            </div>
          </div>
        )}
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
