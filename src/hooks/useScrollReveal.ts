'use client'

import { useRef, useState, useEffect } from 'react'

type RevealDirection = 'left' | 'right'

export function useScrollReveal(direction: RevealDirection) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.25 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  const baseClasses = direction === 'left' ? 'reveal-left' : 'reveal-right'
  const classes = isVisible ? `${baseClasses} reveal-show` : baseClasses

  return { ref, classes, isVisible }
}
