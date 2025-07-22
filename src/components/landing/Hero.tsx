import React, { useEffect, useRef } from 'react';
import { ArrowRight, Play, Sparkles, Zap, Star } from 'lucide-react';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToDemo = () => {
    const element = document.getElementById('demo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        {/* Morphing Background Shapes */}
        <div className="morph-shape-1 absolute top-20 left-10 w-64 h-64 opacity-10"></div>
        <div className="morph-shape-2 absolute top-40 right-20 w-96 h-96 opacity-8"></div>
        <div className="morph-shape-3 absolute bottom-20 left-1/3 w-80 h-80 opacity-12"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-[var(--brand-300)] rounded-full opacity-20 animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container-width px-6 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="animate-on-scroll inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-[var(--brand-300)]" />
            <span className="text-sm font-medium text-[var(--brand-400)]">
              Powered by Advanced AI Technology
            </span>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>

          {/* Headline */}
          <h1 className="animate-on-scroll stagger-1 text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-gradient">Transform</span>
            <br />
            Your Business with
            <br />
            <span className="text-shimmer">AI Voice Agents</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-on-scroll stagger-2 text-xl md:text-2xl text-[var(--brand-300)] mb-8 max-w-3xl mx-auto leading-relaxed">
            Create intelligent voice agents that understand, engage, and convert customers 
            24/7. No coding required, unlimited possibilities.
          </p>

          {/* Stats Row */}
          <div className="animate-on-scroll stagger-3 flex flex-wrap justify-center items-center gap-8 mb-10 text-sm text-[var(--brand-300)]">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>10,000+ Active Agents</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>50+ Languages</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="animate-on-scroll stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="/auth"
              className="btn-primary btn-magnetic text-lg px-8 py-4 flex items-center space-x-2 group"
            >
              <span>Start Building Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            
            <button
              onClick={scrollToDemo}
              className="btn-secondary btn-magnetic text-lg px-8 py-4 flex items-center space-x-2 group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="animate-on-scroll stagger-5">
            <p className="text-sm text-[var(--brand-300)] mb-6">
              Trusted by innovative companies worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['TechCorp', 'StartupXYZ', 'GlobalInc', 'InnovateNow', 'FutureGen'].map((company, index) => (
                <div 
                  key={company}
                  className="glass-card px-6 py-3 rounded-lg magnetic-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-[var(--brand-400)] font-medium text-sm">
                    {company}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-[var(--brand-300)] rounded-full flex justify-center">
              <div className="w-1 h-3 bg-[var(--brand-300)] rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Visual Elements */}
      <div className="absolute top-1/4 right-10 animate-float">
        <div className="glass-card p-4 rounded-xl">
          <Zap className="w-8 h-8 text-[var(--brand-300)]" />
        </div>
      </div>
      
      <div className="absolute bottom-1/4 left-10 animate-float" style={{ animationDelay: '2s' }}>
        <div className="glass-card p-4 rounded-xl">
          <Sparkles className="w-8 h-8 text-[var(--brand-300)]" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
