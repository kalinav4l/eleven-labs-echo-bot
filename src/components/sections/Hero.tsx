'use client'

import { useEffect, useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const badgeReveal = useScrollReveal('up', 0.1)
  const titleReveal = useScrollReveal('up', 0.2)
  const descReveal = useScrollReveal('up', 0.3)
  const buttonsReveal = useScrollReveal('up', 0.4)
  const featuresReveal = useScrollReveal('up', 0.5)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (typeof window !== 'undefined') {
        setMousePosition({
          x: e.clientX / window.innerWidth - 0.5,
          y: e.clientY / window.innerHeight - 0.5,
        })
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [])

  return (
    <section id="hero" className="relative section-padding pt-32 overflow-hidden">
      {/* Dynamic background elements */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-brand-300/30 to-brand-400/30 rounded-full morphing-shape animate-float"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-gradient-to-br from-brand-400/40 to-brand-400/40 rounded-full morphing-shape animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-32 w-20 h-20 bg-gradient-to-br from-brand-400/20 to-brand-400/20 rounded-full morphing-shape animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container-width relative z-10">
        {/* Centered Content */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <div className="space-y-10">
            <div className="space-y-8">
              <div 
                ref={badgeReveal.ref}
                className={`inline-flex items-center gap-2 glass px-6 py-3 rounded-full text-base text-brand-400 magnetic-hover ${badgeReveal.classes} stagger-1`}
              >
                <span className="text-brand-300 animate-pulse">★</span>
                Vorbește liber. AI se ocupă.
              </div>
              
              <h1 
                ref={titleReveal.ref}
                className={`text-6xl lg:text-7xl xl:text-8xl font-bold text-brand-400 leading-tight ${titleReveal.classes} stagger-2`}
              >
                Vocea ta sună{' '}
                <span className="text-shimmer animate-gradient">
                  natural,
                </span>
                {' '} algoritmii noștri îi dau 
                <span className="text-shimmer animate-gradient" style={{ animationDelay: '0.5s' }}>
                  {' '}forță.
                </span>
              </h1>
              
              <p 
                ref={descReveal.ref}
                className={`text-2xl lg:text-3xl text-brand-300 max-w-4xl mx-auto leading-relaxed ${descReveal.classes} stagger-3`}
              >
                Apeluri audio ultracurate, optimizate în timp real de inteligența artificială: conectează‑te instant, fără zgomot, oriunde în lume.
              </p>
            </div>

            <div 
              ref={buttonsReveal.ref}
              className={`flex flex-col sm:flex-row gap-6 justify-center ${buttonsReveal.classes} stagger-4`}
            >
              <button className="btn-primary btn-magnetic flex items-center gap-2 group text-lg px-8 py-4 animate-pulse-glow">
                Start Free Trial
                <span className="group-hover:translate-x-1 transition-transform duration-300"></span>
              </button>
              
              <button className="btn-secondary btn-magnetic flex items-center gap-2 group text-lg px-8 py-4">
                <span className="group-hover:scale-110 transition-transform duration-300"></span>
                Watch Demo
              </button>
            </div>

            {/* Features preview */}
            <div 
              ref={featuresReveal.ref}
              className={`flex flex-wrap gap-8 pt-12 justify-center ${featuresReveal.classes} stagger-5`}
            >
              <div className="flex items-center gap-3 text-lg text-brand-300 magnetic-hover">
                <span className="text-success-400 animate-pulse">⛊</span>
                End-to-end encrypted
              </div>
              <div className="flex items-center gap-3 text-lg text-brand-300 magnetic-hover">
                <span className="text-accent-400 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
                Sub-100ms latency
              </div>
              <div className="flex items-center gap-3 text-lg text-brand-300 magnetic-hover">
                <div className="w-3 h-3 bg-success-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                99.9% uptime
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
