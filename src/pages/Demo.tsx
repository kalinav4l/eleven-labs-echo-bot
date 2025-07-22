'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import React from 'react';


// Example voice options array
const voiceOptions = [
  { id: 'kalina', name: 'Kalina' },
  { id: 'alex', name: 'Alex' },
  { id: 'emma', name: 'Emma' },
  { id: 'liam', name: 'Liam' }
];

// Example companies array for the left selector
const Companies = [
  { id: 'google', name: 'Google' },
  { id: 'microsoft', name: 'Microsoft' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'amazon', name: 'Amazon' }
];

function Demo() {


  // State for conversation status message
  const [conversationStatus, setConversationStatus] = useState<string | null>(null);
  // State for error message
  const [error, setError] = useState<string | null>(null);
  // Store the curve coordinates for SVG rendering
  const [voiceCurve, setVoiceCurve] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width: number;
    height: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'conversation' | 'calendar'>('conversation');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // State for AI messages in Calendar AI
  const [aiMessages, setAiMessages] = useState<{ from: 'ai' | 'user'; text: string }[]>([
    { from: 'user', text: 'Programează o întâlnire cu Andrei pe 15 iulie la ora 10.' },
    { from: 'ai', text: 'Sigur! Am programat întâlnirea cu Andrei pe 15 iulie la ora 10:00.' },
    { from: 'user', text: 'Mută întâlnirea la ora 11.' },
    { from: 'ai', text: 'Întâlnirea a fost mutată pe 15 iulie la ora 11:00.' }
  ]);

  // Add isVisible state for animation visibility
  const [isVisible, setIsVisible] = useState(true);

  // Ref for the section element
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // State for selected calendar date
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  // Handler for calendar date click
  function handleDateClick(date: number) {
    setSelectedDate(date);
  }

  // State and ref for the right voice selector
  const [selectedVoiceRight, setSelectedVoiceRight] = useState<number>(0);
  const selectedVoiceRightRef = useRef<HTMLButtonElement | null>(null);

  // State and ref for the left company selector
  const [selectedCompanyLeft, setSelectedCompanyLeft] = useState<number>(0);
  const selectedCompanyRef = useRef<HTMLButtonElement | null>(null);

  // Ref for the microphone button
  const micRef = useRef<HTMLButtonElement | null>(null);

  // State for recording and connection status
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

 


  // Handle AI audio response
  const handleAIAudioResponse = async (audioData: string) => {
    try {
      console.log('🎵 Processing audio response, length:', audioData.length)
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      // Resume audio context if suspended (required by some browsers)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
        console.log('🔊 Audio context resumed')
      }

      const binaryString = atob(audioData)
      const audioArray = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        audioArray[i] = binaryString.charCodeAt(i)
      }

      console.log('🎵 Decoding audio buffer, size:', audioArray.byteLength, 'bytes')
      const audioBuffer = await audioContextRef.current.decodeAudioData(audioArray.buffer)
      console.log('✅ Audio decoded successfully, duration:', audioBuffer.duration, 'seconds')
      
      playAudioBuffer(audioBuffer)
      
    } catch (error) {
      console.error('❌ Error handling AI audio response:', error)
      // Fallback: show that we're "playing" audio even if it failed
      setIsAudioPlaying(true)
      setTimeout(() => setIsAudioPlaying(false), 2000)
    }
  }

  // Play audio buffer
  const playAudioBuffer = (audioBuffer: AudioBuffer) => {
    if (!audioContextRef.current) {
      console.error('❌ No audio context available')
      return
    }
    
    console.log('🔊 Playing audio buffer, duration:', audioBuffer.duration, 'seconds')
    
    const source = audioContextRef.current.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContextRef.current.destination)
    
    setIsAudioPlaying(true)
    
    source.onended = () => {
      console.log('✅ Audio playback finished')
      setIsAudioPlaying(false)
    }
    
    try {
      source.start()
      console.log('🎵 Audio playback started')
    } catch (error) {
      console.error('❌ Failed to start audio:', error)
      setIsAudioPlaying(false)
    }
  }

  

  // Calculate voice curve for selected voice option
  useLayoutEffect(() => {
    function updateVoiceCurve() {
      if (
        selectedVoiceRight !== null &&
        selectedVoiceRightRef.current &&
        micRef.current &&
        sectionRef.current
      ) {
        const voiceRect = selectedVoiceRightRef.current.getBoundingClientRect();
        const micRect = micRef.current.getBoundingClientRect();
        const sectionRect = sectionRef.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 640;
        const micInset = 34; // px, match company curve
        if (isMobile) {
          // Start from center top of the voice button
          const x1 = voiceRect.left + voiceRect.width / 2 - sectionRect.left;
          const y1 = voiceRect.top - sectionRect.top;
          // End at mic center (same as before)
          const x2 = micRect.right - sectionRect.left - micInset;
          const y2 = micRect.top + micRect.height / 2 - sectionRect.top;
          setVoiceCurve({
            x1,
            y1,
            x2,
            y2,
            width: sectionRect.width,
            height: sectionRect.height
          });
        } else {
          setVoiceCurve({
            x1: voiceRect.left - sectionRect.left,
            y1: voiceRect.top + voiceRect.height * 0 - sectionRect.top,
            x2: micRect.right - sectionRect.left - micInset,
            y2: micRect.top + micRect.height / 2 - sectionRect.top,
            width: sectionRect.width,
            height: sectionRect.height
          });
        }
      } else {
        setVoiceCurve(null);
      }
    }
    updateVoiceCurve()
    window.addEventListener('resize', updateVoiceCurve)
    return () => window.removeEventListener('resize', updateVoiceCurve)
  }, [selectedVoiceRight, isRecording, isConnected])

    function handleDemoClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        event.preventDefault();
        if (isConnecting || isRecording || isConnected) return;

        setIsConnecting(true);
        setError(null);
        setConversationStatus('Connecting to AI...');

        // Simulate connecting and then recording
        setTimeout(() => {
            setIsConnecting(false);
            setIsConnected(true);
            setIsRecording(true);
            setConversationStatus('Connected! Speak now.');
            // Optionally, you could start recording audio here
        }, 1200);
    }
    function resetDemoState(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        event.preventDefault();
        setIsRecording(false);
        setIsConnected(false);
        setIsConnecting(false);
        setConversationStatus(null);
        setError(null);
    }
  return (
    <section id="demo" ref={sectionRef} className="bg-white py-6 md:py-8">
      {/* Switcher buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          className={`px-6 py-2 rounded-full font-semibold border-2 transition-all duration-200 ${
            activeTab === 'conversation'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => setActiveTab('conversation')}
        >
          Conversation AI
        </button>
        <button
          className={`px-6 py-2 rounded-full font-semibold border-2 transition-all duration-200 ${
            activeTab === 'calendar'
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar AI
        </button>
      </div>
      
      {/* Content Container with smooth transitions */}
      <div className="relative overflow-hidden">
        {/* Conversation AI Content */}
        <div 
          className={`transition-all duration-500 ease-in-out ${
            activeTab === 'conversation' 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none'
          }`}
        >
          <div ref={sectionRef} style={{ position: 'relative' }}>
        {/* SVG lines moved below content to avoid interfering with text */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          {/* Curves removed for frontend-only demo */}
        </div>
        <div className={`transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div
            className="border border-gray-900 rounded-lg overflow-hidden bg-white"
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              width: '100%',
              maxWidth: '1000px',
              minHeight: '400px',
              height: 'auto',
              boxSizing: 'border-box',
            }}
          >
            {/* Header Section */}
            <div className="text-center mb-10 mt-8 sm:mb-16 sm:mt-11 px-2">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-black mb-3 sm:mb-4">
                Try Kalina AI
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Experience AI-powered voice conversations with natural, human-like responses
              </p>
            </div>

            {/* Voice Selection */}
            {!isRecording && !isConnected && (
              <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-0 px-2 sm:px-6 w-full">
                {/* Companies on the left */}
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-4 items-start sm:pr-6 w-full sm:w-auto justify-center" style={{zIndex: 10, position: 'relative'}}>
                  {Companies.map((company, idx) => (
                    <button
                      key={company.id}
                      ref={selectedCompanyLeft === idx ? selectedCompanyRef : undefined}
                      onClick={() => setSelectedCompanyLeft(idx)}
                      className={`px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full border-2 transition-all duration-200 font-medium text-xs sm:text-sm md:text-base ${
                        selectedCompanyLeft === idx
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ minWidth: '80px', textAlign: 'center', position: 'relative', zIndex: 10 }}
                    >
                      <span style={{ position: 'relative', zIndex: 10 }}>{company.name}</span>
                    </button>
                  ))}
                </div>
                {/* Centered microphone */}
                <div className="flex flex-col items-center justify-center flex-1 w-full sm:w-auto" style={{zIndex: 10, position: 'relative'}}>
                  <button
                    ref={micRef}
                    onClick={handleDemoClick}
                    disabled={isConnecting}
                    className={`relative rounded-full bg-black text-white transition-all duration-300 hover:scale-105 ${
                      isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
                    } w-20 h-20 sm:w-28 sm:h-28 md:w-44 md:h-44 lg:w-56 lg:h-56 xl:w-64 xl:h-64`}
                    style={{ margin: '0 0.5rem' }}
                  >
                    {isConnecting ? (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                    ) : (
                      <svg className="w-10 h-10 sm:w-14 sm:h-14 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  {/* Removed text below microphone button for cleaner UI */}
                </div>
                {/* Agents on the right (independent selector) */}
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-4 items-end sm:pl-6 w-full sm:w-auto justify-center" style={{zIndex: 10, position: 'relative'}}>
                  {[0,1,2,3].map((index) => (
                    <button
                      key={voiceOptions[index].id}
                      ref={selectedVoiceRight === index ? selectedVoiceRightRef : undefined}
                      onClick={() => setSelectedVoiceRight(index)}
                      className={`px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-full border-2 transition-all duration-200 font-medium text-xs sm:text-sm md:text-base ${
                        selectedVoiceRight === index 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-black border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ minWidth: '80px', textAlign: 'center', position: 'relative', zIndex: 10 }}
                    >
                      <span style={{ position: 'relative', zIndex: 10 }}>{voiceOptions[index].name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Interface */}
            <div className="max-w-2xl mx-auto w-full px-2 sm:px-0">
              
              {/* Removed demo button and text below microphone */}

              {/* Status Messages */}
              <div className="text-center space-y-2 sm:space-y-4">
                {conversationStatus && (
                  <div className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg">
                    <p className="text-black text-sm">{conversationStatus}</p>
                  </div>
                )}
                
                {error && (
                  <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm mb-2">{error}</p>
                    <button 
                      onClick={resetDemoState}
                      className="text-red-600 text-xs underline hover:text-red-800 transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {(isRecording || isConnected) && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full ${
                      isAudioPlaying 
                        ? 'bg-blue-500 animate-pulse' 
                        : isConnected 
                        ? 'bg-green-500 animate-pulse' 
                        : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-gray-700 text-xs sm:text-sm">
                      {isAudioPlaying 
                        ? `${voiceOptions[selectedVoiceRight].name} is speaking...`
                        : isConnected 
                        ? `Connected to ${voiceOptions[selectedVoiceRight].name} - Speak now` 
                        : 'Connecting...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Features List */}
              {!isRecording && !isConnected && (
                <div className="mt-10 sm:mt-16 w-full px-1 sm:px-4">
                  <div className="overflow-x-auto custom-scrollbar">
                    <div className="flex gap-4 sm:gap-20 pb-4 min-w-max lg:justify-center px-2 sm:px-4 lg:px-0">
                      {[
                        { title: 'Natural Conversations', desc: 'AI that understands context and emotions' },
                        { title: 'Realistic Voice', desc: 'High-quality voice cloning technology' },
                        { title: 'Instant Response', desc: 'Minimal latency for smooth interactions' },
                        { title: 'Multilingual', desc: 'Support for multiple languages and accents' },
                        { title: 'Adaptive', desc: 'Learns and adapts to your communication style' },
                        { title: 'Secure', desc: 'Your data remains private and protected' }
                      ].map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex-shrink-0 w-48 sm:w-64 text-center p-3 sm:p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200 bg-white"
                        >
                          <h4 className="text-black font-semibold text-base sm:text-lg mb-1 sm:mb-2">{feature.title}</h4>
                          <p className="text-gray-600 text-xs sm:text-sm">{feature.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>
          </div>
        </div>
        </div>
        
        {/* Calendar AI Content */}
        <div 
          className={`transition-all duration-500 ease-in-out ${
            activeTab === 'calendar' 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'
          }`}
        >
          <div className="relative py-8 md:py-10">
            {/* Animated grid background with white vignette overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <svg width="100%" height="100%" className="w-full h-full animate-pulse" style={{opacity:0.08}}>
                <defs>
                  <pattern id="calendar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#calendar-grid)" />
              </svg>
              {/* White vignette overlay for soft fade at corners */}
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 100%)'
              }} />
            </div>
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {/* Header */}
              <div className={`text-center mb-8 transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                  Calendar AI Revolution
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Calendarul care gândește și acționează pentru tine cu AI avansat. Programează întâlniri doar vorbind cu asistentul tău digital.
                </p>
              </div>
              
              {/* AI Chat Simulation */}
              <div className="max-w-xl mx-auto mb-10">
                <div className="bg-gray-900 rounded-xl shadow-lg p-6 flex flex-col gap-3 animate-fade-in">
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.from === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`px-4 py-2 rounded-2xl text-sm max-w-xs break-words shadow-md transition-all duration-300 ${
                        msg.from === 'ai'
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                          : 'bg-white text-black border border-gray-200'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Animated Calendar */}
              <div className="flex flex-col items-center justify-center gap-8 mb-12 transition-all duration-1000 delay-200">
                <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg shadow p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-black">Iulie 2025</h3>
                    <div className="space-x-2">
                      <button className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors duration-200">Prev</button>
                      <button className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors duration-200">Next</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {['D','L','Ma','Mi','J','V','S'].map(day => (
                      <div key={day} className="text-gray-500 font-medium">{day}</div>
                    ))}
                    {/* July 2025 starts on Tuesday (so 1 empty cell) */}
                    <div></div>
                    {Array.from({length: 31}, (_,i) => (
                      <div
                        key={i+1}
                        className={`py-2 rounded-lg cursor-pointer font-medium transition-all duration-300
                          ${selectedDate === i+1
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white scale-110 shadow-lg'
                            : 'text-black hover:bg-gray-100'}
                        `}
                        onClick={() => handleDateClick(i+1)}
                        style={{position:'relative'}}
                      >
                        {i+1}
                        {selectedDate === i+1 && (
                          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full animate-bounce shadow">AI</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Call to action */}
              <div className={`text-center mt-4 transition-all duration-1000 delay-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}>
                <p className="text-gray-600 mb-6">
                  Calendar AI inteligent, orchestrare campanii, automatizare programări. Încearcă acum!
                </p>
                <button className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200">
                  Programează cu AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Demo;

