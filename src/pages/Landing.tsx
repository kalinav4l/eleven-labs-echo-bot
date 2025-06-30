
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Phone, Code, Zap, Shield, BarChart3, Globe, Users } from 'lucide-react';

const Landing = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoCall = async () => {
    if (!phoneNumber.trim()) return;
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Demo call inițiat! Vei fi sunat în curând.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* Background Glass Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-200/30 to-green-200/30 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      {/* Header */}
      <header className="liquid-glass border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-8 h-8 text-[#0A5B4C]" />
              <span className="text-xl font-bold text-gray-900">Kalina AI</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-[#0A5B4C] transition-colors">Funcționalități</a>
              <a href="#pricing" className="text-gray-700 hover:text-[#0A5B4C] transition-colors">Prețuri</a>
              <a href="#docs" className="text-gray-700 hover:text-[#0A5B4C] transition-colors">Documentație</a>
              <a href="#contact" className="text-gray-700 hover:text-[#0A5B4C] transition-colors">Contact</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="outline" className="glass-input border-gray-300 text-gray-700 hover:bg-gray-50">
                Autentificare
              </Button>
              <Button className="glass-button bg-[#0A5B4C] hover:bg-[#084136] text-white">
                Începe Gratuit
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Creează. Testează. <span className="text-[#0A5B4C]">Scalează.</span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-700 mb-8">
              Agenți Telefonici AI în Minute
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Platforma completă pentru dezvoltatori și afaceri care vor să construiască, să gestioneze și să scaleze rapid agenți de voce autonomi.
            </p>

            {/* Interactive Code Widget */}
            <div className="liquid-glass p-8 rounded-xl mb-12 animate-scale-in">
              <div className="text-left">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-mono">Python</span>
                  <Code className="w-5 h-5 text-[#0A5B4C]" />
                </div>
                <pre className="text-sm text-gray-800 font-mono overflow-x-auto">
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
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="glass-button bg-[#0A5B4C] hover:bg-[#084136] text-white px-8 py-4 text-lg">
                Începe Gratuit
              </Button>
              <Button variant="outline" className="glass-input border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg">
                Vezi Documentația →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 px-6">
        <div className="container mx-auto text-center">
          <p className="text-gray-600 mb-8">Folosit de echipe inovatoare de la</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Globe className="w-6 h-6" />
              <span className="font-semibold">TechCorp</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6" />
              <span className="font-semibold">InnovateNow</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6" />
              <span className="font-semibold">FutureCall</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Auzi-l în Acțiune</h2>
          
          <div className="max-w-md mx-auto liquid-glass p-8 rounded-xl mb-16">
            <p className="text-gray-700 mb-6">
              Primește un apel demonstrativ de la un agent Kalina AI. Acum.
            </p>
            <div className="space-y-4">
              <Input
                type="tel"
                placeholder="+40712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="glass-input"
              />
              <Button 
                onClick={handleDemoCall}
                disabled={!phoneNumber.trim() || isLoading}
                className="w-full glass-button bg-[#0A5B4C] hover:bg-[#084136] text-white"
              >
                {isLoading ? 'Se inițiază...' : 'Sună-mă'}
              </Button>
            </div>
          </div>

          {/* 3-Step Process */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center animate-fade-in">
              <div className="liquid-glass w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-[#0A5B4C]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Definește</h3>
              <p className="text-gray-600">Construiește logica conversațională prin API sau interfața noastră intuitivă.</p>
            </div>
            
            <div className="text-center animate-fade-in">
              <div className="liquid-glass w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#0A5B4C]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Conectează</h3>
              <p className="text-gray-600">Inițiază mii de apeluri simultan cu o singură cerere API. Latență sub 500ms.</p>
            </div>
            
            <div className="text-center animate-fade-in">
              <div className="liquid-glass w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-[#0A5B4C]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Analizează</h3>
              <p className="text-gray-600">Primești transcrieri, analize de sentiment și rapoarte detaliate.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Funcționalități Avansate</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="liquid-glass hover:shadow-lg transition-all duration-300 animate-scale-in">
              <CardContent className="p-6">
                <Bot className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Voci Hiper-Realiste</h3>
                <p className="text-gray-600">Alege dintr-o librărie de voci premium sau clonează o voce specifică.</p>
              </CardContent>
            </Card>

            <Card className="liquid-glass hover:shadow-lg transition-all duration-300 animate-scale-in">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Scripting Dinamic</h3>
                <p className="text-gray-600">Agenții pot devia de la script și pot purta conversații naturale.</p>
              </CardContent>
            </Card>

            <Card className="liquid-glass hover:shadow-lg transition-all duration-300 animate-scale-in">
              <CardContent className="p-6">
                <Globe className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Scalabilitate Enterprise</h3>
                <p className="text-gray-600">De la 10 la 100.000 de apeluri pe zi, fără a compromite calitatea.</p>
              </CardContent>
            </Card>

            <Card className="liquid-glass hover:shadow-lg transition-all duration-300 animate-scale-in">
              <CardContent className="p-6">
                <BarChart3 className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analiză în Timp Real</h3>
                <p className="text-gray-600">Dashboard-uri live cu transcrieri și metrici de performanță.</p>
              </CardContent>
            </Card>

            <Card className="liquid-glass hover:shadow-lg transition-all duration-300 animate-scale-in">
              <CardContent className="p-6">
                <Code className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Integrare Simplă</h3>
                <p className="text-gray-600">Documentație API clară și SDK-uri pentru integrare rapidă.</p>
              </CardContent>
            </Card>

            <Card className="liquid-glass hover:shadow-lg transition-all duration-300 animate-scale-in">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Securitate Maximă</h3>
                <p className="text-gray-600">Conformitate GDPR și criptare end-to-end.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Prețuri Fără Surprize</h2>
          <p className="text-xl text-gray-600 mb-12">Pay-as-you-go. Plătești exact cât folosești.</p>
          
          <div className="max-w-md mx-auto">
            <Card className="liquid-glass p-8 animate-scale-in">
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">€0.05</div>
                  <div className="text-gray-600">per minut</div>
                </div>
                
                <ul className="space-y-3 text-left">
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-[#0A5B4C] rounded-full mr-3"></div>
                    Acces API complet
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-[#0A5B4C] rounded-full mr-3"></div>
                    Suport tehnic
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-[#0A5B4C] rounded-full mr-3"></div>
                    Transcrieri incluse
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-[#0A5B4C] rounded-full mr-3"></div>
                    Fără taxe lunare
                  </li>
                </ul>
                
                <Button className="w-full glass-button bg-[#0A5B4C] hover:bg-[#084136] text-white">
                  Vezi Toate Detaliile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A5B4C]/10 via-transparent to-[#0A5B4C]/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ești gata să construiești viitorul comunicării?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Creează-ți contul gratuit astăzi și lansează primul tău agent telefonic AI în mai puțin de 5 minute.
          </p>
          <Button className="glass-button bg-[#0A5B4C] hover:bg-[#084136] text-white px-12 py-6 text-xl animate-pulse-glow">
            Începe să Construiești Gratuit
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="liquid-glass border-t border-gray-200/50 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Bot className="w-6 h-6 text-[#0A5B4C]" />
              <span className="text-lg font-semibold text-gray-900">Kalina AI</span>
            </div>
            <div className="flex space-x-6 text-gray-600">
              <a href="#" className="hover:text-[#0A5B4C] transition-colors">Termeni</a>
              <a href="#" className="hover:text-[#0A5B4C] transition-colors">Confidențialitate</a>
              <a href="#" className="hover:text-[#0A5B4C] transition-colors">Contact</a>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm mt-8">
            © 2024 Kalina AI. Toate drepturile rezervate.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
