
import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface WheelPickerProps {
  items: { id: string; name: string }[]
  selectedId: string
  onSelect: (id: string) => void
  onClose: () => void
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  items,
  selectedId,
  onSelect,
  onClose
}) => {
  const [selectedIndex, setSelectedIndex] = useState(
    items.findIndex(item => item.id === selectedId)
  )
  const wheelRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const currentY = useRef(0)
  const velocity = useRef(0)
  const lastTime = useRef(0)
  const animationRef = useRef<number>()

  // Sunet de feedback (simulat cu Web Audio API)
  const playTickSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (e) {
      // Fallback pentru browsere care nu suportă Web Audio API
      console.log('tick')
    }
  }

  const updateSelection = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(items.length - 1, Math.round(index)))
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex)
      onSelect(items[clampedIndex].id)
      playTickSound()
    }
  }

  const handleStart = (clientY: number) => {
    isDragging.current = true
    startY.current = clientY
    currentY.current = 0
    velocity.current = 0
    lastTime.current = Date.now()
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }

  const handleMove = (clientY: number) => {
    if (!isDragging.current) return
    
    const deltaY = clientY - startY.current
    const now = Date.now()
    const deltaTime = now - lastTime.current
    
    if (deltaTime > 0) {
      velocity.current = (deltaY - currentY.current) / deltaTime
    }
    
    currentY.current = deltaY
    lastTime.current = now
    
    const itemHeight = 50
    const newIndex = selectedIndex - deltaY / itemHeight
    
    if (wheelRef.current) {
      wheelRef.current.style.transform = `translateY(${-deltaY}px)`
    }
  }

  const handleEnd = () => {
    if (!isDragging.current) return
    isDragging.current = false
    
    const itemHeight = 50
    let newIndex = selectedIndex - currentY.current / itemHeight
    
    // Aplicăm inerția
    if (Math.abs(velocity.current) > 0.1) {
      newIndex -= velocity.current * 100
    }
    
    newIndex = Math.max(0, Math.min(items.length - 1, Math.round(newIndex)))
    
    // Animație de revenire
    const animate = () => {
      const targetY = 0
      if (wheelRef.current) {
        const currentTransform = wheelRef.current.style.transform
        const currentY = currentTransform ? parseFloat(currentTransform.match(/-?\d+\.?\d*/)?.[0] || '0') : 0
        const diff = targetY - currentY
        
        if (Math.abs(diff) > 1) {
          wheelRef.current.style.transform = `translateY(${currentY + diff * 0.15}px)`
          animationRef.current = requestAnimationFrame(animate)
        } else {
          wheelRef.current.style.transform = `translateY(0px)`
          updateSelection(newIndex)
        }
      }
    }
    
    animate()
    currentY.current = 0
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientY)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    handleMove(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    handleEnd()
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => handleEnd()
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging.current) handleMove(e.clientY)
    }
    
    document.addEventListener('mouseup', handleGlobalMouseUp)
    document.addEventListener('mousemove', handleGlobalMouseMove)
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Alege Asistent</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Wheel Picker */}
        <div className="relative h-64 overflow-hidden">
          {/* Selection indicator */}
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-12 bg-gray-700 bg-opacity-50 rounded-lg border-t border-b border-gray-600 pointer-events-none z-10" />
          
          {/* Items */}
          <div
            ref={wheelRef}
            className="relative cursor-grab active:cursor-grabbing select-none"
            style={{ transform: 'translateY(0px)' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Padding items pentru centru */}
            <div style={{ height: '106px' }} />
            
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "h-12 flex items-center justify-center text-lg transition-all duration-200",
                  index === selectedIndex
                    ? "text-white font-semibold scale-110"
                    : "text-gray-400 scale-95"
                )}
                style={{
                  opacity: Math.max(0.3, 1 - Math.abs(index - selectedIndex) * 0.3)
                }}
              >
                {item.name}
              </div>
            ))}
            
            {/* Padding items pentru centru */}
            <div style={{ height: '106px' }} />
          </div>
        </div>

        {/* Confirmă buton */}
        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-colors"
        >
          Confirmă
        </button>
      </div>
    </div>
  )
}
