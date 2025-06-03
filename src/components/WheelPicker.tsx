
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface WheelPickerProps {
  items: { id: string; name: string }[]
  selectedValue: string
  onSelectionChange: (value: string) => void
  className?: string
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  items,
  selectedValue,
  onSelectionChange,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemHeight = 44
  const visibleItems = 5
  const containerHeight = itemHeight * visibleItems

  // Find initial index
  useEffect(() => {
    const index = items.findIndex(item => item.id === selectedValue)
    if (index !== -1) {
      setCurrentIndex(index)
      setScrollTop(index * itemHeight)
    }
  }, [selectedValue, items])

  // Create tick sound effect
  const playTickSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.05)
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.05)
    } catch (error) {
      // Fallback if AudioContext fails
      console.log('tick')
    }
  }, [])

  // Snap to nearest item
  const snapToNearest = useCallback((targetScrollTop: number) => {
    const targetIndex = Math.round(targetScrollTop / itemHeight)
    const clampedIndex = Math.max(0, Math.min(items.length - 1, targetIndex))
    const finalScrollTop = clampedIndex * itemHeight
    
    if (clampedIndex !== currentIndex) {
      setCurrentIndex(clampedIndex)
      onSelectionChange(items[clampedIndex].id)
      playTickSound()
    }
    
    setScrollTop(finalScrollTop)
    return finalScrollTop
  }, [currentIndex, items, onSelectionChange, playTickSound])

  // Handle wheel scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 1 : -1
    const newIndex = Math.max(0, Math.min(items.length - 1, currentIndex + delta))
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
      setScrollTop(newIndex * itemHeight)
      onSelectionChange(items[newIndex].id)
      playTickSound()
    }
  }, [currentIndex, items, onSelectionChange, playTickSound])

  // Handle mouse/touch start
  const handleStart = (clientY: number) => {
    setIsDragging(true)
    setStartY(clientY)
    setVelocity(0)
  }

  // Handle mouse/touch move
  const handleMove = useCallback((clientY: number) => {
    if (!isDragging) return
    
    const deltaY = startY - clientY
    const newScrollTop = Math.max(0, Math.min((items.length - 1) * itemHeight, scrollTop + deltaY))
    setScrollTop(newScrollTop)
    setVelocity(deltaY)
  }, [isDragging, startY, scrollTop, items.length])

  // Handle mouse/touch end
  const handleEnd = useCallback(() => {
    setIsDragging(false)
    
    // Apply momentum and snap
    let finalScrollTop = scrollTop + velocity * 5
    finalScrollTop = snapToNearest(finalScrollTop)
  }, [scrollTop, velocity, snapToNearest])

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientY)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientY)
  }, [handleMove])

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY)
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    handleMove(e.touches[0].clientY)
  }, [handleMove])

  const handleTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Add event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Add wheel listener
    container.addEventListener('wheel', handleWheel, { passive: false })

    // Add global drag listeners when dragging
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      container.removeEventListener('wheel', handleWheel)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleWheel, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  // Render items with iPhone-style appearance
  const renderItems = () => {
    const centerIndex = scrollTop / itemHeight
    const extendedItems = []
    
    // Create extended list for smooth scrolling
    for (let i = -2; i < items.length + 2; i++) {
      const item = items[i] || { id: '', name: '' }
      const distance = Math.abs(i - centerIndex)
      const opacity = Math.max(0.3, 1 - distance * 0.4)
      const scale = Math.max(0.8, 1 - distance * 0.1)
      const isSelected = Math.round(centerIndex) === i
      
      extendedItems.push(
        <div
          key={`${item.id}-${i}`}
          className={cn(
            "absolute inset-x-0 flex items-center justify-center text-2xl font-light transition-all duration-150",
            isSelected ? "text-white font-normal" : "text-gray-400"
          )}
          style={{
            height: `${itemHeight}px`,
            top: `${i * itemHeight - scrollTop + containerHeight / 2 - itemHeight / 2}px`,
            opacity: item.name ? opacity : 0,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            zIndex: isSelected ? 10 : 1
          }}
        >
          {item.name}
        </div>
      )
    }
    
    return extendedItems
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={containerRef}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{
          height: `${containerHeight}px`,
          background: 'linear-gradient(to bottom, rgba(55,65,81,0.8) 0%, rgba(31,41,55,0.9) 20%, rgba(17,24,39,0.95) 50%, rgba(31,41,55,0.9) 80%, rgba(55,65,81,0.8) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(75,85,99,0.3)'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Selection indicator - iPhone style */}
        <div
          className="absolute inset-x-0 pointer-events-none z-20"
          style={{
            top: `${containerHeight / 2 - itemHeight / 2}px`,
            height: `${itemHeight}px`,
            background: 'rgba(255,255,255,0.05)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(1px)'
          }}
        />
        
        {/* Items container */}
        <div className="relative w-full h-full">
          {renderItems()}
        </div>
      </div>
    </div>
  )
}
