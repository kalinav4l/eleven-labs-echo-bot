
import React from 'react'
import { Bot, FileText, Database, MessageCircle, Mic, BarChart3 } from 'lucide-react'

const features = [
  {
    icon: Bot,
    title: "Agenți Vocali AI",
    description: "Creează agenți AI care pot prelua apeluri, oferi informații și chiar suna clienții, folosind o voce clonată sau una din galeria noastră."
  },
  {
    icon: FileText,
    title: "Transcriere și Analiză",
    description: "Transcrie automat conversațiile și generează analize detaliate despre sentimente, cuvinte cheie și performanță."
  },
  {
    icon: Database,
    title: "Telefonie în Baza de Date",
    description: "Integrează sistemul de telefonie direct cu baza ta de date pentru acces instant la informații despre clienți."
  },
  {
    icon: MessageCircle,
    title: "Mesagerie AI (SMS & Viber)",
    description: "Automatizează comunicarea prin SMS și Viber cu răspunsuri inteligente și campanii personalizate."
  },
  {
    icon: Mic,
    title: "Clonarea Vocii",
    description: "Clonează vocea ta sau alege din galeria noastră de voci profesionale pentru agenții tăi AI."
  },
  {
    icon: BarChart3,
    title: "Analytics Hub",
    description: "Dashboard complet cu statistici în timp real, rapoarte detaliate și insights pentru optimizarea performanței."
  }
]

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            O suită completă de unelte pentru comunicare inteligentă
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Totul de care ai nevoie pentru a automatiza și optimiza comunicarea cu clienții tăi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="liquid-glass p-8 rounded-xl hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-[#0A5B4C]/10 rounded-xl mb-6 group-hover:bg-[#0A5B4C]/20 transition-colors">
                <feature.icon className="w-8 h-8 text-[#0A5B4C]" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
