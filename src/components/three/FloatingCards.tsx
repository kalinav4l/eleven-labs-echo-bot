'use client'

export function FloatingCards() {
  return (
    <div className="fixed top-20 right-8 w-96 h-64 z-10 pointer-events-none">
      <div className="relative w-full h-full">
        {/* Card 1 */}
        <div className="absolute top-4 right-4 w-20 h-12 bg-gradient-to-br from-brand-200 to-brand-300 rounded-lg flex items-center justify-center text-brand-400 font-semibold transform rotate-12 animate-float">
          Start
        </div>
        
        {/* Card 2 */}
        <div className="absolute top-16 right-16 w-20 h-12 bg-gradient-to-br from-brand-200 to-brand-400 rounded-lg flex items-center justify-center text-brand-100 font-semibold transform -rotate-6 animate-float" style={{ animationDelay: '1s' }}>
          Talk
        </div>
        
        {/* Card 3 */}
        <div className="absolute top-28 right-8 w-20 h-12 bg-gradient-to-br from-brand-300 to-brand-400 rounded-lg flex items-center justify-center text-brand-100 font-semibold transform rotate-3 animate-float" style={{ animationDelay: '2s' }}>
          Decide
        </div>
      </div>
    </div>
  )
}
