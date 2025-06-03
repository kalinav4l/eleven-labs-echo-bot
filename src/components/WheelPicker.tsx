
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
  const itemHeight = 60
  const visibleItems = 7
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
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.log('Audio context not available')
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
    const delta = e.deltaY > 0 ? itemHeight : -itemHeight
    const newScrollTop = Math.max(0, Math.min((items.length - 1) * itemHeight, scrollTop + delta))
    setScrollTop(newScrollTop)
    
    // Debounce snap to prevent too many sounds
    setTimeout(() => {
      snapToNearest(newScrollTop)
    }, 100)
  }, [scrollTop, items.length, snapToNearest])

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
    
    // Apply momentum
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

  // Add global event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    // Add wheel listener
    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      container.removeEventListener('wheel', handleWheel)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, handleWheel])

  // Render items with 3D effect
  const renderItems = () => {
    const centerIndex = scrollTop / itemHeight
    const extendedItems = []
    
    // Add padding items for smooth scrolling
    for (let i = -3; i < items.length + 3; i++) {
      const item = items[i] || { id: '', name: '' }
      const distance = Math.abs(i - centerIndex)
      const opacity = Math.max(0.1, 1 - distance * 0.4)
      const scale = Math.max(0.6, 1 - distance * 0.15)
      const rotateX = (i - centerIndex) * 8 // 3D rotation effect
      const isSelected = Math.round(centerIndex) === i
      
      if (item.name) { // Only render items that have content
        extendedItems.push(
          <div
            key={`${item.id}-${i}`}
            className={cn(
              "absolute inset-x-0 flex items-center justify-center text-3xl font-medium transition-all duration-150",
              isSelected ? "text-white font-bold" : "text-gray-400"
            )}
            style={{
              height: `${itemHeight}px`,
              top: `${i * itemHeight - scrollTop + containerHeight / 2 - itemHeight / 2}px`,
              opacity,
              transform: `scale(${scale}) rotateX(${rotateX}deg)`,
              transformOrigin: 'center center',
              zIndex: isSelected ? 10 : 1
            }}
          >
            {item.name}
          </div>
        )
      }
    }
    
    return extendedItems
  }

  return (
    <div className={cn("relative bg-gray-900/50 rounded-2xl border border-gray-700", className)}>
      <div
        ref={containerRef}
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          height: `${containerHeight}px`,
          perspective: '1000px'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Selection indicator */}
        <div
          className="absolute inset-x-4 border-t border-b border-gray-600 bg-gray-800/40 backdrop-blur-sm pointer-events-none z-20 rounded-lg"
          style={{
            top: `${containerHeight / 2 - itemHeight / 2}px`,
            height: `${itemHeight}px`
          }}
        />
        
        {/* Items */}
        <div
          className="relative"
          style={{
            transform: 'translateZ(0)',
            transformStyle: 'preserve-3d'
          }}
        >
          {renderItems()}
        </div>
      </div>
    </div>
  )
}
