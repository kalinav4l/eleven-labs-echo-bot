import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, Phone, MessageSquare, TrendingUp, ArrowRight, CheckCircle, Users, Zap, Shield } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Bot,
      title: "Agenți AI Inteligenți",
      description: "Creează agenți AI care pot gestiona conversații complexe și oferi răspunsuri personalizate"
    },
    {
      icon: Phone,
      title: "Apeluri Vocale",
      description: "Tehnologie de vorbire naturală pentru interacțiuni vocale fluide și profesionale"
    },
    {
      icon: MessageSquare,
      title: "Chat Inteligent",
      description: "Conversații text avansate cu înțelegere contextuală și răspunsuri relevante"
    },
    {
      icon: TrendingUp,
      title: "Analiză Avansată",
      description: "Statistici detaliate și insights pentru optimizarea performanțelor"
    },
    {
      icon: Users,
      title: "Gestionare Clienți",
      description: "Sistem complet pentru managementul relațiilor cu clienții"
    },
    {
      icon: Zap,
      title: "Integrări Rapide",
      description: "Conectează-te ușor cu sistemele și platformele existente"
    }
  ];

  const benefits = [
    "Interface intuitivă și ușor de folosit",
    "Suport 24/7 pentru agenții tăi AI",
    "Securitate și confidențialitate garantate",
    "Scalare automată în funcție de nevoi",
    "Analiză în timp real a performanțelor",
    "Integrare rapidă cu sistemele existente"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-gray-900 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Kalina AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Conectare
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gray-900 text-white hover:bg-gray-800">
                  Înregistrare Gratuită
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Construiește Agenți AI
            <br />
            <span className="text-gray-600">pentru Business-ul Tău</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-in-up">
            Platformă completă pentru crearea și gestionarea agenților AI inteligenți. 
            Automatizează conversațiile, crește satisfacția clienților și optimizează procesele de business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-in-up">
            <Link to="/auth">
              <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 text-lg">
                Începe Gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg">
              Vezi Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Funcționalități Avansate
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tot ce ai nevoie pentru a crea și gestiona agenți AI performanți
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                De Ce Să Alegi Kalina AI?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Platformă completă care îți permite să creezi, configurezi și gestionezi 
                agenți AI performanți pentru orice tip de business.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">10K+</div>
                  <div className="text-gray-600">Agenți Creați</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">50K+</div>
                  <div className="text-gray-600">Conversații</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
                  <div className="text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
                  <div className="text-gray-600">Suport</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Gata să Începi?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Alătură-te miilor de companii care au ales Kalina AI pentru 
            automatizarea conversațiilor și îmbunătățirea experienței clienților.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg">
              Începe Gratuit Acum
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Bot className="h-6 w-6 text-gray-900 mr-2" />
              <span className="text-lg font-semibold text-gray-900">Kalina AI</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Termeni</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Confidențialitate</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Suport</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">© 2025 Kalina AI. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;