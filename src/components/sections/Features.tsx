'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useRef, useEffect } from 'react'

export function Features() {
  const titleReveal = useScrollReveal('right', 0.3)
  const cardsReveal = useScrollReveal('left', 0.2)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  const features = [
    {
      title: "Ultra-Low Latency",
      description: "Sub-100ms latency for real-time conversations",
      icon: "⚡"
    },
    {
      title: "AI Enhancement",
      description: "Crystal-clear audio with noise cancellation",
      icon: "🎯"
    },
    {
      title: "Global Coverage",
      description: "Reliable connections in 120+ countries",
      icon: "🌍"
    },
    {
      title: "End-to-End Encryption",
      description: "Military-grade security for all calls",
      icon: "🔒"
    }
  ]

  useEffect(() => {
    function handleScroll() {
      cardRefs.current.forEach((el) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const cardCenter = rect.top + rect.height / 2;
        const centerDist = Math.abs(windowHeight / 2 - cardCenter);
        const maxDist = windowHeight / 2 + rect.height / 2;
        let scale = 0.85 + (1.18 - 0.85) * (1 - Math.min(centerDist / maxDist, 1));
        let opacity = 0.5 + 0.5 * (1 - Math.min(centerDist / maxDist, 1));
        // Reset animation if card is out of viewport
        if (rect.bottom < 0 || rect.top > windowHeight) {
          el.style.transform = '';
          el.style.opacity = '';
          el.style.transition = '';
          return;
        }
        el.style.transform = `translateY(0) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s cubic-bezier(0.16,1,0.3,1)';
      });
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section id="features" className="section-padding">
      <div className="container-width">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Side - Title and Description */}
          <div 
            ref={titleReveal.ref}
            className={`lg:col-span-5 lg:sticky lg:top-32 ${titleReveal.classes}`}
          >
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 glass px-6 py-3 rounded-full text-base text-brand-400 magnetic-hover animate-pulse-glow">
                <span className="text-brand-300 animate-pulse">✨</span>
                Core Features
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-bold text-brand-400 leading-tight text-shimmer">
                Powerful Features
              </h2>
              
              <p className="text-xl text-brand-300 leading-relaxed">
                Everything you need for crystal-clear AI-powered communication. 
                Our advanced technology stack delivers unmatched performance 
                and reliability for your voice communications.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-300 magnetic-hover">
                  <div className="w-2 h-2 bg-brand-300 rounded-full animate-pulse"></div>
                  <span>Enterprise-grade infrastructure</span>
                </div>
                <div className="flex items-center gap-3 text-brand-300 magnetic-hover">
                  <div className="w-2 h-2 bg-brand-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span>24/7 global support</span>
                </div>
                <div className="flex items-center gap-3 text-brand-300 magnetic-hover">
                  <div className="w-2 h-2 bg-brand-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span>99.9% uptime guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Feature Cards Column */}
          <div 
            ref={cardsReveal.ref}
            className={`lg:col-span-7 ${cardsReveal.classes}`}
          >
            <div className="flex flex-col items-center gap-[20rem] pt-40">
              {features.map((feature, index) => (
                <div
                  key={index}
                  ref={el => { cardRefs.current[index] = el || null; }}
                  className="glass-card rounded-2xl p-8 magnetic-hover"
                  style={{ transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s cubic-bezier(0.16,1,0.3,1)', transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-200/20 to-brand-400/20 rounded-2xl flex items-center justify-center text-2xl animate-float morphing-shape">
                        {feature.icon}
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <h3 className="text-2xl font-semibold text-brand-100 text-glow">
                        {feature.title}
                      </h3>
                      <p className="text-brand-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Spațiu suplimentar minim la final */}
              <div className="h-px" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
