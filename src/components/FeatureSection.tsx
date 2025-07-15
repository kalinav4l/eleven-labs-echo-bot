'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'

interface FeatureSectionProps {
  title: string
  body: string
  imgSrc: string
  imgAlt: string
}

export function FeatureSection({ title, body, imgSrc, imgAlt }: FeatureSectionProps) {
  const textReveal = useScrollReveal('left')
  const imageReveal = useScrollReveal('right')

  console.log('FeatureSection render - Text visible:', textReveal.isVisible, 'Image visible:', imageReveal.isVisible)
  console.log('Text classes:', textReveal.classes)
  console.log('Image classes:', imageReveal.classes)

  return (
    <section className="section-padding">
      <div className="container-width">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Text Content - Left Side on Desktop, Bottom on Mobile */}
          <div 
            ref={textReveal.ref}
            className={`lg:col-span-6 max-w-xl order-2 lg:order-1 ${textReveal.classes}`}
            style={{ border: textReveal.isVisible ? '2px solid green' : '2px solid red' }}
          >
            <h3 className="text-3xl lg:text-4xl font-bold text-brand-400 mb-6">
              {title}
            </h3>
            <p className="text-lg text-brand-300 leading-relaxed">
              {body}
            </p>
            <div className="text-xs text-gray-500 mt-2">
              Visible: {textReveal.isVisible ? 'YES' : 'NO'} | Classes: {textReveal.classes}
            </div>
          </div>
          
          {/* Image - Right Side on Desktop, Top on Mobile */}
          <div 
            ref={imageReveal.ref}
            className={`lg:col-span-6 order-1 lg:order-2 delay-150 ${imageReveal.classes}`}
            style={{ border: imageReveal.isVisible ? '2px solid green' : '2px solid red' }}
          >
            <img 
              src={imgSrc}
              alt={imgAlt}
              className="w-full h-auto object-contain rounded-xl drop-shadow-lg"
            />
            <div className="text-xs text-gray-500 mt-2">
              Visible: {imageReveal.isVisible ? 'YES' : 'NO'} | Classes: {imageReveal.classes}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
