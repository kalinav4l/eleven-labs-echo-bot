
import React from 'react';
import { Bot, Phone, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HamburgerMenu from '@/components/HamburgerMenu';

const Info = () => {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-white" />,
      title: "AI Avansat",
      description: "Agenți AI cu tehnologie de ultimă generație pentru conversații naturale și eficiente."
    },
    {
      icon: <Phone className="w-8 h-8 text-white" />,
      title: "Telefonie Inteligentă",
      description: "Sistemul nostru automatizează apelurile de vânzări și suport cu rata de succes de 90%."
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: "Răspuns Instant",
      description: "Timp de răspuns sub 200ms pentru experiențe fluide și profesionale."
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: "Securitate Maximă",
      description: "Toate datele sunt criptate și stocate în conformitate cu standardele GDPR."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu />
      
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-6">
            Despre Compania Noastră
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Suntem o companie de tehnologie specializată în soluții AI pentru automatizarea 
            apelurilor telefonice. Misiunea noastră este să transformăm modul în care companiile 
            interactionează cu clienții prin tehnologie inteligentă.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-black border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-black border border-gray-800 rounded-lg">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-white mb-8">
            De Ce Ne Aleg Clienții
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400">Rata de satisfacție a clienților</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-400">Companii partenere</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <div className="text-gray-400">Apeluri procesate lunar</div>
            </div>
          </div>
        </div>

        <Card className="bg-black border-gray-800 max-w-4xl mx-auto animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">
              Viziunea Noastră
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 text-lg leading-relaxed">
              Credem că viitorul comunicării business se bazează pe inteligența artificială. 
              Scopul nostru este să oferim soluții care nu doar automatizează procesele, 
              ci îmbunătățesc calitatea interacțiunii cu clienții. Fiecare agent AI pe care îl 
              dezvoltăm este proiectat să înțeleagă, să se adapteze și să ofere rezultate excepționale.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Info;
