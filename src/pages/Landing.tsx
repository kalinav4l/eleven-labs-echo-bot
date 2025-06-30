
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import TextPressure from '@/components/TextPressure';

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
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/41063b8f-e57c-4af9-aba7-3710feba1af3.png" 
                alt="Kalina AI Logo" 
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-white">KALINA AI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                Autentificare
              </Button>
              <Button className="bg-white hover:bg-gray-100 text-red-800 rounded-full px-6 font-semibold">
                SIGN UP
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Animated Title Section - Full Width at Top */}
      <section className="pt-24 pb-8">
        <div className="w-full px-6">
          <div className="h-32 w-full">
            <TextPressure
              text="KALINA"
              textColor="#FFFFFF"
              minFontSize={80}
              weight={true}
              width={true}
              italic={false}
              scale={true}
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl mx-auto">
          {/* Subtitle */}
          <div className="text-center mb-12">
            <p className="text-white/90 text-xl font-light">
              Generează agenți telefonici AI de înaltă calitate
            </p>
          </div>

          {/* Demo Call Section */}
          <div className="max-w-md mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Testează un agent Kalina AI
                </h3>
                <p className="text-white/80 mb-4">
                  Primește un apel demonstrativ de la un agent AI. Acum.
                </p>
                <div className="space-y-3">
                  <Input
                    type="tel"
                    placeholder="+40712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                  />
                  <Button 
                    onClick={handleDemoCall}
                    disabled={!phoneNumber.trim() || isLoading}
                    className="w-full bg-white hover:bg-gray-100 text-red-800 font-semibold"
                  >
                    {isLoading ? 'Se inițiază...' : 'Sună-mă'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Funcționalități Avansate
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">AI</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Agenți Telefonici</h3>
                <p className="text-gray-600">Creează agenți AI care pot purta conversații naturale cu clienții tăi.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">📞</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Apeluri Outbound</h3>
                <p className="text-gray-600">Inițiază campanii de apeluri automate pentru vânzări și marketing.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analiză Conversații</h3>
                <p className="text-gray-600">Analizează și optimizează performanța conversațiilor AI.</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold">📝</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transcrieri</h3>
                <p className="text-gray-600">Transcrieri automate și în timp real ale tuturor conversațiilor.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-gray-50">
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
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                    Acces API complet
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                    Suport tehnic
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                    Transcrieri incluse
                  </li>
                  <li className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                    Fără taxe lunare
                  </li>
                </ul>
                
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full">
                  Vezi Toate Detaliile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ești gata să construiești viitorul comunicării?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            Creează-ți contul gratuit astăzi și lansează primul tău agent telefonic AI în mai puțin de 5 minute.
          </p>
          <Button className="bg-white hover:bg-gray-100 text-red-800 px-12 py-6 text-xl rounded-full font-semibold">
            Începe să Construiești Gratuit
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <span className="text-lg font-semibold text-gray-900">Kalina AI</span>
            </div>
            <div className="flex space-x-6 text-gray-600">
              <a href="#" className="hover:text-red-600 transition-colors">Termeni</a>
              <a href="#" className="hover:text-red-600 transition-colors">Confidențialitate</a>
              <a href="#" className="hover:text-red-600 transition-colors">Contact</a>
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
