import React, { useEffect, useRef } from 'react';
import { Star, TrendingUp, Users, Award } from 'lucide-react';

const TrustedBy: React.FC = () => {
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

  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Active AI Agents",
      description: "Deployed across industries"
    },
    {
      icon: TrendingUp,
      value: "99.9%",
      label: "Uptime Guarantee",
      description: "Enterprise-grade reliability"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Customer Rating",
      description: "Based on 500+ reviews"
    },
    {
      icon: Award,
      value: "50M+",
      label: "Conversations",
      description: "Processed successfully"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Customer Success",
      company: "TechCorp",
      avatar: "SC",
      content: "Kalina AI transformed our customer support. Response times dropped by 85% while satisfaction scores increased to 4.8/5. It's like having a team of expert agents available 24/7.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "CEO",
      company: "StartupXYZ",
      avatar: "MR",
      content: "As a startup, we couldn't afford a large support team. Kalina AI gave us enterprise-level customer service from day one. Our conversion rates improved by 40%.",
      rating: 5
    },
    {
      name: "Emily Thompson",
      role: "Operations Director",
      company: "GlobalInc",
      avatar: "ET",
      content: "The multilingual capabilities are incredible. We're now serving customers in 25 languages with perfect accuracy. It's revolutionized our global expansion.",
      rating: 5
    }
  ];

  const companies = [
    {
      name: "TechCorp",
      industry: "Technology",
      size: "Enterprise",
      improvement: "+85% faster response times"
    },
    {
      name: "StartupXYZ",
      industry: "E-commerce",
      size: "Startup",
      improvement: "+40% conversion rate"
    },
    {
      name: "GlobalInc",
      industry: "Manufacturing",
      size: "Fortune 500",
      improvement: "+60% customer satisfaction"
    },
    {
      name: "InnovateNow",
      industry: "Healthcare",
      size: "Mid-market",
      improvement: "+70% cost reduction"
    },
    {
      name: "FutureGen",
      industry: "Finance",
      size: "Enterprise",
      improvement: "+90% automation rate"
    },
    {
      name: "NextLevel",
      industry: "Education",
      size: "Scale-up",
      improvement: "+50% student engagement"
    }
  ];

  return (
    <section id="trusted-by" ref={sectionRef} className="section-padding bg-gradient-to-br from-[var(--brand-100)] to-white">
      <div className="container-width px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="animate-on-scroll inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full mb-6">
            <Award className="w-4 h-4 text-[var(--brand-300)]" />
            <span className="text-sm font-medium text-[var(--brand-400)]">Trusted Worldwide</span>
          </div>
          
          <h2 className="animate-on-scroll stagger-1 text-4xl md:text-5xl font-bold text-gradient mb-6">
            Trusted by Industry Leaders
          </h2>
          
          <p className="animate-on-scroll stagger-2 text-xl text-[var(--brand-300)] max-w-3xl mx-auto">
            From startups to Fortune 500 companies, organizations worldwide trust Kalina AI to deliver exceptional customer experiences and drive business growth.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`animate-on-scroll stagger-${index + 1} glass-card rounded-xl p-6 text-center magnetic-hover`}
            >
              <div className="w-12 h-12 mx-auto mb-4 p-3 bg-gradient-to-br from-[var(--brand-300)] to-[var(--brand-400)] rounded-lg">
                <stat.icon className="w-full h-full text-white" />
              </div>
              
              <div className="text-3xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              
              <div className="text-lg font-semibold text-[var(--brand-400)] mb-1">
                {stat.label}
              </div>
              
              <div className="text-sm text-[var(--brand-300)]">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="animate-on-scroll mb-20">
          <h3 className="text-3xl font-bold text-center text-[var(--brand-400)] mb-12">
            What Our Customers Say
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className={`glass-card rounded-xl p-6 magnetic-hover stagger-${index + 1}`}
              >
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-[var(--brand-400)] mb-6 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--brand-300)] to-[var(--brand-400)] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--brand-400)]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[var(--brand-300)]">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Showcase */}
        <div className="animate-on-scroll">
          <h3 className="text-3xl font-bold text-center text-[var(--brand-400)] mb-12">
            Companies Growing with Kalina AI
          </h3>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {companies.map((company, index) => (
              <div
                key={company.name}
                className={`glass-card rounded-xl p-6 magnetic-hover stagger-${index + 1}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--brand-400)]">
                      {company.name}
                    </h4>
                    <div className="text-sm text-[var(--brand-300)]">
                      {company.industry} • {company.size}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand-200)] to-[var(--brand-300)] rounded-lg"></div>
                </div>
                
                <div className="text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  {company.improvement}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
              <h4 className="text-2xl font-bold text-[var(--brand-400)] mb-4">
                Join Thousands of Satisfied Customers
              </h4>
              <p className="text-[var(--brand-300)] mb-6">
                Start your free trial today and see why leading companies choose Kalina AI for their customer engagement needs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/auth"
                  className="btn-primary btn-magnetic"
                >
                  Start Free Trial
                </a>
                <button className="btn-secondary btn-magnetic">
                  Schedule Demo
                </button>
              </div>
              
              <div className="mt-6 text-sm text-[var(--brand-300)]">
                <div className="flex items-center justify-center space-x-4">
                  <span>✓ No credit card required</span>
                  <span>✓ 14-day free trial</span>
                  <span>✓ Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
