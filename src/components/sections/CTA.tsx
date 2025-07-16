'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useState } from 'react'

export function CTA() {
  const { ref, classes, isVisible } = useScrollReveal('up')
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-primary-500/5 to-accent-500/10 animate-pulse"></div>
      <div className="morph-shape-1 absolute top-10 left-10 opacity-40"></div>
      <div className="morph-shape-3 absolute bottom-10 right-10 opacity-30"></div>
      
      <div className="container-width relative z-10" ref={ref}>
        <div 
          className={`glass-card rounded-3xl p-12 lg:p-20 text-center magnetic-hover relative overflow-hidden transition-all duration-1000 ${classes}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Animated background gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br from-brand-500/20 via-primary-500/10 to-accent-500/20 transition-opacity duration-700 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}></div>
          
          <div className="relative z-10">
            <h2 className={`text-4xl lg:text-5xl font-bold text-brand-400 mb-6 text-shimmer transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              Ready to Transform Your Communications?
            </h2>
            
            <p className={`text-xl text-brand-300 mb-8 max-w-3xl mx-auto transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              Join thousands of companies already using Kalina AI for crystal-clear, 
              secure, and ultra-fast voice communications.
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <button className="btn-primary btn-magnetic text-lg px-8 py-4 animate-pulse-glow group">
                <span className="flex items-center justify-center space-x-2">
                  <span>Start Free Trial</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300"></span>
                </span>
              </button>
              <button className="btn-secondary magnetic-hover text-lg px-8 py-4 group">
                <span className="flex items-center justify-center space-x-2">
                  <span>Contact Sales</span>
                  <span className="group-hover:scale-110 transition-transform duration-300">💬</span>
                </span>
              </button>
            </div>
            
            {/* Feature highlights */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 transition-all duration-700 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="flex items-center justify-center space-x-2 text-brand-300">
                <span className="text-green-400">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-brand-300">
                <span className="text-green-400">✓</span>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-brand-300">
                <span className="text-green-400">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
            
            <p className={`text-sm text-brand-300 transition-all duration-700 delay-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <span className="text-shimmer">🔥 Limited time:</span> Get 50% off your first 3 months
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
