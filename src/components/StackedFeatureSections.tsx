'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useState, useEffect, useRef } from 'react'

// Reusable grid background component
interface GridBackgroundProps {
  top?: string
  left?: string
  right?: string
  bottom?: string
  width?: string
  height?: string
  className?: string
  sectionRef?: React.RefObject<HTMLElement>
}

function GridBackground({ top, left, right, bottom, width = '100%', height = '100%', className = '', sectionRef }: GridBackgroundProps) {
  const [scrollY, setScrollY] = useState(0)
  const [sectionBounds, setSectionBounds] = useState({ top: 0, bottom: 0 })

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setScrollY(window.scrollY)
      }
    }
    const handleResize = () => {
      if (sectionRef?.current && typeof window !== 'undefined') {
        const rect = sectionRef.current.getBoundingClientRect()
        setSectionBounds({
          top: window.scrollY + rect.top,
          bottom: window.scrollY + rect.bottom
        })
      }
    }
    // Set initial bounds
    handleResize()
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [sectionRef])

  // Calculate if grid should be visible (within section bounds)
  const isInSection = typeof window !== 'undefined' 
    ? scrollY >= sectionBounds.top + 800 - window.innerHeight &&
      scrollY <= sectionBounds.bottom - 800
    : false

  return (
    <div
      className={`pointer-events-none fixed ${className}`}
      style={{
        top: '20vh',
        left: '60%',
        width: '35vw',
        height: '60vh',
        zIndex: 10,
        opacity: isInSection ? 1 : 0,
        transition: 'opacity 3s cubic-bezier(0.19, 1, 0.22, 1)',
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 30 30 M 0 30 L 30 30" fill="none" stroke="#000" strokeWidth="0.7" opacity="0.1" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(#grid)" opacity="1" />
      </svg>
    </div>
  )
}

interface FeatureCardProps {
  title: string
  body: string
  imgSrc: string
  imgAlt: string
  index: number
}

function FeatureCard({ title, body, imgSrc, imgAlt, index }: FeatureCardProps) {
  const cardReveal = useScrollReveal('up', 0.2)
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      ref={cardReveal.ref}
      className={`feature-card glass-card rounded-3xl p-8 lg:p-12 transition-all duration-700 ${cardReveal.classes}`}
      style={{ 
        transitionDelay: `${index * 150}ms`,
        transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Image */}
        <div className={`${index % 2 === 0 ? 'order-1' : 'order-1 lg:order-2'}`}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-200/20 to-brand-400/20 p-1 group">
            <div className="relative overflow-hidden rounded-xl bg-white/5 group-hover:bg-white/10 transition-all duration-500">
              <img 
                src={imgSrc}
                alt={imgAlt}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-400/30 to-transparent group-hover:from-brand-400/20 transition-all duration-500"></div>
              
              {/* Animated overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className={`space-y-6 ${index % 2 === 0 ? 'order-2' : 'order-2 lg:order-1'}`}>
          <div className="inline-flex items-center gap-2 bg-brand-300/20 px-4 py-2 rounded-full animate-pulse-glow">
            <div className="w-2 h-2 bg-brand-300 rounded-full animate-pulse loading-dots"></div>
            <span className="text-sm font-medium text-brand-300">Feature {index + 1}</span>
          </div>
          
          <h3 className="text-3xl lg:text-4xl font-bold text-brand-400 leading-tight text-glow">
            {title}
          </h3>
          
          <p className="text-lg text-brand-300 leading-relaxed">
            {body}
          </p>
          
          <button className="btn-secondary btn-magnetic group inline-flex items-center gap-2">
            Learn More
            <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110"></span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function StackedFeatureSections() {
  const titleReveal = useScrollReveal('up', 0.3)
  const sectionRef = useRef<HTMLElement>(null)
  
  const features = [
    {
      title: "Instant Voice Cloning",
      body: "Revolutionary AI technology that captures and replicates voice patterns in real-time, enabling personalized communication experiences with unprecedented accuracy and natural sound quality.",
      imgSrc: "/assets/voice-clone.png",
      imgAlt: "Voice cloning technology illustration"
    },
    {
      title: "Multimodal Search",
      body: "Advanced search capabilities that understand voice, text, and visual inputs simultaneously, providing intelligent results across all communication channels with contextual understanding.",
      imgSrc: "/assets/multimodal-search.png",
      imgAlt: "Multimodal search interface"
    },
    {
      title: "Edge-Ready Deployment",
      body: "Optimized for edge computing environments with automatic scaling, minimal latency, and seamless integration across distributed networks for maximum performance and reliability.",
      imgSrc: "/assets/edge-deploy.png",
      imgAlt: "Edge deployment architecture diagram"
    },
    {
      title: "Private Knowledge Vaults",
      body: "Secure, encrypted storage solutions that keep your sensitive communications and data completely private while enabling intelligent search and retrieval across your organization.",
      imgSrc: "/assets/knowledge-vault.png",
      imgAlt: "Private knowledge vault security interface"
    }
  ]

  return (
    <section ref={sectionRef} className="section-padding bg-gradient-to-b from-transparent via-brand-100/5 to-transparent relative overflow-hidden">
      {/* Grid background - positioned at center-left and follows scroll */}
      <GridBackground
        sectionRef={sectionRef}
        className="opacity-100"
      />
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20 z-10">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-br from-brand-200/30 to-brand-300/30 rounded-full morphing-shape animate-float"></div>
        <div className="absolute bottom-40 right-20 w-32 h-32 bg-gradient-to-br from-brand-300/20 to-brand-400/20 rounded-full morphing-shape animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container-width relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Left Side - Feature Cards */}
          <div className="lg:col-span-7">
            <div className="space-y-16 lg:space-y-24">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  index={index}
                  title={feature.title}
                  body={feature.body}
                  imgSrc={feature.imgSrc}
                  imgAlt={feature.imgAlt}
                />
              ))}
            </div>
          </div>        
        </div>
      </div>
    </section>
  )
}