'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

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
      className={`bg-white border border-gray-200 rounded-xl p-8 lg:p-12 transition-all duration-700 hover:-translate-y-1 hover:shadow-md ${cardReveal.classes}`}
      style={{ 
        transitionDelay: `${index * 150}ms`,
        boxShadow: isHovered ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'var(--shadow-soft)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-4 group">
          <img 
            src={imgSrc}
            alt={imgAlt}
            className="w-full h-auto object-cover rounded-lg shadow-lg transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 bg-cyan-50 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-cyan-600">Feature {index + 1}</span>
        </div>
        
        <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
          {title}
        </h3>
        
        <p className="text-lg text-gray-700 leading-relaxed">
          {body}
        </p>
        
        <Button variant="secondary" className="group">
          Learn More
          <span className="ml-2 transition-transform duration-300 group-hover:translate-x-2">→</span>
        </Button>
      </div>
    </div>
  )
}

export function StackedFeatureSections() {
  const titleReveal = useScrollReveal('up', 0.3)
  
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
    <section className="relative px-6 py-20 overflow-hidden">
      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div 
          ref={titleReveal.ref}
          className={`text-center mb-20 ${titleReveal.classes}`}
        >
          <div className="inline-flex items-center gap-2 bg-cyan-50 px-6 py-3 rounded-full text-base text-cyan-600 mb-6">
            <span className="text-cyan-600 animate-pulse">⚡</span>
            Advanced AI Features
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Cutting-Edge Technology
          </h2>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discover the powerful features that make Kalina AI the most advanced voice communication platform in the world.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
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
    </section>
  )
}