'use client'

import { useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { Button } from '@/components/ui/Button'

export function FAQ() {
  const { ref, classes, isVisible } = useScrollReveal('up')
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  
  const faqs = [
    {
      question: "What is the latency of your calls?",
      answer: "Our AI-enhanced infrastructure delivers sub-100ms latency globally, ensuring real-time conversations.",
      icon: "⚡"
    },
    {
      question: "How secure are the calls?",
      answer: "All calls use end-to-end encryption with military-grade security protocols to protect your communications.",
      icon: "🔒"
    },
    {
      question: "What countries do you support?",
      answer: "We provide reliable coverage in 120+ countries with local infrastructure for optimal performance.",
      icon: "🌍"
    },
    {
      question: "Can I integrate with my existing systems?",
      answer: "Yes, we offer comprehensive APIs and SDKs for seamless integration with your current infrastructure.",
      icon: "🔧"
    }
  ]

  return (
    <section className="px-6 py-20 relative overflow-hidden">
      <div className="container mx-auto" ref={ref}>
        <div className={`text-center mb-16 ${classes}`}>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Everything you need to know about our AI-enhanced calling platform
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{
                transitionDelay: `${index * 150}ms`
              }}
            >
              <button
                className="w-full py-4 border-b border-gray-200 text-left focus:outline-none group hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-center justify-between px-6">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                      {faq.icon}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {faq.question}
                    </h3>
                  </div>
                  <div className={`text-cyan-600 text-2xl transition-transform duration-300 ${
                    openIndex === index ? 'rotate-45' : 'rotate-0'
                  }`}>
                    +
                  </div>
                </div>
              </button>
              
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                openIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="bg-gray-50 rounded-lg p-4 mx-6 mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contact support card */}
        <div className={`mt-12 text-center transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}>
          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-md mx-auto shadow-soft">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-700 mb-6">
              Our support team is here to help 24/7
            </p>
            <Button variant="primary">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
