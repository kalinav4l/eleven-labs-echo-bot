'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  // Dropdown state for each menu
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 left-0 right-0 z-[9999] transition-all duration-500 backdrop-blur-sm` +
      (isScrolled 
        ? ' bg-white/80 border-b border-gray-200/20' 
        : ' bg-white/80 border-b border-transparent')
    } style={{overflow: 'visible'}}>
      <div className="container mx-auto px-6 relative z-50">
        <div className="flex items-center justify-between h-16">
          <div className="text-2xl font-bold text-gray-900">
            Kalina AI
          </div>
          <nav className="hidden md:flex items-center space-x-8 z-[100]">
            {/* PRODUCTS DROPDOWN */}
            <div
              className="relative group/menu"
              onMouseEnter={() => setOpenDropdown('products')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group px-4 py-2"
                aria-haspopup="true"
                aria-expanded={openDropdown === 'products'}
                type="button"
              >
                Products
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div
                className={`absolute left-0 top-full w-56 rounded-xl bg-white shadow-lg border border-gray-200 z-[200] ${openDropdown === 'products' ? 'block' : 'hidden'}`}
                role="menu"
                style={{ marginTop: '-1px' }}
              >
                <a href="#prod1" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all rounded-t-xl">Product 1</a>
                <a href="#prod2" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all">Product 2</a>
                <a href="#prod3" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all rounded-b-xl">Product 3</a>
              </div>
            </div>
            {/* SOLUTIONS DROPDOWN */}
            <div
              className="relative group/menu"
              onMouseEnter={() => setOpenDropdown('solutions')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group px-4 py-2"
                aria-haspopup="true"
                aria-expanded={openDropdown === 'solutions'}
                type="button"
              >
                Solutions
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div
                className={`absolute left-0 top-full w-56 rounded-xl bg-white shadow-lg border border-gray-200 z-[200] ${openDropdown === 'solutions' ? 'block' : 'hidden'}`}
                role="menu"
                style={{ marginTop: '-1px' }}
              >
                <a href="#sol1" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all rounded-t-xl">Solution 1</a>
                <a href="#sol2" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all">Solution 2</a>
                <a href="#sol3" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all rounded-b-xl">Solution 3</a>
              </div>
            </div>
            {/* RESEARCH DROPDOWN */}
            <div
              className="relative group/menu"
              onMouseEnter={() => setOpenDropdown('research')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group px-4 py-2"
                aria-haspopup="true"
                aria-expanded={openDropdown === 'research'}
                type="button"
              >
                Research
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div
                className={`absolute left-0 top-full w-56 rounded-xl bg-white shadow-lg border border-gray-200 z-[200] ${openDropdown === 'research' ? 'block' : 'hidden'}`}
                role="menu"
                style={{ marginTop: '-1px' }}
              >
                <a href="#res1" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all rounded-t-xl">Research 1</a>
                <a href="#res2" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all">Research 2</a>
                <a href="#res3" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all rounded-b-xl">Research 3</a>
              </div>
            </div>
            {/* RESOURCES DROPDOWN */}
            <div
              className="relative group/menu"
              onMouseEnter={() => setOpenDropdown('resources')}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button
                className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group px-4 py-2"
                aria-haspopup="true"
                aria-expanded={openDropdown === 'resources'}
                type="button"
              >
                Resources
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <div
                className={`absolute left-0 top-full w-56 rounded-xl bg-white shadow-lg border border-gray-200 z-[200] ${openDropdown === 'resources' ? 'block' : 'hidden'}`}
                role="menu"
                style={{ marginTop: '-1px' }}
              >
                <a href="#resrc1" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all rounded-t-xl">Resource 1</a>
                <a href="#resrc2" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all">Resource 2</a>
                <a href="#resrc3" className="block px-6 py-3 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 transition-all rounded-b-xl">Resource 3</a>
              </div>
            </div>
            {/* Simple links */}
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group px-4 py-2">
              Pricing
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#company" className="text-gray-700 hover:text-gray-900 transition-all duration-300 relative group px-4 py-2">
              Company
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-600 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>
          
          <Button variant="primary">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
