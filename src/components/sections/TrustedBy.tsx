'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import Threads from '../Threads'

export function TrustedBy() {
  const { ref, classes, isVisible } = useScrollReveal('up')
  
  const companies = [
    { name: "TechCorp" },
    { name: "GlobalComm" }, 
    { name: "VoiceFirst" },
    { name: "CallClear" },
    { name: "AudioMax" }
  ]

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="section-padding relative overflow-hidden min-h-[400px]">
        <Threads
          className="absolute inset-0 z-0 pointer-events-none w-full h-full"
          color={[0, 0, 0]}
          amplitude={1.5}
          distance={2.5}
          enableMouseInteraction={false}
        />
        
        <div className="container-width relative z-10" ref={ref}>
        <div className={`text-center mb-12 ${classes}`}>
          <p className="text-brand-300 text-sm uppercase tracking-wider text-shimmer">
            Trusted by industry leaders
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
          {companies.map((company, index) => (
            <div 
              key={index} 
              className={`group magnetic-hover transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div className="flex items-center space-x-3 glass-card px-6 py-4 rounded-xl hover:border-brand-300/50 transition-all duration-300">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                </span>
                <span className="text-brand-300 group-hover:text-brand-400 font-semibold text-lg transition-colors duration-300">
                  {company.name}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Animated testimonial metrics */}
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="magnetic-hover">
            <div className="text-3xl font-bold text-brand-400 text-shimmer">500K+</div>
            <div className="text-brand-300 text-sm">Active Users</div>
          </div>
          <div className="magnetic-hover">
            <div className="text-3xl font-bold text-brand-400 text-shimmer">99.9%</div>
            <div className="text-brand-300 text-sm">Satisfaction</div>
          </div>
          <div className="magnetic-hover">
            <div className="text-3xl font-bold text-brand-400 text-shimmer">50M+</div>
            <div className="text-brand-300 text-sm">Calls Enhanced</div>
          </div>
          <div className="magnetic-hover">
            <div className="text-3xl font-bold text-brand-400 text-shimmer">24/7</div>
            <div className="text-brand-300 text-sm">Support</div>
          </div>
        </div>
      </div>
    </div>
    </section>
  )
}
