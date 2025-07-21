import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThreadsBackground } from '@/components/landing/ThreadsBackground';
import { Mic, ArrowRight, CheckCircle, Users, TrendingUp, Zap, Globe, Shield, PlayCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const Landing = () => {
  const { user } = useAuth();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [statsCounters, setStatsCounters] = useState({ efficiency: 0, conversion: 0, clients: 0 });
  
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal('up', 0.2);
  const { ref: testimonialsRef, isVisible: testimonialsVisible } = useScrollReveal('up', 0.3);
  const { ref: pricingRef, isVisible: pricingVisible } = useScrollReveal('up', 0.4);

  // Testimonials data
  const testimonials = [
    {
      name: "Maria Popescu",
      role: "CEO, Restaurant Central",
      text: "Kallina.AI ne-a ajutat să automatizăm rezervările. Acum clientii pot rezerva 24/7.",
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "Alexandru Ionescu",
      role: "Director, Clinica MedLife",
      text: "Programările sunt acum complet automatizate. Eficiența a crescut cu 85%.",
      avatar: "/api/placeholder/60/60"
    },
    {
      name: "Carmen Dumitrescu",
      role: "Manager, Agenția Dream Travel",
      text: "Clienții primesc informații instant despre pachete și destinații. Conversiile au crescut cu 200%.",
      avatar: "/api/placeholder/60/60"
    }
  ];

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Animate counters when stats section is visible
  useEffect(() => {
    if (statsVisible) {
      const animateCounter = (target: number, setter: (value: number) => void) => {
        let start = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            setter(target);
            clearInterval(timer);
          } else {
            setter(Math.floor(start));
          }
        }, 30);
      };

      animateCounter(90, (val) => setStatsCounters(prev => ({ ...prev, efficiency: val })));
      animateCounter(300, (val) => setStatsCounters(prev => ({ ...prev, conversion: val })));
      animateCounter(1200, (val) => setStatsCounters(prev => ({ ...prev, clients: val })));
    }
  }, [statsVisible]);

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      {/* Header */}
      <header className="relative z-50 bg-white/95 backdrop-blur-sm border-b border-black/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-black"
            >
              KALLINA.AI
            </motion.div>
            <nav className="hidden md:flex space-x-8">
              <a href="#demo" className="text-gray-600 hover:text-black transition-colors duration-200 font-medium">Demo Live</a>
              <a href="#pricing" className="text-gray-600 hover:text-black transition-colors duration-200 font-medium">Prețuri</a>
              <a href="#features" className="text-gray-600 hover:text-black transition-colors duration-200 font-medium">Funcționalități</a>
              <a href="#solutions" className="text-gray-600 hover:text-black transition-colors duration-200 font-medium">Soluții</a>
            </nav>
            <div className="flex space-x-3">
              <Link to="/auth">
                <Button variant="outline" className="border-black/20 text-black hover:bg-black/5 transition-all duration-200">
                  Autentificare
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-black text-white hover:bg-gray-800 transition-all duration-200 group">
                  Începe Gratuit
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
        <ThreadsBackground
          className="absolute inset-0 z-0 pointer-events-none w-full h-full opacity-30"
          color={[0, 0, 0]}
          amplitude={0.8}
          distance={0.3}
          enableMouseInteraction={true}
        />
        <div className="relative z-10 max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black text-black mb-8 tracking-tight"
          >
            Creează agent <span className="relative inline-block">
              AI
              <motion.div
                className="absolute -inset-2 bg-black/5 -z-10 rounded-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              />
            </span> în 3 minute
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transformă-ți afacerea cu primul angajat digital perfect instruit.
            <br />
            <span className="text-lg text-gray-500 mt-2 block">AI românesc, NLP avansat, disponibil 24/7</span>
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-6 mb-16"
          >
            <Button 
              size="lg"
              className="bg-black text-white hover:bg-gray-800 px-12 py-4 text-xl font-semibold group transition-all duration-300 transform hover:scale-105"
            >
              Începe Gratuit
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              className="border-2 border-black text-black hover:bg-black hover:text-white px-12 py-4 text-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <PlayCircle className="mr-3 h-5 w-5" />
              Demo Live
            </Button>
          </motion.div>

          {/* Interactive Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-black/10 p-8 hover:shadow-2xl transition-all duration-500">
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Conversații Naturale</h3>
                    <p className="text-gray-600">AI care înțelege contextul și emoțiile</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Răspuns Instant</h3>
                    <p className="text-gray-600">Latență minimă pentru interacțiuni fluide</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">Disponibil 24/7</h3>
                    <p className="text-gray-600">Niciodată nu își ia pauză sau concediu</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <motion.section 
        ref={testimonialsRef}
        initial={{ opacity: 0 }}
        animate={testimonialsVisible ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gray-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Ce spun clienții noștri</h2>
            <p className="text-xl text-gray-600">Rezultate reale de la afaceri reale</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Card className="bg-white border-2 border-black/5 p-12 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mr-6"></div>
                    <div className="text-left">
                      <h4 className="font-bold text-lg">{testimonials[currentTestimonial].name}</h4>
                      <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                    </div>
                  </div>
                  <blockquote className="text-2xl text-gray-800 italic leading-relaxed">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <div className="flex justify-center mt-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
            
            {/* Testimonial indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-black' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Impact Statistics Section */}
      <motion.section 
        ref={statsRef}
        initial={{ opacity: 0, y: 50 }}
        animate={statsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="py-24 bg-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-black mb-6">Rezultate măsurabile</h2>
            <p className="text-xl text-gray-600">Statistici reale de la implementări actuale</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={statsVisible ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="group"
            >
              <div className="text-7xl font-black text-black mb-4 group-hover:scale-110 transition-transform duration-300">
                {statsCounters.efficiency}%
              </div>
              <div className="text-xl font-semibold text-gray-800 mb-2">Reducere timp manual</div>
              <div className="text-gray-600">Automatizare completă a proceselor repetitive</div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={statsVisible ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="group"
            >
              <div className="text-7xl font-black text-black mb-4 group-hover:scale-110 transition-transform duration-300">
                {Math.floor(statsCounters.conversion / 100)}x
              </div>
              <div className="text-xl font-semibold text-gray-800 mb-2">Creștere conversii</div>
              <div className="text-gray-600">Disponibilitate 24/7 și răspunsuri instant</div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={statsVisible ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="group"
            >
              <div className="text-7xl font-black text-black mb-4 group-hover:scale-110 transition-transform duration-300">
                {statsCounters.clients}+
              </div>
              <div className="text-xl font-semibold text-gray-800 mb-2">Afaceri mulțumite</div>
              <div className="text-gray-600">În România și Europa de Est</div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Trusted Companies Section */}
      <section className="py-16 bg-gray-50 border-t border-black/5">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600 mb-12 text-lg">
            Încrederea acordată de companii din diverse industrii
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
            <div className="h-16 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="font-semibold text-gray-600">Restaurant</span>
            </div>
            <div className="h-16 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="font-semibold text-gray-600">Clinică</span>
            </div>
            <div className="h-16 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="font-semibold text-gray-600">Service Auto</span>
            </div>
            <div className="h-16 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="font-semibold text-gray-600">Turism</span>
            </div>
            <div className="h-16 bg-gray-300 rounded-lg flex items-center justify-center">
              <span className="font-semibold text-gray-600">Retail</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <motion.section 
        ref={pricingRef}
        initial={{ opacity: 0, y: 50 }}
        animate={pricingVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        id="pricing"
        className="py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-black mb-6">Planuri Simple, Transparente</h2>
            <p className="text-xl text-gray-600">Alege soluția perfectă pentru afacerea ta</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="p-8 bg-white border-2 border-gray-200 hover:border-black/20 transition-all duration-300 hover:shadow-xl">
              <div className="text-center">
                <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm mb-6">
                  Pentru început
                </div>
                <h3 className="text-2xl font-bold mb-4">Starter</h3>
                <div className="text-4xl font-black mb-2">
                  €29
                  <span className="text-lg text-gray-500 font-normal">/lună</span>
                </div>
                <p className="text-gray-600 mb-8">Perfect pentru afaceri mici</p>
                
                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>500 minute conversații/lună</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>1 agent AI personalizat</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Integrări de bază</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300">
                  Începe gratuit
                </Button>
              </div>
            </Card>

            {/* Professional Plan - Popular */}
            <Card className="p-8 bg-black text-white relative transform scale-105 hover:scale-110 transition-transform duration-300">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold">
                  Cel mai popular
                </span>
              </div>
              <div className="text-center">
                <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm mb-6">
                  Pentru profesioniști
                </div>
                <h3 className="text-2xl font-bold mb-4">Professional</h3>
                <div className="text-4xl font-black mb-2">
                  €99
                  <span className="text-lg text-gray-300 font-normal">/lună</span>
                </div>
                <p className="text-gray-300 mb-8">Pentru afaceri în creștere</p>
                
                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    <span>2000 minute conversații/lună</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    <span>5 agenți AI personalizați</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    <span>Analiză avansată</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    <span>Integrări premium</span>
                  </div>
                </div>
                
                <Button className="w-full bg-white text-black hover:bg-gray-100 transition-all duration-300">
                  Începe gratuit
                </Button>
              </div>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 bg-white border-2 border-gray-200 hover:border-black/20 transition-all duration-300 hover:shadow-xl">
              <div className="text-center">
                <div className="inline-block bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm mb-6">
                  Pentru enterprise
                </div>
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <div className="text-4xl font-black mb-2">
                  Custom
                </div>
                <p className="text-gray-600 mb-8">Soluții personalizate</p>
                
                <div className="space-y-4 text-left mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Minute nelimitate</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Agenți nelimitați</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Suport dedicat</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <span>Implementare on-premise</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full border-2 border-black text-black hover:bg-black hover:text-white transition-all duration-300">
                  Contactează-ne
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Toate planurile includ 14 zile de probă gratuită • Fără obligații contractuale
            </p>
            <Button size="lg" variant="outline" className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-3">
              Vezi toate funcționalitățile
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Gata să transformi
              <br />
              <span className="text-gray-400">afacerea ta?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Alătură-te celor peste 1.200 de afaceri care au automatizat deja procesele cu KALLINA.AI. 
              Începe gratuit astăzi și vezi diferența în prima săptămână.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
              <Button 
                size="lg"
                className="bg-white text-black hover:bg-gray-100 px-12 py-4 text-xl font-semibold group transition-all duration-300 transform hover:scale-105"
              >
                Începe Gratuit Acum
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white hover:text-black px-12 py-4 text-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Programează Demo
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-gray-300">14 zile gratuit</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-gray-300">Fără card de credit</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <span className="text-gray-300">Suport în română</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Produs</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Demo Live</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Funcționalități</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Prețuri</a></li>
                <li><a href="#" className="hover:text-black transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Soluții</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Restaurant</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Clinică</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Service Auto</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Turism</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Companie</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Despre noi</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Cariere</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Suport</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-black transition-colors">Documentație</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Ghiduri</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Comunitate</a></li>
                <li><a href="#" className="hover:text-black transition-colors">Suport tehnic</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-black/10">
            <div className="text-2xl font-bold text-black mb-4 md:mb-0">
              KALLINA.AI
            </div>
            <div className="text-gray-600 text-center md:text-right">
              <p>© 2024 KALLINA.AI. Toate drepturile rezervate.</p>
              <p className="text-sm mt-1">Primul AI românesc pentru afaceri moderne</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;