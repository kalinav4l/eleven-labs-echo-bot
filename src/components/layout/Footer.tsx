'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'
import { Button } from '@/components/ui/Button'

export function Footer() {
  const { ref, classes, isVisible } = useScrollReveal('up')

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", icon: "⚡" },
        { name: "Pricing", icon: "💰" },
        { name: "Demo", icon: "🎥" },
        { name: "API", icon: "🔧" }
      ]
    },
    {
      title: "Company", 
      links: [
        { name: "About", icon: "ℹ️" },
        { name: "Careers", icon: "🚀" },
        { name: "Contact", icon: "📧" },
        { name: "Blog", icon: "📝" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Documentation", icon: "📚" },
        { name: "Help Center", icon: "🆘" },
        { name: "Status", icon: "📊" },
        { name: "Community", icon: "👥" }
      ]
    }
  ]

  const socialLinks = [
    { name: "Twitter", icon: "🐦", url: "#" },
    { name: "LinkedIn", icon: "💼", url: "#" },
    { name: "GitHub", icon: "⚡", url: "#" },
    { name: "Discord", icon: "💬", url: "#" }
  ]

  return (
    <footer className="bg-gray-100 relative overflow-hidden">
      <div className="container mx-auto px-6 py-20 relative z-10" ref={ref}>
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className={`space-y-4 transition-all duration-700 ${classes}`}>
            <div className="text-2xl font-bold text-gray-900">
              Kalina AI
            </div>
            <p className="text-gray-600 leading-relaxed">
              Crystal-clear AI calls, anywhere in the world. Revolutionizing global communications.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center hover:scale-110 hover:border-cyan-600 transition-all duration-300"
                  title={social.name}
                >
                  <span className="text-gray-600 hover:text-cyan-600 transition-colors">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
          
          {/* Footer sections */}
          {footerSections.map((section, sectionIndex) => (
            <div 
              key={sectionIndex}
              className={`space-y-4 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: `${(sectionIndex + 1) * 200}ms`
              }}
            >
              <h3 className="font-semibold text-gray-900">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href="#"
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-300 group"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Newsletter signup */}
        <div className={`mt-12 pt-8 border-t border-gray-200 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-soft">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🚀 Stay Updated
            </h3>
            <p className="text-gray-600 mb-6">
              Get the latest news about AI calling technology and platform updates
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-l-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-cyan-600 transition-colors"
              />
              <Button variant="primary" className="rounded-l-none">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className={`border-t border-gray-200 mt-12 pt-8 text-center transition-all duration-1000 delay-900 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600">
              &copy; 2024 Kalina AI. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
