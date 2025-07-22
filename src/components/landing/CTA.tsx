import React, { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Zap, Clock, CheckCircle, Star } from 'lucide-react';

const CTA: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const benefits = [
    {
      icon: Clock,
      text: "Set up in under 10 minutes"
    },
    {
      icon: CheckCircle,
      text: "No credit card required"
    },
    {
      icon: Zap,
      text: "Cancel anytime"
    },
    {
      icon: Star,
      text: "14-day free trial"
    }
  ];

  const urgencyItems = [
    "🚀 Join 10,000+ companies already using AI agents",
    "⚡ Limited time: Premium features included in trial",
    "💼 Setup consultation included with new accounts",
    "🎯 24/7 support team ready to help you succeed"
  ];

  return (
    <section ref={sectionRef} className="section-padding bg-gradient-to-br from-[var(--brand-400)] via-[var(--brand-300)] to-[var(--brand-200)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="morph-shape-1 absolute top-10 left-10 w-96 h-96"></div>
        <div className="morph-shape-2 absolute bottom-10 right-10 w-80 h-80"></div>
        <div className="morph-shape-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 bg-white rounded-full opacity-20 animate-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="container-width px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-on-scroll inline-flex items-center space-x-2 glass-card-dark px-6 py-3 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-[var(--brand-100)]" />
            <span className="text-white font-medium">Ready to Transform Your Business?</span>
          </div>

          {/* Main Headline */}
          <h2 className="animate-on-scroll stagger-1 text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Start Your AI Voice Agent
            <br />
            <span className="text-shimmer bg-gradient-to-r from-white via-[var(--brand-100)] to-white bg-clip-text text-transparent">
              Journey Today
            </span>
          </h2>

          {/* Subheadline */}
          <p className="animate-on-scroll stagger-2 text-xl md:text-2xl text-[var(--brand-100)] mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of businesses already using AI to deliver exceptional customer experiences. 
            Your first agent is just minutes away.
          </p>

          {/* Urgency Messages */}
          <div className="animate-on-scroll stagger-3 grid sm:grid-cols-2 gap-4 mb-10">
            {urgencyItems.map((item, index) => (
              <div 
                key={index}
                className="glass-card-dark px-4 py-3 rounded-xl text-[var(--brand-100)] text-sm flex items-center space-x-2"
              >
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Main CTA Button */}
          <div className="animate-on-scroll stagger-4 mb-8">
            <a
              href="/auth"
              className="inline-flex items-center space-x-3 bg-white text-[var(--brand-400)] px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 btn-magnetic group"
            >
              <span>Start Free Trial Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </a>
          </div>

          {/* Benefits Grid */}
          <div className="animate-on-scroll stagger-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 text-[var(--brand-100)]"
              >
                <benefit.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Secondary Actions */}
          <div className="animate-on-scroll stagger-6 flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <button className="glass-card-dark text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-[var(--brand-400)] transition-all btn-magnetic">
              Watch 2-Minute Demo
            </button>
            <button className="glass-card-dark text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-[var(--brand-400)] transition-all btn-magnetic">
              Schedule Consultation
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="animate-on-scroll stagger-7 text-center">
            <div className="flex items-center justify-center space-x-8 text-[var(--brand-100)] opacity-80 mb-6">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-300 fill-current" />
                  ))}
                </div>
                <span className="text-sm">4.9/5 rating</span>
              </div>
              <div className="w-1 h-6 bg-[var(--brand-100)] opacity-30"></div>
              <div className="text-sm">
                500+ reviews
              </div>
              <div className="w-1 h-6 bg-[var(--brand-100)] opacity-30"></div>
              <div className="text-sm">
                99.9% uptime
              </div>
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap justify-center items-center gap-6 opacity-70">
              {['SOC 2 Certified', 'GDPR Compliant', 'ISO 27001', 'Enterprise Ready'].map((badge) => (
                <div 
                  key={badge}
                  className="glass-card-dark px-4 py-2 rounded-lg text-[var(--brand-100)] text-xs font-medium"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Final Urgency */}
          <div className="animate-on-scroll stagger-8 mt-12 p-6 glass-card-dark rounded-2xl max-w-2xl mx-auto">
            <div className="text-[var(--brand-100)] text-sm mb-2">⏰ Limited Time Offer</div>
            <div className="text-white font-semibold mb-2">
              Get 3 months of premium features FREE with annual plans
            </div>
            <div className="text-[var(--brand-100)] text-sm">
              Offer expires in: <span className="font-mono font-bold">29:59:45</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-20"
        >
          <path
            d="M0,60 C150,90 300,30 600,60 C900,90 1050,30 1200,60 L1200,120 L0,120 Z"
            fill="white"
            className="opacity-20"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default CTA;
