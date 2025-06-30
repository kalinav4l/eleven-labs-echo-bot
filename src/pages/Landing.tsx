
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import TextPressure from '@/components/TextPressure';
import ScrollReveal from '@/components/ScrollReveal';
import { Bot, BarChart3, PhoneCall } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
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

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleSignUpClick = () => {
    navigate('/auth');
  };

  const descriptionText = "Kalina AI este o platformă avansată, concepută pentru a revoluționa modul în care afacerile interacționează cu clienții lor. Noi transformăm comunicarea telefonică prin implementarea unor agenți vocali bazați pe inteligență artificială, capabili să poarte conversații fluide, naturale și extrem de eficiente, disponibile 24/7.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img alt="Kalina AI Logo" className="h-8 w-auto" src="/lovable-uploads/b4598fa6-e9e2-4058-bb5f-62e79ea68676.png" />
              <span className="text-xl font-bold">KALINA AI</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-white/30 hover:bg-white/10 bg-transparent" onClick={handleAuthClick}>
                Autentificare
              </Button>
              <Button className="bg-white hover:bg-gray-100 text-red-800 rounded-full px-6 font-semibold" onClick={handleSignUpClick}>
                SIGN UP
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Animated Title Section */}
      <section className="pt-20 pb-4 px-[35px] py-[199px]">
        <div className="w-full">
          <div className="h-32 w-full" style={{ letterSpacing: '3vw' }}>
            <TextPressure text="KALINA" textColor="#FFFFFF" minFontSize={120} weight={true} width={true} italic={false} scale={true} className="w-full" />
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold">Construit pentru Performanță</h2>
              <p className="text-xl text-white/80 mt-4 max-w-3xl mx-auto">
                Platforma noastră vă oferă uneltele necesare pentru a automatiza, analiza și optimiza comunicarea telefonică.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <ScrollReveal delay={0.1}>
              <div className="bg-black/20 p-8 rounded-xl border border-white/20 h-full">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-500 mb-6">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Agenți Autonomi</h3>
                <p className="text-white/70">
                  Creați agenți AI capabili să poarte conversații naturale, să răspundă la întrebări și să îndeplinească sarcini complexe 24/7.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 2 */}
            <ScrollReveal delay={0.2}>
              <div className="bg-black/20 p-8 rounded-xl border border-white/20 h-full">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-500 mb-6">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Campanii Scalabile</h3>
                <p className="text-white/70">
                  Lansați campanii de apeluri outbound către mii de contacte cu un singur click. Ideal pentru vânzări, marketing sau sondaje.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 3 */}
            <ScrollReveal delay={0.3}>
              <div className="bg-black/20 p-8 rounded-xl border border-white/20 h-full">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-500 mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Analiză Detaliată</h3>
                <p className="text-white/70">
                  Obțineți transcrieri complete și rapoarte de performanță pentru fiecare apel, transformând conversațiile în date acționabile.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Container cu text animat pe fundal alb cu text roșu */}
      <section className="py-24 px-6 bg-white">
        <ScrollReveal
          containerClassName="max-w-4xl mx-auto text-center"
          textClassName="text-2xl md:text-3xl leading-relaxed font-medium text-red-600"
        >
          {descriptionText}
        </ScrollReveal>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
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
