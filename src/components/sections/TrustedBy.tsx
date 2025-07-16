'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'

export function TrustedBy() {
  const { ref, classes, isVisible } = useScrollReveal('up')
  
  const stats = [
    { number: "10M+", label: "Active Users", icon: "👥" },
    { number: "99.9%", label: "Uptime", icon: "⚡" }, 
    { number: "<50ms", label: "Latency", icon: "🚀" },
    { number: "256-bit", label: "Encryption", icon: "🔒" },
  ]

  return (
    <section className="bg-gray-100 py-12 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        <div className={`text-center mb-12 ${classes}`}>
          <p className="text-gray-600 text-sm uppercase tracking-wider">
            Trusted by millions worldwide
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`group text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-2xl mb-2">
                  {stat.icon}
                </span>
                <span className="text-cyan-600 font-semibold text-3xl">
                  {stat.number}
                </span>
                <span className="text-gray-600 font-medium">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div>
            <div className="text-3xl font-bold text-cyan-600">10M+</div>
            <div className="text-gray-600 text-sm">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-600">99.9%</div>
            <div className="text-gray-600 text-sm">Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-600">50M+</div>
            <div className="text-gray-600 text-sm">Calls Enhanced</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-cyan-600">24/7</div>
            <div className="text-gray-600 text-sm">Support</div>
          </div>
        </div>
      </div>
    </section>
  )
}
