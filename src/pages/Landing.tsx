import React from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { ThreadsBackground } from '@/components/landing/ThreadsBackground';
import { TrustedBy } from '@/components/landing/TrustedBy';
import SpeechBot from '@/components/SpeechBot';
import { Mic, Settings, MessageCircle, Link as LinkIcon, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const Landing = () => {
  const { user, loading } = useAuth();
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal('up', 0.2);
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollReveal('up', 0.3);
  const { ref: howItWorksRef, isVisible: howItWorksVisible } = useScrollReveal('up', 0.4);
  const { ref: faqRef, isVisible: faqVisible } = useScrollReveal('up', 0.5);

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

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="relative z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-xl font-semibold text-black">Kalina AI</div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-black">Products</a>
              <a href="#" className="text-gray-600 hover:text-black">Solutions</a>
              <a href="#" className="text-gray-600 hover:text-black">Research</a>
              <a href="#" className="text-gray-600 hover:text-black">Resources</a>
              <a href="#" className="text-gray-600 hover:text-black">Pricing</a>
              <a href="#" className="text-gray-600 hover:text-black">Company</a>
            </nav>
            <div className="flex space-x-3">
              <Link to="/auth">
                <Button variant="outline" className="border-gray-300 text-black hover:bg-gray-50">
                  Sign in
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
      <section className="relative py-20 bg-white overflow-hidden">
        <ThreadsBackground
          className="absolute inset-0 z-0 pointer-events-none w-full h-full"
          color={[0, 0, 0]}
          amplitude={1.5}
          distance={0.5}
          enableMouseInteraction={false}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-black mb-6"
          >
            Creează agent <span className="text-blue-400">AI</span> în 3 minute
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 mb-8"
          >
            Transformă-ți afacerea cu primul angajat digital perfect<br />
            instruit.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">
              Începe Trial Gratuit
            </Button>
            <Button variant="outline" className="border-gray-300 text-black hover:bg-gray-50 px-8 py-3 text-lg">
              Sign In
            </Button>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-gray-100 rounded-full p-1">
              <button className="bg-black text-white px-6 py-2 rounded-full text-sm">
                Conversation AI
              </button>
              <button className="text-gray-600 px-6 py-2 rounded-full text-sm hover:text-black">
                Calendar AI
              </button>
            </div>
          </div>

          {/* Try Kalina AI Section */}
          <Card className="max-w-3xl mx-auto bg-white border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold mb-4">Try Kalina AI</h3>
              <p className="text-gray-600 mb-8">
                Experience AI-powered voice conversations with natural, human-like<br />
                responses
              </p>
            </div>

            {/* Voice Interface */}
            <div className="relative mb-8">
              <div className="flex justify-center mb-8">
                <div className="w-32 h-32 bg-black rounded-full flex items-center justify-center">
                  <Mic className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Agent Examples */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <Button variant="outline" className="w-full mb-2 bg-black text-white border-black hover:bg-gray-800">
                    Restaurant
                  </Button>
                </div>
                <div className="text-center">
                  <Button variant="outline" className="w-full mb-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                    Clinică
                  </Button>
                </div>
                <div className="text-center">
                  <Button variant="outline" className="w-full mb-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                    Service Auto
                  </Button>
                </div>
                <div className="text-center">
                  <Button variant="outline" className="w-full mb-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                    Agenție de Turism
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Button variant="outline" className="w-full mb-2 bg-black text-white border-black hover:bg-gray-800">
                    Lili
                  </Button>
                </div>
                <div className="text-center">
                  <Button variant="outline" className="w-full mb-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                    Eric
                  </Button>
                </div>
                <div className="text-center">
                  <Button variant="outline" className="w-full mb-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                    Kalina
                  </Button>
                </div>
                <div className="text-center">
                  <Button variant="outline" className="w-full mb-2 border-gray-300 text-gray-600 hover:bg-gray-50">
                    Alexandra
                  </Button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <h4 className="font-semibold mb-2">Natural Conversations</h4>
                <p className="text-sm text-gray-600">AI that understands context<br />and emotions</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Realistic Voice</h4>
                <p className="text-sm text-gray-600">High-quality voice cloning<br />technology</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Instant Response</h4>
                <p className="text-sm text-gray-600">Minimal latency for smooth<br />interactions</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* TrustedBy Section */}
      <TrustedBy />
      
      {/* Speech Bot Section */}
      <SpeechBot />

      {/* Stats Section */}
      <motion.section 
        ref={statsRef}
        initial={{ opacity: 0, y: 50 }}
        animate={statsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-white relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-12">
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-gray-600">Developers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10B+</div>
              <div className="text-gray-600">Characters generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">29</div>
              <div className="text-gray-600">Languages supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-6">Ready to get started?</p>
            <Button className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg">
              Start building
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        ref={featuresRef}
        initial={{ opacity: 0, y: 50 }}
        animate={featuresVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm inline-block mb-6">
                Funcții principale
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Caracteristici<br />
                puternice
              </h2>
              <p className="text-gray-600 mb-8">
                Răspunsuri rapide, precise și eficiente, livrate de un<br />
                AI care înțelege și se adaptează perfect nevoilor<br />
                clienților tăi. Redefinește comunicarea vocală cu<br />
                tehnologia noastră avansată.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">Scalabilitate și Flexibilitate Pentru Nevoile Afacerii Tale</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">24/7 Suport Global</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-gray-600">99.9% Garanție Uptime</span>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-xl font-semibold mb-2">Frontier intelligence, tailored to You.</h3>
                <p className="text-gray-600">
                  Make your AI your own. Train, distill, fine-tune, and build with the world's best open<br />
                  source models.
                </p>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-xl font-semibold mb-2">Enterprise-grade. Agent-ready.</h3>
                <p className="text-gray-600">
                  Deploy agents that execute, adapt, and deliver real results, with powerful<br />
                  orchestration, tooling, and safety.
                </p>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-xl font-semibold mb-2">Privacy-first.</h3>
                <p className="text-gray-600">
                  Deploy and build with AI anywhere—on-premises, cloud, edge, devices, and more—<br />
                  while retaining full control of your data.
                </p>
              </Card>
              <Card className="p-6 bg-white border border-gray-200">
                <h3 className="text-xl font-semibold mb-2">Deeply engaged solutioning and value delivery.</h3>
                <p className="text-gray-600">
                  Hands-on assistance from the world's foremost applied AI scientists across<br />
                  deployment, solutioning, safety, and beyond.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Dark Features Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-12">
              <Card className="bg-gray-900 border-gray-800 p-8 text-white">
                <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm inline-block mb-4">
                  Caracteristica 1
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Disponibil Pentru Orice Tip de<br />
                  Companie
                </h3>
                <p className="text-gray-300 mb-6">
                  De la startup-uri la corporații mari, oferim tehnologii personalizate care se<br />
                  potrivesc perfect nevoilor oricărei companii.
                </p>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Află mai multe
                </Button>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-8 text-white">
                <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm inline-block mb-4">
                  Caracteristica 2
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Structura Simplu De Implementat
                </h3>
                <p className="text-gray-300 mb-6">
                  Construiește rapid și eficient fluxuri de conversație cu logică decizională,<br />
                  fără a necesita cunoștințe tehnice avansate.
                </p>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Află mai multe
                </Button>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-8 text-white">
                <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm inline-block mb-4">
                  Caracteristica 3
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Analizează Interacțiunile în Detaliu
                </h3>
                <p className="text-gray-300 mb-6">
                  Vezi în timp real toate conversațiile, deciziile luate și datele esențiale<br />
                  pentru a înțelege mai bine interacțiunile și a îmbunătăți experiența<br />
                  utilizatorilor.
                </p>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Află mai multe
                </Button>
              </Card>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-white rounded-2xl p-8 max-w-md">
                {/* Mock interface illustrations would go here */}
                <div className="space-y-4">
                  <div className="bg-gray-100 h-32 rounded-lg"></div>
                  <div className="bg-gray-100 h-24 rounded-lg"></div>
                  <div className="bg-gray-100 h-28 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <motion.section 
        ref={howItWorksRef}
        initial={{ opacity: 0, y: 50 }}
        animate={howItWorksVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Cum Funcționează</h2>
          <p className="text-gray-600 mb-16">
            Simplu, rapid și de încredere – începe în câteva minute
          </p>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LinkIcon className="w-8 h-8 text-gray-600" />
              </div>
              <div className="text-2xl font-bold mb-4">01</div>
              <h3 className="text-xl font-semibold mb-4">Conectează-te</h3>
              <p className="text-gray-600">
                Începe un apel cu infrastructura noastră cu<br />
                latență ultra-redusă
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="w-8 h-8 text-gray-600" />
              </div>
              <div className="text-2xl font-bold mb-4">02</div>
              <h3 className="text-xl font-semibold mb-4">Procesare inteligentă</h3>
              <p className="text-gray-600">
                AI-ul nostru analizează și optimizează<br />
                calitatea audio în timp real, pentru o<br />
                experiență impecabilă.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-gray-600" />
              </div>
              <div className="text-2xl font-bold mb-4">03</div>
              <h3 className="text-xl font-semibold mb-4">Conversează natural</h3>
              <p className="text-gray-600">
                Bucură-te de conversații fluide și clare,<br />
                oriunde în lume, asistate de inteligența<br />
                artificială.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        ref={faqRef}
        initial={{ opacity: 0, y: 50 }}
        animate={faqVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8 }}
        className="py-20 bg-black text-white"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Întrebări Frecvente</h2>
            <p className="text-gray-400">
              Tot ce trebuie să știi despre platforma noastră de apeluri cu AI
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-gray-900 rounded-lg border border-gray-800">
              <AccordionTrigger className="px-6 py-4 text-left text-white hover:text-gray-300">
                Care este latența apelurilor voastre?
                <Plus className="w-4 h-4 ml-auto" />
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-400">
                Infrastructura noastră cu AI oferă latență sub 100ms la nivel global, asigurând
                conversații în timp real.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-gray-900 rounded-lg border border-gray-800">
              <AccordionTrigger className="px-6 py-4 text-left text-white hover:text-gray-300">
                Cât de sigure sunt apelurile?
                <Plus className="w-4 h-4 ml-auto" />
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-400">
                Toate apelurile sunt criptate end-to-end și respectăm cele mai înalte standarde de securitate.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-gray-900 rounded-lg border border-gray-800">
              <AccordionTrigger className="px-6 py-4 text-left text-white hover:text-gray-300">
                Ce țări sunt suportate?
                <Plus className="w-4 h-4 ml-auto" />
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-400">
                Suportăm apeluri în peste 29 de țări cu acoperire globală completă.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-gray-900 rounded-lg border border-gray-800">
              <AccordionTrigger className="px-6 py-4 text-left text-white hover:text-gray-300">
                Pot integra cu sistemele mele existente?
                <Plus className="w-4 h-4 ml-auto" />
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 text-gray-400">
                Da, oferim API-uri complete și documentație pentru integrarea cu orice sistem existent.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="text-center mt-16">
            <Card className="bg-gray-900 border-gray-800 p-8 inline-block">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Încă ai întrebări?</h3>
              <p className="text-gray-400 mb-4">
                Echipa noastră de suport este aici să te ajute 24/7
              </p>
              <Button className="bg-gray-700 text-white hover:bg-gray-600">
                Contactează Suportul
              </Button>
            </Card>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Card className="bg-gray-900 border-gray-800 p-12">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Integrează un AI conversațional care răspunde<br />
              automat, învață din datele tale și oferă suport<br />
              de top non-stop.
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of companies already using Kalina AI for crystal-clear,<br />
              secure, and ultra-fast voice communications.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button className="bg-gray-700 text-white hover:bg-gray-600 px-8 py-3 text-lg">
                Start Free Trial
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg">
                Contact Sales →
              </Button>
            </div>
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-400">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                No credit card required
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                14-day free trial
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Cancel anytime
              </div>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              🔥 Limited time: Get 50% off your first 3 months
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">Kalina AI</h3>
              <p className="text-gray-400 mb-4">
                Crystal-clear AI calls, anywhere in the<br />
                world. Revolutionizing global<br />
                communications.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Kalina AI. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
                <a href="#" className="hover:text-white">Cookie Policy</a>
              </div>
            </div>
          </div>
          
          {/* Newsletter */}
          <div className="mt-12 text-center">
            <div className="bg-gray-900 rounded-lg p-8 max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Rămâi la curent</h4>
              <p className="text-gray-400 text-sm mb-4">
                Obține cele mai recente știri despre tehnologia de apeluri AI și<br />
                actualizări platformei!
              </p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button className="bg-white text-black hover:bg-gray-200">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Made with ❤️ by Kalina AI Team — 2025
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;