
import React, { useState, useRef, useEffect } from 'react'
import { Send, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface JarvisChatProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isLoading: boolean
  isPlaying: boolean
}

export const JarvisChat: React.FC<JarvisChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isPlaying
}) => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput('')
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-md rounded-lg border border-cyan-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 p-4 border-b border-cyan-500/30">
        <div className="flex items-center justify-between">
          <h3 className="text-cyan-400 font-mono text-lg">JARVIS INTERFACE</h3>
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-500" />
            )}
            <div className={cn(
              "w-3 h-3 rounded-full",
              messages.length > 0 ? "bg-green-400 animate-pulse" : "bg-gray-500"
            )} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-cyan-400/70 font-mono">
            <p>SISTEM ACTIV</p>
            <p className="text-sm mt-2">Introduceți comanda, Sir...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-lg font-mono text-sm",
                  message.isUser
                    ? "bg-cyan-600/30 text-cyan-100 border border-cyan-500/50"
                    : "bg-blue-600/30 text-blue-100 border border-blue-500/50"
                )}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-blue-600/30 text-blue-100 border border-blue-500/50 px-4 py-2 rounded-lg font-mono text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-cyan-500/30">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Introduceți comanda..."
            className="flex-1 bg-black/50 border-cyan-500/50 text-cyan-100 placeholder-cyan-400/50 font-mono focus:border-cyan-400"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
