
import React from 'react'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: "Maria Popescu",
    role: "Director Vânzări",
    company: "TechCorp SRL",
    image: "/placeholder.svg",
    rating: 5,
    text: "Kalina AI a revoluționat modul în care gestionăm apelurile cu clienții. Economia de timp și îmbunătățirea calității serviciilor sunt impresionante."
  },
  {
    name: "Alexandru Ionescu",
    role: "CEO",
    company: "Digital Solutions",
    image: "/placeholder.svg", 
    rating: 5,
    text: "Implementarea agentului vocal AI a crescut satisfacția clienților cu 40%. Este cea mai bună investiție pe care am făcut-o anul acesta."
  },
  {
    name: "Elena Georgescu",
    role: "Manager Customer Service",
    company: "ServicePro",
    image: "/placeholder.svg",
    rating: 5,
    text: "Transcrierea automată și analiza conversațiilor ne-au ajutat să înțelegem mai bine nevoile clienților și să ne îmbunătățim serviciile."
  }
]

const companies = [
  "TechCorp", "Digital Solutions", "ServicePro", "InnovateNow", "FutureWork"
]

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-gray-50/50">
      <div className="container mx-auto px-4">
        {/* Trusted Companies */}
        <div className="text-center mb-16">
          <p className="text-gray-600 mb-8">De încredere pentru aceste companii</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="text-lg font-semibold text-gray-500">
                {company}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ce spun clienții noștri
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="liquid-glass p-8 rounded-xl">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-600 mb-6 italic">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-[#0A5B4C]">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
