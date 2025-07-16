'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOverDemo, setIsOverDemo] = useState(false)
  // Dropdown state for each menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsScrolled(window.scrollY > 50)
      }
    }

    const handleHeaderOverDemo = (event: CustomEvent) => {
      setIsOverDemo(event.detail.isOver)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll)
      window.addEventListener('headerOverDemo', handleHeaderOverDemo as EventListener)
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('headerOverDemo', handleHeaderOverDemo as EventListener)
      }
    }
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 backdrop-blur-xl bg-white/30` +
      (isScrolled 
        ? ' glass border-b border-neutral-200/20' 
        : ' bg-transparent border-b border-transparent')
    } style={{overflow: 'visible'}}>
      <div className="container-width relative z-50">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className={`text-2xl font-bold magnetic-hover text-shimmer animate-gradient transition-colors duration-300 ${
            isOverDemo ? 'text-white' : 'text-brand-400'
          }`}>
            Kalina AI
          </Link>
          <nav className="hidden md:flex items-center space-x-8 z-[100]">
            {/* PRODUCTS DROPDOWN */}
            <div
              className="relative group/menu"
              onMouseEnter={() => setOpenDropdown('products')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`transition-all duration-300 magnetic-hover relative group px-4 py-2 ${
                  isOverDemo ? 'text-white hover:text-gray-200' : 'text-brand-300 hover:text-blue-900'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'products'}
                type="button"
              >
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-900 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div
                className={`absolute left-0 top-full w-56 rounded-xl bg-white shadow-lg z-[200] dropdown ${openDropdown === 'products' ? 'block' : 'hidden'}`}
                role="menu"
                style={{ marginTop: '-1px' }}
              >
                <Link href="/products" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all rounded-t-xl">Motorul AI</Link>
                <Link href="/products" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all">Infrastructura Globală</Link>
                <Link href="/products" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all rounded-b-xl">Suite Enterprise</Link>
              </div>
            </div>
            {/* SOLUTIONS DROPDOWN */}
            <div
              className="relative group/menu"
              onMouseEnter={() => setOpenDropdown('solutions')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`transition-all duration-300 magnetic-hover relative group px-4 py-2 ${
                  isOverDemo ? 'text-white hover:text-gray-200' : 'text-brand-300 hover:text-blue-900'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'solutions'}
                type="button"
              >
                Solutions
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-900 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div
                className={`absolute left-0 top-full w-56 rounded-xl bg-white shadow-lg z-[200] dropdown ${openDropdown === 'solutions' ? 'block' : 'hidden'}`}
                role="menu"
                style={{ marginTop: '-1px' }}
              >
                <Link href="/solutions" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all rounded-t-xl">Call Centers</Link>
                <Link href="/solutions" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all">Remote Work</Link>
                <Link href="/solutions" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all rounded-b-xl">Healthcare</Link>
              </div>
            </div>
            {/* RESEARCH DROPDOWN */}
            <div
              className="relative group/menu"
              onMouseEnter={() => setOpenDropdown('research')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`transition-all duration-300 magnetic-hover relative group px-4 py-2 ${
                  isOverDemo ? 'text-white hover:text-gray-200' : 'text-brand-300 hover:text-blue-900'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'research'}
                type="button"
              >
                Research
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-900 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div
                className={`absolute left-0 top-full w-56 rounded-xl bg-white shadow-lg z-[200] dropdown ${openDropdown === 'research' ? 'block' : 'hidden'}`}
                role="menu"
                style={{ marginTop: '-1px' }}
              >
                <Link href="/research" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all rounded-t-xl">Cercetare AI</Link>
                <Link href="/research" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all">Publicații</Link>
                <Link href="/research" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all rounded-b-xl">Inovații</Link>
              </div>
            </div>
            {/* RESOURCES DROPDOWN */}
            <div
              className="relative group/menu"
              onMouseEnter={() => setOpenDropdown('resources')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className={`transition-all duration-300 magnetic-hover relative group px-4 py-2 ${
                  isOverDemo ? 'text-white hover:text-gray-200' : 'text-brand-300 hover:text-blue-900'
                }`}
                aria-haspopup="true"
                aria-expanded={openDropdown === 'resources'}
                type="button"
              >
                Resources
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-900 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div
                className={`absolute left-0 top-full w-56 rounded-xl bg-white shadow-lg z-[200] dropdown ${openDropdown === 'resources' ? 'block' : 'hidden'}`}
                role="menu"
                style={{ marginTop: '-1px' }}
              >
                <Link href="/resources" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all rounded-t-xl">Documentație</Link>
                <Link href="/resources" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all">Tutoriale</Link>
                <Link href="/resources" className="block px-6 py-3 text-brand-300 hover:text-blue-900 hover:bg-blue-100/20 transition-all rounded-b-xl">Suport</Link>
              </div>
            </div>
            {/* Restul linkurilor simple */}
            <Link href="/pricing" className={`transition-all duration-300 magnetic-hover relative group px-4 py-2 ${
              isOverDemo ? 'text-white hover:text-gray-200' : 'text-brand-300 hover:text-blue-900'
            }`}>
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/company" className={`transition-all duration-300 magnetic-hover relative group px-4 py-2 ${
              isOverDemo ? 'text-white hover:text-gray-200' : 'text-brand-300 hover:text-blue-900'
            }`}>
              Company
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-900 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          
          <button className="btn-primary btn-magnetic animate-pulse-glow">
            Get Started
          </button>
        </div>
      </div>
    </header>
  )
}
