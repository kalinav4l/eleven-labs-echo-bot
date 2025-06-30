
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, Phone, Code, Zap, Shield, BarChart3, Globe, Users, Play, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/41063b8f-e57c-4af9-aba7-3710feba1af3.png" 
                alt="Kalina AI" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-gray-900">Kalina AI</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-[#0A5B4C] transition-colors">Funcționalități</a>
              <a href="#pricing" className="text-gray-700 hover:text-[#0A5B4C] transition-colors">Prețuri</a>
              <a href="#docs" className="text-gray-700 hover:text-[#0A5B4C] transition-colors">Documentație</a>
              <a href="#contact" className="text-gray-700 hover:text-[#0A5B4C] transition-colors">Contact</a>
            </nav>

            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Autentificare
              </Button>
              <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-6">
                SIGN UP
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Generează agenți telefonici AI de <br />
                înaltă calitate pentru afacerea ta
              </h1>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Features */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 mt-1"></div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">AGENȚI TELEFONICI</h3>
                      <p className="text-gray-600">
                        Creează agenți telefonici AI de înaltă calitate multi-caracter. Încarcă 
                        site-ul tău web, selectează vocea, direcționează livrarea și apoi publică.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 mt-1"></div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">APELURI OUTBOUND</h3>
                      <p className="text-gray-600">
                        Alege vocea perfectă pentru campaniile tale sau clonează propria voce. 
                        Apoi generează apeluri de înaltă calitate pentru ads, campanii scurte 
                        sau filme de lungă durată.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 mt-1"></div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">ANALIZĂ CONVERSAȚII</h3>
                      <p className="text-gray-600">
                        Traduce conținutul tău în 30+ limbi menținând 
                        vocea vorbitorului. Dublează în 1-click sau ai control complet 
                        asupra tranziției și livrării cu Dubbing Studio.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 mt-1"></div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">TRANSCRIERI</h3>
                      <p className="text-gray-600">
                        Voice Isolator transformă orice înregistrare în calitate de studio. Sau folosește 
                        Text to Speech pentru a genera secțiuni scurte cu propria ta voce 
                        sau podcasturi întregi cu vorbitori multipli.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Demo */}
              <div className="flex flex-col justify-center">
                <div className="bg-gray-50 rounded-lg p-8 border">
                  <div className="flex items-center justify-between mb-6">
                    <Play className="w-8 h-8 text-gray-400" />
                    <div className="text-sm text-gray-500">
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold mr-2">TIME</span>
                      folosește Studio pentru Text to Speech de înaltă calitate, lungă durată
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-semibold text-gray-900 mb-2">The Adventures of...</h4>
                      <p className="text-sm text-gray-600 mb-3">Chapter Three - A</p>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        "My dear fellow," said Sherlock Holmes as we sat on either side of 
                        the fire in his Baker Street, "life is infinitely stranger than anything 
                        which the mind of man could invent..."
                      </p>
                    </div>
                    
                    <Button className="w-full bg-black hover:bg-gray-800 text-white rounded-full">
                      GET STARTED FREE
                    </Button>
                  </div>
                </div>

                {/* Demo Call Section */}
                <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Testează un agent Kalina AI
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Primește un apel demonstrativ de la un agent AI. Acum.
                  </p>
                  <div className="space-y-3">
                    <Input
                      type="tel"
                      placeholder="+40712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="border-gray-300"
                    />
                    <Button 
                      onClick={handleDemoCall}
                      disabled={!phoneNumber.trim() || isLoading}
                      className="w-full bg-[#0A5B4C] hover:bg-[#084136] text-white"
                    >
                      {isLoading ? 'Se inițiază...' : 'Sună-mă'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Folosit de milioane dintre cei mai buni creatori
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Creează conținut mai rapid cu<br /><strong>Clonare Voce</strong></p>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-white font-bold text-lg">HUBERMAN LAB<br />ESSENTIALS</div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <span>Andrew Huberman</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Voice over your videos with<br /><strong>Text to Speech</strong></p>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="w-full h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg mb-3"></div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <span>The Colin & Samir Show</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Create AI audiobooks with <strong>Studio</strong></p>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="w-full h-32 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-lg mb-3"></div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <span>Arianna Huffington</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Translate your content with <strong>Dubbing</strong></p>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="w-full h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg mb-3"></div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <span>Drew Binsky</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-8">
              GET STARTED
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Funcționalități Avansate</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Bot className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Voci Hiper-Realiste</h3>
                <p className="text-gray-600">Alege dintr-o librărie de voci premium sau clonează o voce specifică.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Zap className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Scripting Dinamic</h3>
                <p className="text-gray-600">Agenții pot devia de la script și pot purta conversații naturale.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Globe className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Scalabilitate Enterprise</h3>
                <p className="text-gray-600">De la 10 la 100.000 de apeluri pe zi, fără a compromite calitatea.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <BarChart3 className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analiză în Timp Real</h3>
                <p className="text-gray-600">Dashboard-uri live cu transcrieri și metrici de performanță.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <Code className="w-12 h-12 text-[#0A5B4C] mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Integrare Simplă</h3>
                <p className="text-gray-600">Documentație API clară și SDK-uri pentru integrare rapidă.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
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
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Prețuri Fără Surprize</h2>
          <p className="text-xl text-gray-600 mb-12">Pay-as-you-go. Plătești exact cât folosești.</p>
          
          <div className="max-w-md mx-auto">
            <Card className="p-8">
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
                
                <Button className="w-full bg-black hover:bg-gray-800 text-white rounded-full">
                  Vezi Toate Detaliile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ești gata să construiești viitorul comunicării?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Creează-ți contul gratuit astăzi și lansează primul tău agent telefonic AI în mai puțin de 5 minute.
          </p>
          <Button className="bg-black hover:bg-gray-800 text-white px-12 py-6 text-xl rounded-full">
            Începe să Construiești Gratuit
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src="/lovable-uploads/41063b8f-e57c-4af9-aba7-3710feba1af3.png" 
                alt="Kalina AI" 
                className="w-6 h-6"
              />
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
