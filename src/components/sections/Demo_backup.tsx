'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useState, useEffect, useRef } from 'react'

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "sk_2bb078bf754417218ead92d389932a47d387f40be2cd3e50"
const ELEVENLABS_AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "agent_01k097c4y7fzg9v8nbkeghxvhm"

export function Demo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isHeaderOverDemo, setIsHeaderOverDemo] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [conversationStatus, setConversationStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [selectedVoice, setSelectedVoice] = useState(0)
  const { ref, classes, isVisible } = useScrollReveal('up')
  const sectionRef = useRef<HTMLElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const conversationIdRef = useRef<string | null>(null)

  // Voice options
  const voiceOptions = [
    { name: 'Lili', color: 'from-pink-400 to-rose-500' },
    { name: 'Eric', color: 'from-blue-400 to-indigo-500' },
    { name: 'Kalina', color: 'from-purple-400 to-violet-500' },
    { name: 'Andreea', color: 'from-green-400 to-emerald-500' },
    { name: 'Alexandra', color: 'from-yellow-400 to-orange-500' },
    { name: 'Anca', color: 'from-teal-400 to-cyan-500' },
    { name: 'Cristi', color: 'from-red-400 to-pink-500' }
  ]

  // Handle voice selection with scroll
  const handleVoiceScroll = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1 : -1
    setSelectedVoice((prev) => {
      const newIndex = prev + delta
      if (newIndex < 0) return voiceOptions.length - 1
      if (newIndex >= voiceOptions.length) return 0
      return newIndex
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        const headerHeight = 80 // Approximate header height
        
        // Check if header is overlapping with demo section
        const isOverlapping = rect.top <= headerHeight && rect.bottom >= headerHeight
        setIsHeaderOverDemo(isOverlapping)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll)
      handleScroll() // Check initial state
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  // Add CSS custom properties for header text color changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isHeaderOverDemo) {
        // Dispatch custom event to notify header
        window.dispatchEvent(new CustomEvent('headerOverDemo', { detail: { isOver: true } }))
      } else {
        window.dispatchEvent(new CustomEvent('headerOverDemo', { detail: { isOver: false } }))
      }
    }
  }, [isHeaderOverDemo])

  // ElevenLabs API functions
  const startElevenLabsConversation = async () => {
    try {
      setIsConnecting(true)
      setError('')
      setConversationStatus('Conectare la Kalina AI...')

      const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${ELEVENLABS_AGENT_ID}/simulate-conversation`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          simulation_specification: {
            simulated_user_config: {}
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`ElevenLabs API Error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      conversationIdRef.current = data.conversation_id || 'demo-conversation'
      setIsConnected(true)
      setConversationStatus('Conectat cu succes! Vorbește acum...')
      
      console.log('ElevenLabs conversation started:', data)
      return data
    } catch (error: any) {
      console.error('ElevenLabs connection error:', error)
      
      // Handle CORS and network errors gracefully
      if (error.message.includes('CORS') || error.message.includes('fetch')) {
        setError('Demo mode: Simulăm conectarea cu Kalina AI (eroare CORS)')
        // Simulate successful connection for demo purposes
        conversationIdRef.current = 'demo-conversation'
        setIsConnected(true)
        setConversationStatus('Mod Demo: Simulăm conversația AI...')
        return { conversation_id: 'demo-conversation' }
      } else {
        setError('Eroare la conectarea cu Kalina. Încearcă din nou.')
        setConversationStatus('')
        return null
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const stopElevenLabsConversation = async () => {
    if (conversationIdRef.current) {
      try {
        setConversationStatus('Închidere conversație...')
        
        // Note: Add endpoint to end conversation if available in ElevenLabs API
        // For now, we'll just reset the local state
        
        conversationIdRef.current = null
        setIsConnected(false)
        setConversationStatus('')
        console.log('Kalina AI conversation ended')
      } catch (error) {
        console.error('Error ending Kalina AI conversation:', error)
      }
    }
  }

  // Audio level monitoring function
  const monitorAudioLevel = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(dataArray)
      
      // Calculate average volume with higher sensitivity
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      // Amplify the sensitivity and apply exponential scaling for more dramatic effect
      const amplified = (average / 64) * 2 // Increased from 128 to 64, doubled multiplier
      const exponential = Math.pow(amplified, 0.7) // Exponential curve for more dramatic response
      const normalizedLevel = Math.min(exponential * 1.5, 2) // Allow values up to 2 for stronger effect
      setAudioLevel(normalizedLevel)
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(monitorAudioLevel)
      }
    }
  }

  // Handle microphone recording and ElevenLabs integration
  const handleDemoClick = async () => {
    if (!isRecording && !isConnected) {
      try {
        // First, start ElevenLabs conversation
        const conversationData = await startElevenLabsConversation()
        if (!conversationData) {
          return // Error already handled in startElevenLabsConversation
        }

        // Then start microphone recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        
        // Set up audio analysis
        if (typeof window !== 'undefined') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
          analyserRef.current = audioContextRef.current.createAnalyser()
          const source = audioContextRef.current.createMediaStreamSource(stream)
          source.connect(analyserRef.current)
          analyserRef.current.fftSize = 512 // Increased from 256 for better frequency resolution
          analyserRef.current.smoothingTimeConstant = 0.3 // Reduced from default 0.8 for faster response
        }
        
        mediaRecorderRef.current = new MediaRecorder(stream)
        mediaRecorderRef.current.start()
        setIsRecording(true)
        
        // Start monitoring audio levels
        monitorAudioLevel()

        console.log('Recording started with Kalina AI integration')
      } catch (err) {
        console.error('Demo start error:', err)
        setError('Eroare la accesarea microfonului sau conectarea cu Kalina AI.')
        setConversationStatus('')
      }
    } else {
      // Stop everything
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      
      // Stop ElevenLabs conversation
      await stopElevenLabsConversation()
      
      setIsRecording(false)
      setAudioLevel(0)
      setError('')
      console.log('Recording and Kalina AI conversation stopped')
    }
  }

  return (
    <section 
      id="demo" 
      ref={sectionRef}
      className="section-padding bg-gray-950 relative overflow-hidden">
      {/* Morphing background elements */}
      <div className="morph-shape-1 absolute top-20 left-10 opacity-30"></div>
      <div className="morph-shape-2 absolute bottom-20 right-10 opacity-20"></div>
      
      <div className="container-width" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-1000 ${classes}`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-100 mb-6 text-shimmer">
            Experience the Difference
          </h2>
          <p className="text-xl text-brand-100 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Try our interactive demo and hear the crystal-clear quality for yourself
          </p>
        </div>
        
        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <div className="glass-card rounded-3xl p-8 lg:p-12 magnetic-hover">
            <div className={`text-center transition-all duration-500 ${(isRecording || isConnected) ? 'h-96 flex flex-col justify-between' : 'space-y-8'}`}>
              <div className={`transition-all duration-500 ${(isRecording || isConnected) ? 'flex-1 flex items-center justify-center relative' : ''}`}>
                {/* Voice selection circles - positioned around main circle */}
                {!isRecording && !isConnected && (
                  <div className="relative flex items-center justify-center">
                    {voiceOptions.map((voice, index) => {
                      const angle = (index * 360) / voiceOptions.length
                      const radius = 120
                      const x = Math.cos((angle - 90) * Math.PI / 180) * radius
                      const y = Math.sin((angle - 90) * Math.PI / 180) * radius
                      
                      return (
                        <div
                          key={voice.name}
                          className={`absolute w-12 h-12 rounded-full cursor-pointer transition-all duration-300 hover:scale-110 ${
                            selectedVoice === index ? 'scale-125 shadow-lg' : 'scale-100'
                          }`}
                          style={{
                            left: `calc(50% + ${x}px - 24px)`,
                            top: `calc(50% + ${y}px - 24px)`,
                          }}
                          onClick={() => setSelectedVoice(index)}
                        >
                          <div className={`w-full h-full rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center shadow-md`}>
                            <span className="text-white text-xs font-bold">{voice.name.charAt(0)}</span>
                          </div>
                          {selectedVoice === index && (
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-brand-100 text-xs font-semibold whitespace-nowrap">
                              {voice.name}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Siri-like pulsing rings when recording */}
                {(isRecording || isConnected) && (
                  <>
                    {[1, 2, 3].map((ring) => (
                      <div
                        key={ring}
                        className={`absolute rounded-full border-2 animate-ping ${
                          isConnected ? 'border-green-400/40' : 'border-brand-300/40'
                        }`}
                        style={{
                          width: `${180 + ring * 60 + audioLevel * 120}px`, // Increased base size and multiplier
                          height: `${180 + ring * 60 + audioLevel * 120}px`,
                          animationDelay: `${ring * 0.2}s`, // Faster stagger
                          animationDuration: `${1.5 - audioLevel * 0.5}s`, // Dynamic speed based on audio
                          opacity: audioLevel > 0.05 ? 0.8 - ring * 0.2 : 0.15 // More visible and lower threshold
                        }}
                      />
                    ))}
                    {/* Dynamic glow effect */}
                    <div
                      className={`absolute rounded-full blur-2xl transition-all duration-50 ${
                        isConnected 
                          ? 'bg-gradient-to-r from-green-200/30 to-green-400/30' 
                          : 'bg-gradient-to-r from-brand-200/30 to-brand-400/30'
                      }`}
                      style={{
                        width: `${140 + audioLevel * 150}px`, // Increased multiplier
                        height: `${140 + audioLevel * 150}px`,
                        opacity: Math.min(audioLevel * 1.2, 1) // Higher opacity
                      }}
                    />
                  </>
                )}
                
                <div 
                  className={`rounded-full flex items-center justify-center mx-auto magnetic-hover cursor-pointer transition-all duration-500 relative z-10 ${
                    isConnected
                      ? 'bg-gradient-to-br from-green-400 to-green-600'
                      : 'bg-gradient-to-br from-brand-200 to-brand-400'
                  } ${
                    (isRecording || isConnected)
                      ? 'w-40 h-40 animate-pulse-glow' 
                      : 'w-32 h-32 hover:scale-105'
                  } ${isPlaying ? 'scale-110 animate-pulse-glow' : ''}`}
                  onClick={() => setIsPlaying(!isPlaying)}
                  onWheel={!isRecording && !isConnected ? handleVoiceScroll : undefined}
                  style={{
                    transform: (isRecording || isConnected) ? `scale(${1.1 + audioLevel * 0.6})` : undefined, // Increased multiplier
                    boxShadow: (isRecording || isConnected) ? `0 0 ${30 + audioLevel * 80}px rgba(${isConnected ? '34, 197, 94' : '59, 130, 246'}, ${0.6 + audioLevel * 0.8})` : undefined, // Stronger glow
                    filter: (isRecording || isConnected) ? `brightness(${1 + audioLevel * 0.5})` : undefined // Add brightness effect
                  }}
                >
                  <div className={`text-brand-100 transition-all duration-300 ${
                        (isRecording || isConnected) ? 'text-5xl' : 'text-4xl'
                      } ${isPlaying ? 'scale-75' : 'scale-100'} text-center`}>
                    {!isRecording && !isConnected ? (
                      <div className="flex flex-col items-center">
                        <div className="text-2xl mb-1">🎤</div>
                        <div className="text-xs font-semibold">{voiceOptions[selectedVoice].name}</div>
                      </div>
                    ) : (
                      <div className="text-2xl">🎙️</div>
                    )}
                  </div>
                </div>
              </div>
              
              {!isRecording && !isConnected && (
                <>
                  <div className="animate-fade-in-up delay-500">
                    <h3 className="text-2xl font-semibold text-brand-100 mb-4 text-glow">
                      Demo Interactiv de Apel AI
                    </h3>
                    <p className="text-brand-300 mb-6">
                      Experimentează calitatea vocii îmbunătățită de AI în timp real cu demo-ul nostru live
                    </p>
                    
                    <div className="mb-6">
                      <p className="text-brand-200 text-sm mb-2">
                        Selectează vocea preferată:
                      </p>
                      <p className="text-brand-300 text-xs">
                        Clic pe cercul colorat sau scroll pe cercul central
                      </p>
                    </div>
                    
                    {/* Status and Error Messages */}
                    {conversationStatus && (
                      <div className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                        <p className="text-blue-300 text-sm">{conversationStatus}</p>
                      </div>
                    )}
                    
                    {error && (
                      <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                        <p className="text-red-300 text-sm">{error}</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className={`btn-primary btn-magnetic text-lg px-8 py-4 mt-0 mb-4 mx-auto rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                      isConnecting ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow hover:scale-105'
                    }`}
                    onClick={handleDemoClick}
                    disabled={isConnecting}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {isConnecting && (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      )}
                      <span>{isConnecting ? 'Se conectează...' : 'Începe Demo Apel AI'}</span>
                    </div>
                  </button>
                </>
              )}
              
              {(isRecording || isConnected) && (
                <div className="space-y-6">
                  {/* Connection Status */}
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                    <span className="text-brand-100 text-sm font-medium">
                      {isConnected ? 'Conectat la Kalina AI' : 'Conectare...'}
                    </span>
                  </div>

                  {/* Conversation Status */}
                  {conversationStatus && (
                    <div className="text-center mb-4">
                      <p className="text-brand-300 text-sm">{conversationStatus}</p>
                    </div>
                  )}

                  <button 
                    className={`bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-2 border-red-400 shadow-red-500/30 transform hover:scale-105 btn-magnetic text-lg px-8 py-4 mx-auto transition-all duration-300 rounded-xl font-semibold shadow-lg ${
                      audioLevel > 0.01 ? 'animate-pulse' : '' // Lower threshold for pulsing
                    }`}
                    onClick={handleDemoClick}
                    style={{
                      boxShadow: `0 0 ${20 + audioLevel * 50}px rgba(239, 68, 68, ${0.5 + audioLevel * 1.0})`, // Stronger red glow
                      transform: `scale(${1 + audioLevel * 0.1})` // Button also scales with audio
                    }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div 
                        className="bg-white rounded-full animate-pulse transition-all duration-50"
                        style={{
                          width: `${10 + audioLevel * 12}px`, // Increased size variation
                          height: `${10 + audioLevel * 12}px`,
                          opacity: 0.8 + audioLevel * 0.2 // Dynamic opacity
                        }}
                      />
                      <span>Oprește Conversația</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
