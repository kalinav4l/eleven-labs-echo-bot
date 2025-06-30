import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import TextPressure from '@/components/TextPressure';
import ScrollReveal from '@/components/ScrollReveal';
import Aurora from '@/components/Aurora';
import { Bot, BarChart3, PhoneCall, Play, CheckCircle, Star, ArrowRight, Users, Zap, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white relative">
      {/* Aurora Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <Aurora 
          colorStops={["#dc2626", "#ef4444", "#f87171"]} 
          amplitude={0.8}
          blend={0.3}
          speed={0.5}
        />
      </div>

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
      <section className="pt-20 pb-4 px-[35px] py-[199px] relative z-10">
        <div className="w-full">
          <div className="h-32 w-full" style={{ letterSpacing: '3vw' }}>
            <TextPressure text="KALINA" textColor="#FFFFFF" minFontSize={120} weight={true} width={true} italic={false} scale={true} className="w-full" />
          </div>
        </div>
      </section>

      {/* Hero Stats Section */}
      <section className="py-16 px-6 relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">10k+</div>
              <div className="text-white/80">Apeluri procesate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-white/80">Uptime garantat</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-white/80">Limbi suportate</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80">Suport disponibil</div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Call Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Testează Kalina AI acum</h2>
          <p className="text-xl text-white/90 mb-8">
            Introdu numărul tău de telefon și primește un apel demo în următoarele minute
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="tel"
              placeholder="Numărul tău de telefon"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 bg-white/10 border-white/30 text-white placeholder-white/60"
            />
            <Button 
              onClick={handleDemoCall}
              disabled={isLoading}
              className="bg-white text-red-800 hover:bg-gray-100 px-8 font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-800 mr-2"></div>
                  Se inițiază...
                </div>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Apel Demo
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
      <section className="py-20 px-6 relative z-10">
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

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white/5 backdrop-blur-sm relative z-10">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">De ce să alegi Kalina AI?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Implementare Rapidă</h3>
                  <p className="text-white/80">Configurare completă în mai puțin de 5 minute, fără cunoștințe tehnice.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Securitate Maximă</h3>
                  <p className="text-white/80">Conformitate GDPR și criptare end-to-end pentru toate conversațiile.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Performanță Superioară</h3>
                  <p className="text-white/80">Timp de răspuns sub 200ms și recunoaștere vocală cu precizie de 99.8%.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Suport Dedicat</h3>
                  <p className="text-white/80">Echipă de specialiști disponibilă 24/7 pentru asistență tehnică.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Ce spun clienții noștri</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/90 mb-4">
                  "Kalina AI a revoluționat departamentul nostru de vânzări. Acum procesăm de 3 ori mai multe lead-uri cu același personal."
                </p>
                <div className="text-sm text-white/70">
                  <div className="font-semibold">Maria Popescu</div>
                  <div>Director Vânzări, TechCorp</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/90 mb-4">
                  "Implementarea a fost surprinzător de simplă. În doar câteva ore aveam primul agent funcțional."
                </p>
                <div className="text-sm text-white/70">
                  <div className="font-semibold">Andrei Ionescu</div>
                  <div>CTO, StartupHub</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white/90 mb-4">
                  "Calitatea conversațiilor este impresionantă. Clienții nici nu realizează că vorbesc cu un AI."
                </p>
                <div className="text-sm text-white/70">
                  <div className="font-semibold">Elena Vasile</div>
                  <div>Manager Customer Success</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative z-10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ești gata să construiești viitorul comunicării?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            Creează-ți contul gratuit astăzi și lansează primul tău agent telefonic AI în mai puțin de 5 minute.
          </p>
          <Button className="bg-white hover:bg-gray-100 text-red-800 px-12 py-6 text-xl rounded-full font-semibold group">
            Începe să Construiești Gratuit
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
      
      {/* Animated Description Section */}
      <section className="py-24 px-6 relative z-10">
        <ScrollReveal
          containerClassName="max-w-4xl mx-auto text-center"
          textClassName="text-2xl md:text-3xl leading-relaxed font-medium text-white/90"
        >
          {descriptionText}
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white relative z-10">
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
