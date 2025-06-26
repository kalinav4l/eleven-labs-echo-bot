
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Bot, MessageSquare, BarChart3, Calendar, PhoneCall, Users, Zap, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);

  if (user) {
    return <Navigate to="/account" replace />;
  }

  const features = [
    {
      icon: Bot,
      title: "Agenți AI Avansați",
      description: "Creează agenți AI cu voci naturale și conversații inteligente pentru business-ul tău."
    },
    {
      icon: MessageSquare,
      title: "Transcripturi Precise",
      description: "Generează transcripturi structurate din fișiere audio cu identificare automată a vorbitorilor."
    },
    {
      icon: BarChart3,
      title: "Analiză Conversații",
      description: "Monitorizează performanța și obține insights din conversațiile cu clienții tăi."
    },
    {
      icon: Calendar,
      title: "Programare Apeluri",
      description: "Gestionează și programează apeluri cu un calendar integrat și notificări automate."
    },
    {
      icon: PhoneCall,
      title: "Apeluri Outbound",
      description: "Inițiază campanii de apeluri automate cu agenți AI pentru prospectare și follow-up."
    },
    {
      icon: Shield,
      title: "Securitate Avansată",
      description: "Date protejate cu criptare end-to-end și conformitate GDPR completă."
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "10M+", label: "Apeluri procesate" },
    { value: "500+", label: "Clienți mulțumiți" },
    { value: "24/7", label: "Suport disponibil" }
  ];

  const testimonials = [
    {
      name: "Maria Popescu",
      role: "CEO, TechStart",
      content: "Kalina AI a transformat complet modul în care gestionăm apelurile cu clienții. Eficiența echipei a crescut cu 300%.",
      avatar: "MP"
    },
    {
      name: "Alexandru Ionescu",
      role: "Director Vânzări, SalesPro",
      content: "Cel mai bun investiment în tehnologie pe care l-am făcut. Agenții AI sunt incredibil de naturali și eficienți.",
      avatar: "AI"
    },
    {
      name: "Elena Radu",
      role: "Manager Customer Success",
      content: "Analizele conversațiilor ne-au ajutat să înțelegem mai bine nevoile clienților și să îmbunătățim serviciile.",
      avatar: "ER"
    }
  ];

  const handleDemoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" alt="Kalina AI" className="h-8 w-8 mr-3" />
              <span className="text-xl font-bold text-gray-900">Kalina AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/info" className="text-gray-600 hover:text-gray-900 transition-colors">Info</Link>
              <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Prețuri</Link>
              <Link to="/auth" className="text-gray-600 hover:text-gray-900 transition-colors">Conectare</Link>
              <Button asChild className="bg-[#0A5B4C] hover:bg-[#0A5B4C]/90">
                <Link to="/auth">Începe Gratuit</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-[#0A5B4C]/10 text-[#0A5B4C] border-[#0A5B4C]/20">
              🚀 Platforma AI Vocală Cea Mai Realistă
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Conversații AI<br />
              <span className="bg-gradient-to-r from-[#0A5B4C] to-blue-600 bg-clip-text text-transparent">
                Indistinguibile de Realitate
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Creează agenți AI cu voci naturale care gestionează apeluri, programează întâlniri și 
              oferă suport clienților 24/7. Tehnologie de ultimă generație pentru business-ul tău.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="bg-[#0A5B4C] hover:bg-[#0A5B4C]/90 text-lg px-8 py-4">
                <Link to="/auth">Începe Gratuit <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" onClick={handleDemoPlay} className="text-lg px-8 py-4">
                <Play className="mr-2 w-5 h-5" />
                Ascultă Demo
              </Button>
            </div>
          </div>

          {/* Demo Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-2xl">
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-300">Kalina AI Console</span>
                  </div>
                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">$</span>
                      <span>kalina agent create --voice=natural --language=ro</span>
                    </div>
                    <div className="text-blue-300">✓ Agent creat cu succes</div>
                    <div className="text-blue-300">✓ Voce naturală configurată</div>
                    <div className="text-blue-300">✓ Limba română activată</div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">$</span>
                      <span className="opacity-60">Agent pregătit pentru apeluri...</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#0A5B4C] mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funcționalități Avansate
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tot ce ai nevoie pentru a automatiza și optimiza comunicarea cu clienții tăi.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-[#0A5B4C]/20">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#0A5B4C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0A5B4C]/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-[#0A5B4C]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Utilizat de Milioane de Creatori
            </h2>
            <p className="text-xl text-gray-600">
              Companii de top au ales Kalina AI pentru transformarea digitală.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white border-gray-100">
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#0A5B4C] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#0A5B4C] to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Gata să Transformi Business-ul Tău?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Alătură-te miilor de companii care au ales Kalina AI pentru viitorul comunicării.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-4">
              <Link to="/auth">Începe Gratuit <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-[#0A5B4C] text-lg px-8 py-4">
              Contactează Echipa
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/lovable-uploads/f617a44e-5bc3-46cb-8232-3110c0cee83d.png" alt="Kalina AI" className="h-8 w-8 mr-3" />
                <span className="text-xl font-bold">Kalina AI</span>
              </div>
              <p className="text-gray-400">
                Platforma AI vocală cea mai avansată pentru business-ul modern.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produs</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/info" className="hover:text-white transition-colors">Funcționalități</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Prețuri</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentație</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Companie</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Despre noi</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cariere</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suport</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centru de ajutor</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termeni</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Kalina AI. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
