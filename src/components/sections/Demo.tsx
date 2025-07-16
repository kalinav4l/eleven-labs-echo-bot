'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useState } from 'react'

export function Demo() {
  const [isPlaying, setIsPlaying] = useState(false)
  const { ref, classes, isVisible } = useScrollReveal('up')

  return (
    <section id="demo" className="section-padding bg-primary-900/30 relative overflow-hidden">
      {/* Morphing background elements */}
      <div className="morph-shape-1 absolute top-20 left-10 opacity-30"></div>
      <div className="morph-shape-2 absolute bottom-20 right-10 opacity-20"></div>
      
      <div className="container-width" ref={ref}>
        <div className={`text-center mb-16 transition-all duration-1000 ${classes}`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-400 mb-6 text-shimmer">
            Experience the Difference
          </h2>
          <p className="text-xl text-brand-300 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Try our interactive demo and hear the crystal-clear quality for yourself
          </p>
        </div>
        
        <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <div className="glass-card rounded-3xl p-8 lg:p-12 magnetic-hover">
            <div className="text-center space-y-8">
              <div 
                className={`w-32 h-32 bg-gradient-to-br from-brand-200 to-brand-400 rounded-full flex items-center justify-center mx-auto magnetic-hover cursor-pointer transition-all duration-500 ${
                  isPlaying ? 'scale-110 animate-pulse-glow' : 'hover:scale-105'
                }`}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <div className={`text-4xl text-brand-100 transition-transform duration-300 ${
                  isPlaying ? 'scale-75' : 'scale-100'
                }`}>
                  {isPlaying ? '⏸' : '▶'}
                </div>
              </div>
              
              <div className="animate-fade-in-up delay-500">
                <h3 className="text-2xl font-semibold text-brand-100 mb-4 text-glow">
                  Interactive Call Demo
                </h3>
                <p className="text-brand-300 mb-8">
                  Experience real-time AI-enhanced voice quality with our live demo
                </p>
                
                <button className="btn-primary btn-magnetic text-lg px-8 py-4 animate-pulse-glow">
                  Start Demo Call
                </button>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mt-12 stagger-animation delay-700">
                <div className="text-center glass-card p-6 rounded-xl magnetic-hover transform transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-primary-400 text-shimmer">{"<100ms"}</div>
                  <div className="text-brand-300">Latency</div>
                </div>
                <div className="text-center glass-card p-6 rounded-xl magnetic-hover transform transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-success-400 text-shimmer">99.9%</div>
                  <div className="text-brand-300">Uptime</div>
                </div>
                <div className="text-center glass-card p-6 rounded-xl magnetic-hover transform transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-accent-400 text-shimmer">120+</div>
                  <div className="text-brand-300">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
