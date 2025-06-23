
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const navigate = useNavigate()

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-[#0A5B4C] to-teal-600 rounded-lg"></div>
              <span className="text-xl font-bold">Kalina AI</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Platforma AI care transformă interacțiunile cu clienții prin automatizare inteligentă și voci personalizate.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Twitter
              </a>
            </div>
          </div>

          {/* Integrations */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Integrări</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Webhooks</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">CRM Connectors</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Database Integration</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Companie</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Despre Noi</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cariere</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Presă</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Resurse</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentație</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutoriale</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Suport</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Kalina AI. Toate drepturile rezervate.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Termeni și Condiții
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Politica de Confidențialitate
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              GDPR
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
