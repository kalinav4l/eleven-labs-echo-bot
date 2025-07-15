'use client'

import { useRef, useState, useEffect } from 'react'

interface FeatureSectionProps {
  title: string
  body: string
  imgSrc: string
  imgAlt: string
}

export function FeatureSection({ title, body, imgSrc, imgAlt }: FeatureSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.25 }
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} className="section-padding">
      <div className="container-width">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Text Content - Left Side on Desktop, Bottom on Mobile */}
          <div className={`lg:col-span-6 max-w-xl transition-all duration-500 ease-out order-2 lg:order-1 ${
            visible 
              ? 'opacity-100 lg:translate-x-0' 
              : 'opacity-0 lg:-translate-x-10'
          }`}>
            <h3 className="text-3xl lg:text-4xl font-bold text-brand-400 mb-6">
              {title}
            </h3>
            <p className="text-lg text-brand-300 leading-relaxed">
              {body}
            </p>
          </div>
          
          {/* Image - Right Side on Desktop, Top on Mobile */}
          <div className={`lg:col-span-6 transition-all duration-500 ease-out delay-150 order-1 lg:order-2 ${
            visible 
              ? 'opacity-100 lg:translate-x-0' 
              : 'opacity-0 lg:translate-x-10'
          }`}>
            <img 
              src={imgSrc}
              alt={imgAlt}
              className="w-full h-auto object-contain rounded-xl drop-shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
