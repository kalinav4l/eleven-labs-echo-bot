import React, { useEffect, useRef } from 'react';
import { 
  Brain, 
  Globe, 
  Zap, 
  Shield, 
  BarChart3, 
  Headphones, 
  Clock, 
  Smartphone,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Features: React.FC = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

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

    const elements = featuresRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const mainFeatures = [
    {
      icon: Brain,
      title: "Advanced AI Understanding",
      description: "Natural language processing that understands context, emotion, and intent with human-like comprehension.",
      benefits: ["99.2% accuracy", "Context awareness", "Emotion detection", "Multi-turn conversations"],
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Globe,
      title: "50+ Languages Support",
      description: "Communicate with customers worldwide in their native language with perfect pronunciation and cultural context.",
      benefits: ["Real-time translation", "Cultural adaptation", "Local accents", "Regional preferences"],
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Lightning Fast Responses",
      description: "Sub-second response times that feel more natural than human conversation, keeping customers engaged.",
      benefits: ["< 500ms response", "No wait times", "Instant scaling", "24/7 availability"],
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade security with end-to-end encryption, compliance certifications, and privacy protection.",
      benefits: ["SOC 2 certified", "GDPR compliant", "256-bit encryption", "Private cloud options"],
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const additionalFeatures = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Deep insights into customer interactions, sentiment analysis, and performance metrics."
    },
    {
      icon: Headphones,
      title: "Voice Cloning",
      description: "Create custom voices that match your brand personality and customer preferences."
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "Intelligent appointment booking with calendar integration and automated reminders."
    },
    {
      icon: Smartphone,
      title: "Omnichannel Support",
      description: "Seamless integration across phone, web, mobile, and messaging platforms."
    }
  ];

  return (
    <section id="features" ref={featuresRef} className="section-padding bg-white">
      <div className="container-width px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="animate-on-scroll inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-[var(--brand-300)]" />
            <span className="text-sm font-medium text-[var(--brand-400)]">Powerful Features</span>
          </div>
          
          <h2 className="animate-on-scroll stagger-1 text-4xl md:text-5xl font-bold text-gradient mb-6">
            Everything You Need to Scale
          </h2>
          
          <p className="animate-on-scroll stagger-2 text-xl text-[var(--brand-300)] max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and capabilities needed to create, deploy, and manage AI voice agents that deliver exceptional customer experiences.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className={`animate-on-scroll stagger-${index + 1} feature-card glass-card rounded-2xl p-8 magnetic-hover`}
            >
              <div className="relative">
                {/* Icon with Gradient Background */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} p-4 mb-6 shadow-lg`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-[var(--brand-400)] mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-[var(--brand-300)] mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Benefits List */}
                <div className="grid grid-cols-2 gap-3">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-[var(--brand-400)]">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Learn More Link */}
                <div className="mt-6 pt-6 border-t border-[var(--brand-200)]">
                  <button className="text-[var(--brand-400)] hover:text-[var(--brand-300)] font-medium text-sm flex items-center space-x-2 transition-colors group">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="animate-on-scroll">
          <h3 className="text-3xl font-bold text-center text-[var(--brand-400)] mb-12">
            And Much More
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`glass-card rounded-xl p-6 text-center magnetic-hover stagger-${index + 1}`}
              >
                <div className="w-12 h-12 mx-auto mb-4 p-3 bg-gradient-to-br from-[var(--brand-200)] to-[var(--brand-300)] rounded-lg">
                  <feature.icon className="w-full h-full text-white" />
                </div>
                
                <h4 className="text-lg font-semibold text-[var(--brand-400)] mb-2">
                  {feature.title}
                </h4>
                
                <p className="text-sm text-[var(--brand-300)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Showcase */}
        <div className="animate-on-scroll mt-20 text-center">
          <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-[var(--brand-400)] mb-4">
              Seamless Integrations
            </h3>
            
            <p className="text-[var(--brand-300)] mb-8">
              Connect with your existing tools and workflows. No complex setup required.
            </p>

            {/* Integration Logos/Icons */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {['Salesforce', 'HubSpot', 'Slack', 'Zoom', 'Microsoft Teams', 'Zapier'].map((integration, index) => (
                <div 
                  key={integration}
                  className="glass-card px-6 py-3 rounded-lg magnetic-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-[var(--brand-400)] font-medium text-sm">
                    {integration}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <a
                href="/auth"
                className="btn-primary btn-magnetic inline-flex items-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
