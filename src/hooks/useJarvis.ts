
import { useState, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export const useJarvis = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const addMessage = useCallback((text: string, isUser: boolean) => {
    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      isUser,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, message])
    return message
  }, [])

  const playAudio = useCallback(async (base64Audio: string) => {
    try {
      setIsPlaying(true)
      
      // Convert base64 to blob
      const binaryString = atob(base64Audio)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      const blob = new Blob([bytes], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(blob)
      
      const audio = new Audio(audioUrl)
      
      return new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
          resolve()
        }
        
        audio.onerror = () => {
          setIsPlaying(false)
          URL.revokeObjectURL(audioUrl)
          reject(new Error('Audio playback failed'))
        }
        
        audio.play().catch(reject)
      })
    } catch (error) {
      setIsPlaying(false)
      throw error
    }
  }, [])

  const sendMessage = useCallback(async (text: string, voice?: string) => {
    if (!text.trim()) return

    setIsLoading(true)
    
    try {
      // Add user message
      addMessage(text, true)
      
      // Generate Jarvis response (for now, simple responses)
      const responses = [
        "Da, Sir. Înțeleg cerința dumneavoastră.",
        "Procesez informația acum, Sir.",
        "Sistemele sunt operaționale, Sir.",
        "Analizez datele în timp real, Sir.",
        "Protocolul este activ, Sir.",
        "Scanez pentru amenințări, Sir. Totul pare în regulă.",
        "Calculez probabilitățile, Sir.",
        "Interfața este stabilă, Sir."
      ]
      
      const response = responses[Math.floor(Math.random() * responses.length)]
      addMessage(response, false)
      
      // Convert to speech
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: response, voice }
      })
      
      if (error) throw error
      
      // Play audio
      if (data?.audioContent) {
        await playAudio(data.audioContent)
      }
      
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage('Scuze, Sir. Am întâmpinat o problemă tehnică.', false)
    } finally {
      setIsLoading(false)
    }
  }, [addMessage, playAudio])

  return {
    messages,
    isPlaying,
    isLoading,
    sendMessage,
  }
}
