
import React from 'react';
import { Bot, Phone, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HamburgerMenu from '@/components/HamburgerMenu';

const Info = () => {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-accent" />,
      title: "AI Avansat",
      description: "Agenți AI cu tehnologie de ultimă generație pentru conversații naturale și eficiente."
    },
    {
      icon: <Phone className="w-8 h-8 text-accent" />,
      title: "Telefonie Inteligentă",
      description: "Sistemul nostru automatizează apelurile de vânzări și suport cu rata de succes de 90%."
    },
    {
      icon: <Zap className="w-8 h-8 text-accent" />,
      title: "Răspuns Instant",
      description: "Timp de răspuns sub 200ms pentru experiențe fluide și profesionale."
    },
    {
      icon: <Shield className="w-8 h-8 text-accent" />,
      title: "Securitate Maximă",
      description: "Toate datele sunt criptate și stocate în conformitate cu standardele GDPR."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <HamburgerMenu />
      
      {/* Background Glass Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-72 h-72 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-6">
            Despre Compania Noastră
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Suntem o companie de tehnologie specializată în soluții AI pentru automatizarea 
            apelurilor telefonice. Misiunea noastră este să transformăm modul în care companiile 
            interactionează cu clienții prin tehnologie inteligentă.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="liquid-glass hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-foreground text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-8">
            De Ce Ne Aleg Clienții
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center liquid-glass p-6 rounded-xl">
              <div className="text-4xl font-bold text-foreground mb-2">95%</div>
              <div className="text-muted-foreground">Rata de satisfacție a clienților</div>
            </div>
            <div className="text-center liquid-glass p-6 rounded-xl">
              <div className="text-4xl font-bold text-foreground mb-2">50+</div>
              <div className="text-muted-foreground">Companii partenere</div>
            </div>
            <div className="text-center liquid-glass p-6 rounded-xl">
              <div className="text-4xl font-bold text-foreground mb-2">1M+</div>
              <div className="text-muted-foreground">Apeluri procesate lunar</div>
            </div>
          </div>
        </div>

        <Card className="liquid-glass max-w-4xl mx-auto animate-fade-in">
          <CardHeader>
            <CardTitle className="text-foreground text-2xl text-center">
              Viziunea Noastră
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-lg leading-relaxed">
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
