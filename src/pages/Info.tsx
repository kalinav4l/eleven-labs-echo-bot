
import React from 'react';
import { Bot, Phone, Zap, Shield, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import HamburgerMenu from '@/components/HamburgerMenu';

const Info = () => {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-blue-500" />,
      title: 'Agenți AI Inteligenți',
      description: 'Agenții noștri AI sunt antrenați să înțeleagă și să răspundă natural la orice tip de conversație.'
    },
    {
      icon: <Phone className="w-8 h-8 text-green-500" />,
      title: 'Apeluri Automate',
      description: 'Sistem complet automatizat pentru apeluri de vânzări, suport clienți și programări.'
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: 'Răspuns Instant',
      description: 'Fără așteptare, fără cozi. Agenții noștri răspund imediat și sunt disponibili 24/7.'
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: 'Securitate Maximă',
      description: 'Toate conversațiile sunt criptate și respectăm cele mai stricte standarde de confidențialitate.'
    },
    {
      icon: <Users className="w-8 h-8 text-red-500" />,
      title: 'Personalizare Completă',
      description: 'Adaptăm vocea, personalitatea și stilul agentului perfect pentru brandul tău.'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-indigo-500" />,
      title: 'Analiză Performanță',
      description: 'Rapoarte detaliate și insights pentru a-ți optimiza strategia de comunicare.'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu />
      
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Revolutionăm Comunicarea
            <span className="block text-blue-500">cu Inteligența Artificială</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Suntem o companie inovatoare specializată în dezvoltarea de agenți AI pentru comunicare telefonică. 
            Transformăm modul în care businessurile interactionează cu clienții prin tehnologie de vârf.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Misiunea Noastră</h2>
              <p className="text-lg text-gray-300 text-center max-w-4xl mx-auto leading-relaxed">
                Ne propunem să democratizăm accesul la tehnologia AI pentru toate businessurile, 
                indiferent de mărime. Credem că fiecare companie merită să aibă acces la un asistent AI 
                inteligent care să-i ajute să-și servească mai bine clienții și să-și crească eficiența operațională.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Cu Ce Ne Ocupăm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            Industrii pe Care le Servim
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-white mb-4">Vânzări & Marketing</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Apeluri de prospectare automatizate</li>
                <li>• Follow-up personalizat cu leads</li>
                <li>• Programări demonstrații produse</li>
                <li>• Sondaje de satisfacție clienți</li>
              </ul>
            </div>
            
            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-white mb-4">Suport Clienți</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Asistență tehnică 24/7</li>
                <li>• Triaj automat cereri suport</li>
                <li>• Informații despre comenzi</li>
                <li>• Rezolvarea problemelor frecvente</li>
              </ul>
            </div>
            
            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-white mb-4">Servicii Medicale</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Programări consultatii automate</li>
                <li>• Reamintiri programări</li>
                <li>• Triaj medical preliminar</li>
                <li>• Informații despre servicii</li>
              </ul>
            </div>
            
            <div className="bg-gray-900 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-white mb-4">Servicii Financiare</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Verificare informații cont</li>
                <li>• Asistență pentru aplicații</li>
                <li>• Notificări și alerte</li>
                <li>• Educație financiară</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Team/Company Values */}
        <div className="text-center">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6">Valorile Noastre</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Inovație</h3>
                  <p className="text-gray-400">Suntem mereu în pas cu ultimele tehnologii AI pentru a oferi soluții de vârf.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Transparență</h3>
                  <p className="text-gray-400">Comunicăm deschis despre capabilitățile și limitările tehnologiei noastre.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Rezultate</h3>
                  <p className="text-gray-400">Ne concentrăm pe livrarea de rezultate concrete și măsurabile pentru clienți.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Info;
