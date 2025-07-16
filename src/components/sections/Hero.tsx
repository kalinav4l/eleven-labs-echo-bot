'use client'

import { useEffect, useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { Button } from '@/components/ui/Button'

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const badgeReveal = useScrollReveal('up', 0.1)
  const titleReveal = useScrollReveal('up', 0.2)
  const descReveal = useScrollReveal('up', 0.3)
  const buttonsReveal = useScrollReveal('up', 0.4)
  const featuresReveal = useScrollReveal('up', 0.5)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section id="hero" className="relative px-6 py-20 pt-32 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Dynamic background elements */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-cyan-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-gradient-to-br from-emerald-200/40 to-emerald-400/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-32 w-20 h-20 bg-gradient-to-br from-indigo-200/20 to-indigo-400/20 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Centered Content */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="space-y-10">
            <div className="space-y-8">
              <div 
                ref={badgeReveal.ref}
                className={`inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 px-6 py-3 rounded-full text-base text-gray-700 shadow-soft ${badgeReveal.classes}`}
              >
                <span className="text-cyan-600 animate-pulse">★</span>
                Speak freely. AI handles the rest.
              </div>
              
              <h1 
                ref={titleReveal.ref}
                className={`text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-tight ${titleReveal.classes}`}
              >
                Your voice sounds{' '}
                <span className="bg-gradient-to-r from-cyan-600 to-emerald-500 bg-clip-text text-transparent">
                  natural
                </span>
                , our algorithms make it{' '}
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-600 bg-clip-text text-transparent">
                  powerful
                </span>
              </h1>
              
              <p 
                ref={descReveal.ref}
                className={`text-2xl lg:text-3xl text-gray-700 max-w-4xl mx-auto leading-relaxed ${descReveal.classes}`}
              >
                Ultra-clear audio calls, optimized in real-time by AI: connect instantly, noise-free, anywhere in the world.
              </p>
            </div>

            <div 
              ref={buttonsReveal.ref}
              className={`flex flex-col sm:flex-row gap-6 justify-center ${buttonsReveal.classes}`}
            >
              <Button variant="primary" size="lg" className="group">
                Start Free Trial
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Button>
              
              <Button variant="secondary" size="lg" className="group">
                <span className="mr-2 group-hover:scale-110 transition-transform duration-300">▶</span>
                Watch Demo
              </Button>
            </div>

            {/* Features preview */}
            <div 
              ref={featuresReveal.ref}
              className={`flex flex-wrap gap-8 pt-12 justify-center ${featuresReveal.classes}`}
            >
              <div className="flex items-center gap-3 text-lg text-gray-700">
                <span className="text-emerald-500 animate-pulse">🔒</span>
                End-to-end encrypted
              </div>
              <div className="flex items-center gap-3 text-lg text-gray-700">
                <span className="text-cyan-600 animate-pulse" style={{ animationDelay: '0.5s' }}>⚡</span>
                Sub-100ms latency
              </div>
              <div className="flex items-center gap-3 text-lg text-gray-700">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                99.9% uptime
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
