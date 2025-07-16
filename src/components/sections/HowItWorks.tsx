'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'

export function HowItWorks() {
  const { ref, classes, isVisible } = useScrollReveal('up')
  
  const steps = [
    {
      number: "01",
      title: "Conectează-te",
      description: "Începe un apel cu infrastructura noastră cu latență ultra-redusă",
      icon: "🔗"
    },
    {
      number: "02", 
      title: "Optimizează",
      description: "AI procesează și îmbunătățește calitatea audio în timp real"
    },
    {
      number: "03",
      title: "Comunică", 
      description: "Bucură-te de conversații clare ca cristalul oriunde în lume"
    }
  ]

  return (
    <section id="how-it-works" className="section-padding relative overflow-hidden">
      {/* Morphing background elements */}
      <div className="morph-shape-3 absolute top-20 right-20 opacity-20"></div>
      <div className="morph-shape-1 absolute bottom-40 left-20 opacity-30"></div>
      
      <div className="container-width" ref={ref}>
        <div className={`text-center mb-16 ${classes}`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-400 mb-6 text-shimmer">
            Cum Funcționează
          </h2>
          <p className="text-xl text-brand-300 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Simplu, rapid și de încredere – începe în câteva minute
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`text-center relative transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{
                transitionDelay: `${(index + 1) * 200}ms`
              }}
            >
              <div className="glass-card rounded-2xl p-8 mb-6 magnetic-hover group relative overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-primary-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                <div className="relative z-10">
                  <div className="text-6xl mb-4 animate-bounce delay-300">
                  </div>
                  <div className="text-4xl font-bold text-brand-400 mb-4 text-shimmer">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold text-brand-400 mb-4 text-glow group-hover:text-brand-50 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-brand-400 group-hover:text-brand-400 transition-colors">
                    {step.description}
                  </p>
                </div>
              </div>
              
            </div>
          ))}
          
          {/* Arrows removed as requested */}
        </div>
      </div>
    </section>
  )
}
