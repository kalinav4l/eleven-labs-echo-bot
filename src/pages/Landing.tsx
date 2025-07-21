import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Bot, 
  Phone, 
  Play,
  Pause,
  Volume2,
  Mic,
  ArrowRight,
  Star,
  ChevronDown,
  Zap,
  Shield,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  Settings
} from 'lucide-react';

const Landing = () => {
  const { user, loading } = useAuth();
  const { scrollYProgress } = useScroll();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const demoRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const demoInView = useInView(demoRef, { once: true });
  
  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const elements = document.querySelectorAll('.parallax-element');
      
      elements.forEach((element, index) => {
        const speed = 0.5 + index * 0.1;
        const yPos = -(scrolled * speed);
        (element as HTMLElement).style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const demos = [
    {
      title: "Customer Support AI",
      description: "AI care răspunde la întrebări complexe cu empatie și profesionalism",
      waveform: [0.2, 0.8, 0.4, 0.9, 0.3, 0.7, 0.5, 0.6, 0.8, 0.2, 0.9, 0.4]
    },
    {
      title: "Sales Assistant AI", 
      description: "Agent AI pentru prospectare și calificare de leaduri",
      waveform: [0.5, 0.3, 0.8, 0.2, 0.9, 0.4, 0.7, 0.6, 0.3, 0.8, 0.5, 0.9]
    },
    {
      title: "Appointment Scheduler",
      description: "Planificarea automată de întâlniri cu sincronizare calendar",
      waveform: [0.7, 0.5, 0.2, 0.8, 0.4, 0.9, 0.3, 0.6, 0.7, 0.4, 0.8, 0.2]
    }
  ];

  const features = [
    {
      icon: Bot,
      title: "AI Agents",
      description: "Agenți AI inteligenți care înțeleg contextul și răspund natural",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Phone,
      title: "Voice Calls",
      description: "Gestionarea apelurilor cu voce naturală și conversații fluide",
      color: "from-green-500 to-blue-500"
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Insight-uri detaliate din fiecare conversație și interacțiune",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Settings,
      title: "Automation",
      description: "Fluxuri de lucru automatizate pentru eficiență maximă",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: MessageSquare,
      title: "Multi-Channel",
      description: "Suport pentru telefon, chat, email și platforme sociale",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: FileText,
      title: "Transcripts",
      description: "Transcrieri automate cu analiză de sentiment și keywords",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 z-50"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-lg border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              Kalina AI
            </motion.div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#demo" className="text-gray-300 hover:text-white transition-colors">Demo</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            </nav>

            <div className="flex space-x-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen relative flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"
            style={{ y, opacity }}
          />
          {/* Floating Particles */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Kalina AI
              </span>
            </h1>
            
            <motion.h2 
              className="text-2xl md:text-3xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Viitorul Comunicațiilor Vocale cu AI
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transformă interacțiunile tale cu agenți AI care vorbesc, înțeleg și răspund 
              natural în română, oferind experiențe personalizate pentru fiecare client.
            </motion.p>

            {/* Voice Demo Button */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg group"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="mr-2 h-5 w-5" />
                ) : (
                  <Play className="mr-2 h-5 w-5" />
                )}
                Ascultă Demo Voce
                <motion.div
                  className="ml-2"
                  animate={{ x: isPlaying ? 0 : [0, 5, 0] }}
                  transition={{ duration: 1, repeat: isPlaying ? 0 : Infinity }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </Button>

              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                <Mic className="mr-2 h-5 w-5" />
                Începe Gratis
              </Button>
            </motion.div>

            {/* Voice Waveform Visualization */}
            <motion.div
              className="flex justify-center space-x-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                  style={{ height: '20px' }}
                  animate={isPlaying ? {
                    height: [`${20 + Math.random() * 40}px`, `${10 + Math.random() * 50}px`],
                    opacity: [0.5, 1, 0.5]
                  } : {}}
                  transition={{
                    duration: 0.5 + Math.random() * 0.5,
                    repeat: isPlaying ? Infinity : 0,
                    delay: i * 0.1
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="h-8 w-8 text-white/60" />
        </motion.div>
      </section>

      {/* Interactive Demo Section */}
      <section ref={demoRef} className="py-32 relative" id="demo">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={demoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Demonstrație Interactivă
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experimentează puterea agenților AI Kalina în scenarii reale de business
            </p>
          </motion.div>

          {/* Demo Cards */}
          <div className="grid lg:grid-cols-3 gap-8">
            {demos.map((demo, index) => (
              <motion.div
                key={index}
                className={`p-8 rounded-2xl border border-white/10 backdrop-blur-sm relative overflow-hidden cursor-pointer group ${
                  currentDemo === index ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' : 'bg-black/40'
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={demoInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                onClick={() => setCurrentDemo(index)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 text-white">{demo.title}</h3>
                  <p className="text-gray-400 mb-6">{demo.description}</p>
                  
                  {/* Waveform */}
                  <div className="flex items-end space-x-1 mb-6">
                    {demo.waveform.map((height, i) => (
                      <motion.div
                        key={i}
                        className="w-2 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                        style={{ height: `${height * 40}px` }}
                        animate={currentDemo === index ? {
                          height: [`${height * 40}px`, `${height * 60}px`, `${height * 40}px`]
                        } : {}}
                        transition={{
                          duration: 1 + Math.random(),
                          repeat: currentDemo === index ? Infinity : 0,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </div>

                  <Button 
                    variant={currentDemo === index ? "default" : "outline"}
                    className={currentDemo === index ? 
                      "bg-gradient-to-r from-blue-600 to-purple-600" : 
                      "border-white/20 text-white hover:bg-white/10"
                    }
                  >
                    {currentDemo === index ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        În Redare
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Ascultă Demo
                      </>
                    )}
                  </Button>
                </div>

                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Funcționalități Avansate
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Toate instrumentele de care ai nevoie pentru a automatiza și optimiza comunicațiile
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm group hover:border-white/20 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Începe Transformarea Astăzi
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Alătură-te miilor de companii care au automatizat comunicațiile cu Kalina AI
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg"
              >
                Începe Gratis - 14 Zile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                Programează Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 md:mb-0">
              Kalina AI
            </div>
            
            <div className="flex space-x-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-500">
            © 2024 Kalina AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;