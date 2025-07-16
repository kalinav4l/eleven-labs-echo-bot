'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function CTA() {
  const { ref, classes, isVisible } = useScrollReveal('up')
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="px-6 py-20 relative overflow-hidden">
      <div className="container mx-auto relative z-10" ref={ref}>
        <div 
          className={`bg-white border border-gray-200 rounded-xl p-12 lg:p-20 text-center shadow-soft relative overflow-hidden transition-all duration-1000 ${classes}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative z-10">
            <h2 className={`text-4xl lg:text-5xl font-bold text-gray-900 mb-6 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              Ready to Transform Your Communications?
            </h2>
            
            <p className={`text-xl text-gray-700 mb-8 max-w-3xl mx-auto transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              Join thousands of companies already using Kalina AI for crystal-clear, 
              secure, and ultra-fast voice communications.
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-8 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <Button variant="primary" size="lg" className="group">
                <span className="flex items-center justify-center space-x-2">
                  <span>Start Free Trial</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">🚀</span>
                </span>
              </Button>
              <Button variant="secondary" size="lg" className="group">
                <span className="flex items-center justify-center space-x-2">
                  <span>Contact Sales</span>
                  <span className="group-hover:scale-110 transition-transform duration-300">💬</span>
                </span>
              </Button>
            </div>
            
            {/* Feature highlights */}
            <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 transition-all duration-700 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <span className="text-emerald-500">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <span className="text-emerald-500">✓</span>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <span className="text-emerald-500">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
            
            <p className={`text-sm text-gray-600 transition-all duration-700 delay-800 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <span className="text-cyan-600 font-semibold">🔥 Limited time:</span> Get 50% off your first 3 months
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
