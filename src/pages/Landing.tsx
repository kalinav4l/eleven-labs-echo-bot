import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { 
  Bot, 
  Phone, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Search,
  Mail,
  Settings,
  BarChart3,
  Shield,
  Users,
  Zap,
  ArrowRight,
  Play,
  ChevronDown,
  Star,
  Quote
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Landing = () => {
  const { user, loading } = useAuth();
  const { scrollYProgress } = useScroll();
  const [activeSection, setActiveSection] = useState(0);
  
  // Parallax effects
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);

  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[data-section]');
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const companies = [
    "TechCorp", "InnovateCo", "FutureNext", "GlobalTech", "SmartBiz"
  ];

  const features = [
    {
      category: "AI & Analytics",
      items: [
        {
          icon: Bot,
          title: "Agents",
          description: "Implementează agenți AI inteligenți care interacționează natural cu clienții tăi, optimizează fluxurile de lucru și gestionează solicitările complexe 24/7."
        },
        {
          icon: BarChart3,
          title: "Analytics",
          description: "Obține insight-uri acționabile din fiecare conversație. Analizează tendințele, identifică punctele slabe și ia decizii bazate pe date pentru a îmbunătăți performanța."
        }
      ]
    },
    {
      category: "Communications",
      items: [
        {
          icon: Phone,
          title: "Calls",
          description: "Gestionează apelurile cu o eficiență fără precedent. Înregistrează, transcrie și analizează fiecare interacțiune pentru un control complet."
        },
        {
          icon: Calendar,
          title: "Calendar",
          description: "Planifică și organizează-ți activitățile telefonice direct din platformă. Sincronizează-te cu echipa și nu rata niciun apel important."
        }
      ]
    },
    {
      category: "Data & Tools",
      items: [
        {
          icon: FileText,
          title: "Transcripts",
          description: "Convertește automat fiecare apel în transcrieri text precise. Accesează rapid informațiile cheie și optimizează procesele de conformitate."
        },
        {
          icon: Search,
          title: "Scraping",
          description: "Extrage date relevante de pe web pentru a îmbunătăți inteligența agenților tăi AI și pentru a personaliza experiențele clienților."
        },
        {
          icon: Mail,
          title: "Gmail",
          description: "Integrează-te cu Gmail pentru a sincroniza comunicările și a menține toate interacțiunile într-un singur loc."
        }
      ]
    },
    {
      category: "Workflow & Automation",
      items: [
        {
          icon: Settings,
          title: "Construction",
          description: "Construiește și automatizează fluxuri de lucru complexe, adaptate nevoilor tale specifice. De la rutarea apelurilor la gestionarea solicitărilor, totul este simplificat."
        }
      ]
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Scalabilitate",
      description: "Platforma noastră se adaptează creșterii afacerii tale, indiferent de volumul de apeluri."
    },
    {
      icon: Shield,
      title: "Securitate",
      description: "Datele tale sunt protejate prin cele mai avansate protocoale de securitate."
    },
    {
      icon: Users,
      title: "Suport Dedicat",
      description: "Echipa noastră de experți este alături de tine la fiecare pas."
    },
    {
      icon: Star,
      title: "Inovație Constantă",
      description: "Beneficiezi întotdeauna de cele mai noi tehnologii în domeniul AI."
    }
  ];

  const testimonials = [
    {
      quote: "Kalina AI a transformat modul în care interacționăm cu clienții. Eficiență remarcabilă!",
      author: "Maria Popescu",
      position: "CEO",
      company: "TechCorp"
    },
    {
      quote: "Implementarea a fost simplă și rezultatele au fost imediate. Recomand cu încredere!",
      author: "Alexandru Ionescu",
      position: "Director IT",
      company: "InnovateCo"
    },
    {
      quote: "Cea mai bună investiție pe care am făcut-o pentru optimizarea comunicărilor.",
      author: "Elena Georgescu",
      position: "Manager Operations",
      company: "FutureNext"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-black z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="text-xl font-bold text-black"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Kalina AI
            </motion.div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-black transition-colors">Features</a>
              <a href="#benefits" className="text-gray-600 hover:text-black transition-colors">Benefits</a>
              <a href="#testimonials" className="text-gray-600 hover:text-black transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-600 hover:text-black transition-colors">Contact</a>
            </nav>

            <div className="flex space-x-3">
              <Link to="/auth">
                <Button variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-black text-white hover:bg-gray-800">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        data-section="0"
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100"
          style={{ y: yBg, opacity }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h1 
            className="text-6xl md:text-8xl font-bold text-black mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Kalina AI
          </motion.h1>
          
          <motion.h2 
            className="text-xl md:text-2xl text-gray-600 mb-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Viitorul Comunicațiilor Telefonice, Astăzi
          </motion.h2>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-500 mb-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transformăm interacțiunile tale telefonice cu Inteligența Artificială de ultimă generație
          </motion.p>
          
          <motion.h3 
            className="text-base md:text-lg font-medium text-black mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Eficiență. Inteligență. Conectivitate.
          </motion.h3>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button 
              size="lg" 
              className="bg-black text-white hover:bg-gray-800 px-8 py-4 text-lg"
            >
              Solicită un Demo Acum
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-300 text-black hover:bg-gray-50 px-8 py-4 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Trust Section */}
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <p className="text-sm text-gray-500 mb-6">Partener de Încredere pentru Companii de Top</p>
            <div className="flex flex-wrap justify-center items-center gap-8">
              {companies.map((company, index) => (
                <motion.div
                  key={company}
                  className="text-gray-400 font-medium text-lg hover:text-black transition-colors cursor-pointer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="h-6 w-6 text-gray-400" />
        </motion.div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white" data-section="1">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
              Deblochează Potențialul Comunicării Tale
            </h2>
            <p className="text-xl text-gray-600 mb-16">
              Optimizarea apelurilor, analiza datelor și automatizarea sarcinilor - totul într-o singură platformă puternică.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "AI & Analytics",
                description: "Inteligență avansată pentru optimizarea comunicărilor și analiza datelor"
              },
              {
                icon: Phone,
                title: "Communications",
                description: "Gestionarea apelurilor cu tehnologie de ultimă generație"
              },
              {
                icon: Settings,
                title: "Workflow & Automation",
                description: "Automatizarea proceselor pentru eficiență maximă"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="text-center p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <item.icon className="h-8 w-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50" data-section="2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
              Caracteristici Detaliate
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descoperă toate funcționalitățile care fac din Kalina AI soluția completă pentru comunicările tale telefonice.
            </p>
          </motion.div>

          <div className="space-y-20">
            {features.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-black mb-8 text-center">{category.category}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  {category.items.map((item, itemIndex) => (
                    <Card key={itemIndex} className="p-8 bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-6 w-6 text-gray-700" />
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-black mb-3">{item.title}</h4>
                          <p className="text-gray-600 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-white" data-section="3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
              De Ce Să Alegi Kalina AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beneficiile care fac diferența în comunicațiile tale de afaceri.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="text-center p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <benefit.icon className="h-8 w-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-black">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50" data-section="4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
              Ce Spun Clienții Noștri
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descoperă cum Kalina AI a transformat comunicațiile pentru companii de toate dimensiunile.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 bg-white border border-gray-200 h-full">
                  <div className="flex items-center mb-4">
                    <Quote className="h-8 w-8 text-gray-400 mr-3" />
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-black">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.position}, {testimonial.company}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-black text-white" data-section="5">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ești Gata Să Duci Comunicațiile<br />La Următorul Nivel?
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Contactează-ne astăzi pentru o demonstrație personalizată și descoperă cum Kalina AI poate revoluționa afacerea ta.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg"
              >
                Programează un Demo Acum
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg"
              >
                Contactează Echipa
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">Kalina AI</h3>
              <p className="text-gray-400 mb-4">
                Viitorul comunicațiilor telefonice,<br />
                disponibil astăzi pentru afacerea ta.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produs</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Funcționalități</a></li>
                <li><a href="#benefits" className="hover:text-white">Beneficii</a></li>
                <li><a href="#" className="hover:text-white">Prețuri</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Companie</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Despre Noi</a></li>
                <li><a href="#" className="hover:text-white">Cariere</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suport</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentație</a></li>
                <li><a href="#" className="hover:text-white">Centru de Ajutor</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Comunitate</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 Kalina AI. Toate drepturile rezervate.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
                <a href="#" className="hover:text-white">Politica de Confidențialitate</a>
                <a href="#" className="hover:text-white">Termeni și Condiții</a>
                <a href="#" className="hover:text-white">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;