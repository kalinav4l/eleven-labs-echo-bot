
import React from 'react'
import AIAgentInterface from '@/components/AIAgentInterface'
import HamburgerMenu from '@/components/HamburgerMenu'

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center relative overflow-hidden">
      <HamburgerMenu />
      
      {/* Background Glass Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 w-full">
        <AIAgentInterface />
      </div>
    </div>
  )
}

export default Index
