import React from 'react';
import { 
  Sparkles, 
  Twitter, 
  Linkedin, 
  Github, 
  Mail, 
  MapPin, 
  Phone,
  ArrowRight,
  Heart
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Demo", href: "#demo" },
        { name: "Pricing", href: "/pricing" },
        { name: "API Documentation", href: "/docs" },
        { name: "Integrations", href: "/integrations" },
        { name: "Security", href: "/security" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Blog", href: "/blog" },
        { name: "Partners", href: "/partners" },
        { name: "Contact", href: "/contact" }
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Community", href: "/community" },
        { name: "Tutorials", href: "/tutorials" },
        { name: "Webinars", href: "/webinars" },
        { name: "Case Studies", href: "/case-studies" },
        { name: "System Status", href: "/status" }
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "GDPR", href: "/gdpr" },
        { name: "Compliance", href: "/compliance" },
        { name: "Data Processing", href: "/dpa" }
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/kalina-ai", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/kalina-ai", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/kalina-ai", label: "GitHub" },
    { icon: Mail, href: "mailto:hello@kalina-ai.com", label: "Email" }
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[var(--brand-400)] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="morph-shape-1 absolute -top-20 -left-20 w-96 h-96"></div>
        <div className="morph-shape-2 absolute -bottom-20 -right-20 w-80 h-80"></div>
      </div>

      {/* Top Wave */}
      <div className="absolute top-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-20"
        >
          <path
            d="M0,60 C150,30 300,90 600,60 C900,30 1050,90 1200,60 L1200,0 L0,0 Z"
            fill="white"
          ></path>
        </svg>
      </div>

      <div className="container-width px-6 pt-24 pb-8 relative z-10">
        {/* Newsletter Signup */}
        <div className="glass-card-dark rounded-2xl p-8 mb-16 max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Updated with AI Innovation</h3>
          <p className="text-[var(--brand-100)] mb-6 max-w-2xl mx-auto">
            Get the latest updates on AI voice technology, product announcements, and exclusive insights 
            delivered to your inbox weekly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button className="bg-white text-[var(--brand-400)] px-6 py-3 rounded-xl font-semibold hover:bg-[var(--brand-100)] transition-colors btn-magnetic flex items-center justify-center space-x-2">
              <span>Subscribe</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-xs text-[var(--brand-100)] mt-4">
            No spam, unsubscribe at any time. Read our <a href="/privacy" className="underline">Privacy Policy</a>.
          </p>
        </div>

        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="morph-shape-1 w-10 h-10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Kalina AI</span>
            </div>
            
            <p className="text-[var(--brand-100)] mb-6 leading-relaxed">
              Empowering businesses worldwide with intelligent AI voice agents that deliver 
              exceptional customer experiences and drive growth.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 text-sm text-[var(--brand-100)]">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>San Francisco, CA & London, UK</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>hello@kalina-ai.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors btn-magnetic"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-[var(--brand-100)] hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-white/20 pt-8 mb-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-[var(--brand-100)]">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>SOC 2 Certified</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>ISO 27001</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[var(--brand-100)] text-sm text-center md:text-left">
            <p>
              © {currentYear} Kalina AI. All rights reserved. 
              <span className="mx-2">•</span>
              Made with <Heart className="w-4 h-4 inline text-red-400 fill-current" /> for better customer experiences.
            </p>
          </div>

          <div className="flex items-center space-x-6">
            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="text-[var(--brand-100)] hover:text-white transition-colors text-sm flex items-center space-x-2 btn-magnetic"
            >
              <span>Back to top</span>
              <ArrowRight className="w-4 h-4 rotate-[-90deg]" />
            </button>

            {/* Language Selector */}
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>

        {/* Copyright Note */}
        <div className="mt-8 pt-4 border-t border-white/10">
          <p className="text-center text-xs text-[var(--brand-100)]">
            Kalina AI is a trademark of Kalina Technologies Inc. Other company and product names may be trademarks of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
