
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Code, Shield, Users, Star, Robot } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallRequested, setIsCallRequested] = useState(false);

  const handleDemoCall = () => {
    setIsCallRequested(true);
    // Here you would integrate with your actual API
    setTimeout(() => setIsCallRequested(false), 3000);
  };

  const features = [
    {
      icon: <Robot className="h-8 w-8 text-green-500" />,
      title: "Voci Hiper-Realiste",
      description: "Alege dintr-o librărie de voci premium sau clonează o voce specifică."
    },
    {
      icon: <Code className="h-8 w-8 text-green-500" />,
      title: "Scripting Dinamic",
      description: "Agenții pot devia de la script, pot gestiona întreruperi și pot purta conversații naturale."
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Scalabilitate Enterprise",
      description: "De la 10 la 100.000 de apeluri pe zi, fără a compromite calitatea."
    },
    {
      icon: <Star className="h-8 w-8 text-green-500" />,
      title: "Analiză în Timp Real",
      description: "Dashboard-uri live cu transcrieri și metrici de performanță."
    },
    {
      icon: <Phone className="h-8 w-8 text-green-500" />,
      title: "Integrare Simplă",
      description: "Documentație API clară și SDK-uri pentru Python și Node.js pentru o integrare rapidă."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Securitate Maximă",
      description: "Conformitate cu standardele GDPR și protocoale de criptare end-to-end."
    }
  ];

  const companies = [
    "TechCorp", "InnovateX", "DataFlow", "NextGen", "CloudTech", "AI Solutions"
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-green-500">
            Kalina AI
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Funcționalități
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Prețuri
            </a>
            <a href="#docs" className="text-gray-300 hover:text-white transition-colors">
              Documentație
            </a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-gray-300 hover:text-white">
                Autentificare
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                Începe Gratuit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Creează. Testează. 
            <span className="text-green-500"> Scalează.</span>
            <br />
            Agenți Telefonici AI în Minute.
          </h1>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Platforma completă pentru dezvoltatori și afaceri care vor să construiască, 
            să gestioneze și să scaleze rapid agenți de voce autonomi.
          </p>

          {/* Interactive Code Widget */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12 text-left max-w-2xl mx-auto">
            <div className="flex items-center mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 ml-4 text-sm">main.py</span>
            </div>
            <pre className="text-green-400 text-sm">
{`import kalina_ai

kalina_ai.api_key = "KAI_API_KEY"

call = kalina_ai.call.create(
    phone_number="+407xxxxxxxx",
    agent_id="agent_xyz789",
    task="Confirma programarea pentru maine la ora 15:00."
)
print(call.status)`}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg">
                Începe Gratuit
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:text-white px-8 py-4 text-lg">
              Vezi Documentația →
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-6 py-12 text-center">
        <p className="text-gray-400 mb-8">Folosit de echipe inovatoare de la</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
          {companies.map((company, index) => (
            <div key={index} className="text-gray-500 font-semibold text-lg">
              {company}
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Auzi-l în Acțiune</h2>
        <div className="max-w-md mx-auto mb-16">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <p className="text-gray-300 mb-4">
                Primește un apel demonstrativ de la un agent Kalina AI. Acum.
              </p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+40 7XX XXX XXX"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                />
                <Button 
                  onClick={handleDemoCall}
                  disabled={!phoneNumber || isCallRequested}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isCallRequested ? "Se sună..." : "Sună-mă"}
                </Button>
              </div>
              {isCallRequested && (
                <p className="text-green-500 text-sm mt-2">
                  Vei primi apelul în câteva secunde...
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Definește</h3>
            <p className="text-gray-300">
              Construiește logica conversațională a agentului tău prin API sau direct din interfața noastră intuitivă.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Conectează</h3>
            <p className="text-gray-300">
              Inițiază mii de apeluri simultan cu o singură cerere API. Latență sub 500ms.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analizează</h3>
            <p className="text-gray-300">
              Primești transcrieri, analize de sentiment și rapoarte detaliate pentru fiecare conversație.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">
          Funcționalități de Ultimă Generație
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:border-green-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {feature.icon}
                  <h3 className="text-xl font-semibold ml-3">{feature.title}</h3>
                </div>
                <p className="text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Prețuri Fără Surprize</h2>
        <p className="text-xl text-gray-300 mb-12">
          "Pay-as-you-go". Plătești exact cât folosești.
        </p>
        
        <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">
                €0.05<span className="text-lg text-gray-400">/minut</span>
              </div>
              <Badge variant="secondary" className="bg-green-600 text-white">
                Preț competitiv
              </Badge>
            </div>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Acces API complet
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Suport tehnic
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Transcrieri incluse
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Fără taxe lunare
              </li>
            </ul>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Vezi Toate Detaliile de Preț
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ești gata să construiești viitorul comunicării?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Creează-ți contul gratuit astăzi și lansează primul tău agent telefonic AI în mai puțin de 5 minute.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 text-xl">
              Începe să Construiești Gratuit
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-green-500 mb-4">
                Kalina AI
              </div>
              <p className="text-gray-300">
                Platforma AI pentru comunicare telefonică inteligentă.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produs</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Funcționalități</a></li>
                <li><a href="#" className="hover:text-white">Prețuri</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Companie</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Despre Noi</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Termeni și Condiții</a></li>
                <li><a href="#" className="hover:text-white">Politică de Confidențialitate</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Kalina AI. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
