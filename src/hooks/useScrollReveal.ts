'use client'

import { useRef, useState, useEffect } from 'react'

type RevealDirection = 'left' | 'right'

export function useScrollReveal(direction: RevealDirection) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    console.log('Setting up IntersectionObserver for direction:', direction)
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('Intersection detected:', entry.isIntersecting, 'ratio:', entry.intersectionRatio)
        if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
          setIsVisible(true)
          console.log('Setting visible to true for direction:', direction)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
      console.log('Observer attached to element')
    }

    return () => {
      observer.disconnect()
      console.log('Observer disconnected')
    }
  }, [direction])

  const baseClasses = direction === 'left' ? 'reveal-left' : 'reveal-right'
  const classes = isVisible ? `${baseClasses} reveal-show` : baseClasses

  console.log('Generated classes:', classes, 'for direction:', direction, 'visible:', isVisible)

  return { ref, classes, isVisible }
}
