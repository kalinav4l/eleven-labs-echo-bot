
import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "Cât de greu este să configurez un agent vocal AI?",
    answer: "Configurarea unui agent vocal AI cu Kalina este extrem de simplă. În doar câțiva pași poți avea un agent funcțional: încarcă documentele, personalizează vocea și mesajele, apoi testează agentul. Întregul proces durează mai puțin de 10 minute."
  },
  {
    question: "Pot să folosesc vocea mea pentru agent?",
    answer: "Da, poți clona vocea ta folosind tehnologia noastră avansată de sinteză vocală. Ai nevoie doar de câteva minute de înregistrare pentru a crea o clonă vocală de înaltă calitate."
  },
  {
    question: "Ce limbi sunt suportate?",
    answer: "Kalina AI suportă peste 40 de limbi, inclusiv română, engleză, franceză, germană, spaniolă și multe altele. Poți configura agenți multilingvi care răspund automat în limba clientului."
  },
  {
    question: "Cum funcționează integrarea cu sistemele existente?",
    answer: "Oferim API-uri simple și documentație detaliată pentru integrarea cu CRM-ul, baza de date sau sistemele tale existente. De asemenea, avem conectori pre-configurați pentru platformele populare."
  },
  {
    question: "Ce măsuri de securitate aveți implementate?",
    answer: "Toate datele sunt criptate end-to-end, respectăm standardele GDPR și ISO 27001. Conversațiile pot fi configurate să nu fie stocate permanent, iar accesul la date este strict controlat."
  },
  {
    question: "Există suport tehnic disponibil?",
    answer: "Da, oferim suport tehnic 24/7 prin chat, email și telefon. De asemenea, avem o bibliotecă extinsă de tutoriale și documentație pentru a te ajuta să folosești platforma la maximum."
  }
]

const FAQSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Întrebări Frecvente
          </h2>
          <p className="text-xl text-gray-600">
            Răspunsuri la cele mai comune întrebări despre Kalina AI
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="liquid-glass rounded-xl px-6"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-[#0A5B4C]">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pt-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

export default FAQSection
