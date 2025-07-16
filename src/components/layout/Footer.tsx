'use client'

import { useScrollReveal } from '@/hooks/useScrollReveal'

export function Footer() {
  const { ref, classes, isVisible } = useScrollReveal('up')

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features" },
        { name: "Pricing" },
        { name: "Demo" },
        { name: "API" }
      ]
    },
    {
      title: "Company", 
      links: [
        { name: "About" },
        { name: "Careers" },
        { name: "Contact" },
        { name: "Blog" }
      ]
    },
    {
      title: "Support",
      links: [
        { name: "Documentation" },
        { name: "Help Center" },
        { name: "Status" },
        { name: "Community" }
      ]
    }
  ]

  const socialLinks = [
    { name: "Twitter", url: "#" },
    { name: "LinkedIn", url: "#" },
    { name: "GitHub", url: "#" },
    { name: "Discord", url: "#" }
  ]

  return (
    <footer className="bg-gray-950 border-t border-slate-800/50 relative overflow-hidden">
      {/* Subtle background animation */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-500/5 via-transparent to-transparent"></div>
      <div className="morph-shape-2 absolute top-10 right-20 opacity-10"></div>
      
      <div className="container-width section-padding relative z-10" ref={ref}>
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className={`space-y-4 transition-all duration-700 ${classes}`}>
            <div className="text-2xl font-bold text-brand-100 text-shimmer magnetic-hover">
              Kalina AI
            </div>
            <p className="text-brand-100 leading-relaxed">
              Crystal-clear AI calls, anywhere in the world. Revolutionizing global communications.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className="w-10 h-10 glass-card rounded-lg flex items-center justify-center magnetic-hover group transition-all duration-300 hover:scale-110"
                  title={social.name}
                >
                  <span className="group-hover:scale-125 transition-transform duration-300">
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
              <h3 className="font-semibold text-brand-100 text-glow">
                {section.title}
              </h3>
              <div className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href="#"
                    className="flex items-center space-x-2 text-brand-100 hover:text-brand-100 transition-all duration-300 magnetic-hover group"
                  >
                    <span className="group-hover:scale-110 transition-transform duration-300">
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
        <div className={`mt-12 pt-8 border-t border-slate-100/50 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="glass-card rounded-2xl p-8 text-center magnetic-hover">
            <h3 className="text-xl font-semibold text-brand-100 mb-4 text-glow">
              Stay Updated
            </h3>
            <p className="text-brand-100 mb-6">
              Get the latest news about AI calling technology and platform updates
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-slate-100 border border-slate-100 rounded-l-lg text-brand-100 placeholder-brand-300 focus:outline-none focus:border-brand-300 transition-colors"
              />
              <button className="btn-primary px-6 py-2 rounded-l-none btn-magnetic">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className={`border-t border-slate-800/50 mt-12 pt-8 text-center transition-all duration-1000 delay-900 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-brand-100">
              &copy; 2024 Kalina AI. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-brand-100 hover:text-brand-100 transition-colors magnetic-hover">
                Privacy Policy
              </a>
              <a href="#" className="text-brand-100 hover:text-brand-100 transition-colors magnetic-hover">
                Terms of Service
              </a>
              <a href="#" className="text-brand-100 hover:text-brand-100 transition-colors magnetic-hover">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
