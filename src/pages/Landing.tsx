import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ThreadsBackground } from '@/components/landing/ThreadsBackground';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { 
  MessageCircle, 
  Phone, 
  Bot, 
  Zap, 
  Shield, 
  Users, 
  Brain, 
  Target, 
  Mic, 
  Globe, 
  BarChart3, 
  Clock,
  Check,
  ArrowRight,
  Play,
  Star,
  TrendingUp,
  Headphones,
  Lightbulb,
  Settings,
  Database,
  Sparkles,
  Rocket,
  Heart,
  Award,
  Plus,
  Link as LinkIcon
} from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  const heroRef = useScrollReveal('up', 0);
  const statsRef = useScrollReveal('up', 0.2);
  const featuresRef = useScrollReveal('left', 0.3);
  const howItWorksRef = useScrollReveal('right', 0.4);
  const testimonialsRef = useScrollReveal('up', 0.5);
  const ctaRef = useScrollReveal('up', 0.6);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Animated Background */}
      <ThreadsBackground
        className="absolute inset-0 z-0 pointer-events-none w-full h-full"
        color={[0, 0, 0]}
        amplitude={1.5}
        distance={0.5}
        enableMouseInteraction={false}
      />

      {/* Header */}
      <header className="relative z-50 border-b border-border/10 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Bot className="h-8 w-8 animate-subtle-pulse" />
              <span className="text-2xl font-bold text-shimmer">Kalina AI</span>
            </motion.div>
            
            <motion.nav 
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">How it Works</a>
              <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">Pricing</a>
              <a href="#contact" className="text-foreground/80 hover:text-foreground transition-colors">Contact</a>
            </motion.nav>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button onClick={handleGetStarted} className="feature-card">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            ref={heroRef.ref}
            className={`space-y-8 ${heroRef.animationClass}`}
          >
            <motion.div className="inline-flex items-center px-4 py-2 rounded-full border border-border/20 bg-background/50 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 mr-2 text-primary animate-subtle-pulse" />
              <span className="text-sm">Powered by Advanced AI Technology</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight">
              <span className="text-shimmer">Viitorul</span>
              <br />
              <span className="animate-text-glow">Conversațiilor AI</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Kalina AI transformă modul în care interacționezi cu clienții. 
              Agenți inteligenți care înțeleg, răspund și acționează cu precizie umană.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="px-8 py-6 text-lg feature-card animate-glow"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Începe Gratuit
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-lg feature-card"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <Play className="mr-2 h-5 w-5" />
                Vezi Demo
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
              {[
                { icon: Users, number: "10,000+", label: "Utilizatori Activi" },
                { icon: MessageCircle, number: "1M+", label: "Conversații" },
                { icon: TrendingUp, number: "99.9%", label: "Uptime" },
                { icon: Award, number: "4.9/5", label: "Rating" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className={`text-center stat-card-hover stagger-${index + 1}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <stat.icon className="h-8 w-8 mx-auto mb-4 text-primary animate-float" />
                  <div className="text-3xl font-bold animate-scale-in">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={featuresRef.ref}
            className={`text-center mb-20 ${featuresRef.animationClass}`}
          >
            <h2 className="text-5xl font-bold mb-6 text-shimmer">
              Funcții Revoluționare
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Descoperă puterea inteligenței artificiale adaptată nevoilor tale de business
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Conversațional Avansat",
                description: "Procesare naturală a limbajului cu înțelegere contextuală profundă",
                color: "from-blue-500/20 to-purple-500/20"
              },
              {
                icon: Phone,
                title: "Apeluri Vocale Inteligente",
                description: "Conversații vocale naturale cu recunoaștere și sinteză vocală",
                color: "from-green-500/20 to-teal-500/20"
              },
              {
                icon: Globe,
                title: "Suport Multilingv",
                description: "Comunicare în peste 50 de limbi cu traducere în timp real",
                color: "from-orange-500/20 to-red-500/20"
              },
              {
                icon: BarChart3,
                title: "Analytics Avansate",
                description: "Insights detaliate despre performanța și comportamentul utilizatorilor",
                color: "from-indigo-500/20 to-pink-500/20"
              },
              {
                icon: Shield,
                title: "Securitate Enterprise",
                description: "Criptare end-to-end și conformitate GDPR completă",
                color: "from-cyan-500/20 to-blue-500/20"
              },
              {
                icon: Settings,
                title: "Personalizare Completă",
                description: "Adaptează agentul AI la brandingul și nevoile tale specifice",
                color: "from-violet-500/20 to-purple-500/20"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className={`feature-card p-8 rounded-2xl border border-border/10 bg-gradient-to-br ${feature.color} backdrop-blur-sm stagger-${index + 1}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <feature.icon className="h-12 w-12 mb-6 text-primary animate-wave" />
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={howItWorksRef.ref}
            className={`text-center mb-20 ${howItWorksRef.animationClass}`}
          >
            <h2 className="text-5xl font-bold mb-6 animate-text-glow">
              Cum Funcționează
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Trei pași simpli pentru a-ți transforma experiența de customer service
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                icon: Settings,
                title: "Configurează",
                description: "Personalizează agentul AI cu informațiile despre business-ul tău și setează parametrii de conversație."
              },
              {
                step: "02",
                icon: Zap,
                title: "Integrează",
                description: "Conectează Kalina AI la platformele tale existente printr-o integrare simplă și rapidă."
              },
              {
                step: "03",
                icon: Target,
                title: "Optimizează",
                description: "Monitorizează performanța și îmbunătățește continuu experiența clienților tăi."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="text-center feature-card p-8 rounded-2xl"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center animate-morph">
                    <step.icon className="h-12 w-12 text-primary animate-parallax-float" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg animate-bounce-in">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground text-lg">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            ref={testimonialsRef.ref}
            className={`text-center mb-20 ${testimonialsRef.animationClass}`}
          >
            <h2 className="text-5xl font-bold mb-6 text-shimmer">
              Ce Spun Clienții Noștri
            </h2>
            <p className="text-xl text-muted-foreground">
              Povești de succes de la companii care au ales Kalina AI
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Kalina AI a revoluționat complet customer service-ul nostru. Timpul de răspuns s-a îmbunătățit cu 90%.",
                author: "Maria Popescu",
                role: "CEO, TechStart",
                rating: 5
              },
              {
                quote: "Implementarea a fost surprinzător de simplă. În 24 de ore eram operaționali cu primul nostru agent AI.",
                author: "Alexandru Ionescu",
                role: "CTO, InnovateNow",
                rating: 5
              },
              {
                quote: "Clienții noștri adoră experiența conversațională. Satisfacția a crescut cu 40% în prima lună.",
                author: "Elena Gheorghe",
                role: "Marketing Director, GrowthCorp",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className={`feature-card p-8 rounded-2xl border border-border/10 bg-card/50 backdrop-blur-sm stagger-${index + 1}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current animate-subtle-pulse" />
                  ))}
                </div>
                <blockquote className="text-lg mb-6 italic">"{testimonial.quote}"</blockquote>
                <div className="border-t border-border/10 pt-4">
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-muted-foreground">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8 bg-muted/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-bold mb-6 animate-text-glow">
              Întrebări Frecvente
            </h2>
            <p className="text-xl text-muted-foreground">
              Răspunsuri la cele mai comune întrebări despre Kalina AI
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-4">
            {[
              {
                question: "Cât de rapid pot implementa Kalina AI?",
                answer: "Implementarea standard durează între 24-48 de ore. Echipa noastră te va ghida prin tot procesul de configurare și integrare."
              },
              {
                question: "Kalina AI suportă limba română?",
                answer: "Da! Kalina AI suportă complet limba română, inclusiv nuanțele dialectale și expresiile locale specifice."
              },
              {
                question: "Ce tip de integrări sunt disponibile?",
                answer: "Oferim integrări pentru toate platformele majore: WhatsApp, Facebook Messenger, website-uri, aplicații mobile și sisteme CRM."
              },
              {
                question: "Cât de sigure sunt datele mele?",
                answer: "Securitatea este prioritatea noastră. Folosim criptare end-to-end și suntem conformi cu GDPR și alte standarde internaționale."
              },
              {
                question: "Există suport tehnic disponibil?",
                answer: "Da, oferim suport tehnic 24/7 prin chat, email și telefon. Echipa noastră de experți este mereu gata să te ajute."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <AccordionItem value={`item-${index}`} className="feature-card border border-border/10 rounded-lg px-6">
                  <AccordionTrigger className="text-left text-lg font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            ref={ctaRef.ref}
            className={`space-y-8 ${ctaRef.animationClass}`}
          >
            <h2 className="text-6xl font-bold animate-text-glow">
              Gata să Începi?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Alătură-te miilor de companii care au ales să-și transforme customer service-ul cu Kalina AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="px-12 py-6 text-xl feature-card animate-glow"
              >
                <Heart className="mr-2 h-6 w-6" />
                Începe Gratuit Azi
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="px-12 py-6 text-xl feature-card"
              >
                <Headphones className="mr-2 h-6 w-6" />
                Vorbește cu un Expert
              </Button>
            </div>

            <div className="pt-12">
              <p className="text-muted-foreground mb-6">Rămâi la curent cu ultimele noutăți</p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Adresa ta de email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="feature-card">
                  Abonează-te
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/10 py-16 px-4 sm:px-6 lg:px-8 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <Bot className="h-8 w-8 animate-subtle-pulse" />
                <span className="text-2xl font-bold">Kalina AI</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Transformăm viitorul conversațiilor prin inteligența artificială avansată.
              </p>
              <div className="flex space-x-4">
                {[MessageCircle, Phone, Globe, Database].map((Icon, index) => (
                  <Icon key={index} className="h-6 w-6 text-muted-foreground hover:text-foreground transition-colors cursor-pointer animate-float" />
                ))}
              </div>
            </motion.div>

            {[
              {
                title: "Produs",
                links: ["Funcții", "Prețuri", "Documentație", "API"]
              },
              {
                title: "Companie",
                links: ["Despre noi", "Cariere", "Blog", "Contact"]
              },
              {
                title: "Legal",
                links: ["Termeni", "Confidențialitate", "Cookies", "GDPR"]
              }
            ].map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="font-semibold mb-6">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="border-t border-border/10 mt-12 pt-8 text-center text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <p>&copy; 2024 Kalina AI. Toate drepturile rezervate.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}