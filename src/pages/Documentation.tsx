import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Bot, Phone, BarChart3, Calendar, Globe, Mail, FileText, Settings, 
  Zap, MessageCircle, Users, Headphones, Code, BookOpen, 
  ChevronRight, Play, Eye, Wrench, PieChart, Mic, PhoneCall,
  Database, Workflow, Monitor, Webhook, Bell, Search, Building2,
  CreditCard, Shield, Clock, ArrowRight, Check, AlertCircle
} from 'lucide-react';

const Documentation = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const menuSections = [
    {
      title: 'NOȚIUNI DE BAZĂ',
      items: [
        { id: 'overview', title: 'Prezentare Generală', icon: Eye },
        { id: 'how-it-works', title: 'Cum Funcționează', icon: Workflow },
        { id: 'quickstart', title: 'Ghid Rapid', icon: Play },
        { id: 'architecture', title: 'Arhitectura Sistemului', icon: Building2 }
      ]
    },
    {
      title: 'FUNCȚIONALITĂȚI',
      items: [
        { id: 'voice-agents', title: 'Agenți Vocali AI', icon: Bot },
        { id: 'phone-calls', title: 'Apeluri Telefonice', icon: Phone },
        { id: 'batch-campaigns', title: 'Campanii în Masă', icon: Users },
        { id: 'analytics', title: 'Analiză & Rapoarte', icon: BarChart3 },
        { id: 'scheduling', title: 'Programări Automate', icon: Calendar },
        { id: 'transcriptions', title: 'Transcrieri Audio', icon: FileText },
        { id: 'web-scraping', title: 'Extragere Date Web', icon: Globe }
      ]
    },
    {
      title: 'INTEGRĂRI & API',
      items: [
        { id: 'elevenlabs', title: 'ElevenLabs Integration', icon: Mic },
        { id: 'webhooks', title: 'Webhooks & Callbacks', icon: Webhook },
        { id: 'apis', title: 'API Reference', icon: Code },
        { id: 'database', title: 'Database Schema', icon: Database }
      ]
    },
    {
      title: 'CREDITE & FACTURARE',
      items: [
        { id: 'credits', title: 'Sistem de Credite', icon: CreditCard },
        { id: 'pricing', title: 'Prețuri & Planuri', icon: Building2 },
        { id: 'billing', title: 'Facturare', icon: Settings }
      ]
    }
  ];

  const renderOverview = () => (
    <div className="max-w-5xl">
      <div className="mb-12">
        <h1 className="text-6xl font-bold text-black mb-6">Kalina AI</h1>
        <p className="text-2xl text-gray-600 leading-relaxed">
          Platforma completă de agenți vocali AI pentru automatizarea apelurilor telefonice, 
          campanii în masă și interacțiuni cu clienții.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-16">
        <div className="p-8 bg-black text-white rounded-2xl">
          <Bot className="h-12 w-12 mb-4" />
          <h3 className="text-xl font-bold mb-3">Agenți AI Avansați</h3>
          <p className="text-gray-300">Conversații naturale cu inteligență artificială</p>
        </div>
        <div className="p-8 border-2 border-black rounded-2xl">
          <Phone className="h-12 w-12 mb-4 text-black" />
          <h3 className="text-xl font-bold mb-3 text-black">Apeluri Automate</h3>
          <p className="text-gray-600">Campanii telefonice scalabile și eficiente</p>
        </div>
        <div className="p-8 bg-black text-white rounded-2xl">
          <BarChart3 className="h-12 w-12 mb-4" />
          <h3 className="text-xl font-bold mb-3">Analize Detaliate</h3>
          <p className="text-gray-300">Monitorizare performanță în timp real</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold text-black mb-8">Componente Principale</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-6 p-6 border border-gray-200 rounded-xl">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Agent Management System</h3>
              <p className="text-gray-600">Creare, editare și gestionarea agenților vocali cu personalități și funcționalități personalizate.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-6 p-6 border border-gray-200 rounded-xl">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <PhoneCall className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Call Engine</h3>
              <p className="text-gray-600">Motor de apeluri integrat cu ElevenLabs pentru apeluri individuale și campanii în masă.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-6 p-6 border border-gray-200 rounded-xl">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Monitor className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Dashboarduri comprehensive pentru monitorizarea conversațiilor și optimizarea performanței.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHowItWorks = () => (
    <div className="max-w-5xl">
      <h1 className="text-5xl font-bold text-black mb-6">Cum Funcționează Kalina AI</h1>
      <p className="text-xl text-gray-600 mb-12">Înțelegerea completă a fluxului de lucru și arhitecturii sistemului</p>
      
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-black mb-8">Fluxul Principal de Lucru</h2>
        <div className="space-y-8">
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">1</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-black mb-3">Creare Agent</h3>
              <p className="text-gray-600 text-lg">Utilizatorul creează un agent vocal AI cu personalitate, voce și comportament specific. Agentul este configurat cu un system prompt detaliat și conectat la ElevenLabs.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">2</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-black mb-3">Configurare Apel</h3>
              <p className="text-gray-600 text-lg">Se selectează numărul de telefon, agentul și contactele pentru apel. Sistemul pregătește campania cu parametrii specificați.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">3</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-black mb-3">Execuție Apel</h3>
              <p className="text-gray-600 text-lg">ElevenLabs inițiază apelul către contactul specificat. Agentul AI conduce conversația conform promptului configurat.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold">4</div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-black mb-3">Procesare & Analiză</h3>
              <p className="text-gray-600 text-lg">Conversația este transcrisă, analizată pentru sentiment și intent. Sistemul detectează automat cererile de callback și programează întâlniri.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-black mb-8">Integrări Tehnologice</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="p-8 border-2 border-black rounded-2xl">
            <Mic className="h-12 w-12 text-black mb-4" />
            <h3 className="text-xl font-bold text-black mb-3">ElevenLabs</h3>
            <p className="text-gray-600">Motor vocal avansat pentru generarea vocii naturale și gestionarea apelurilor telefonice.</p>
          </div>
          <div className="p-8 border-2 border-black rounded-2xl">
            <Database className="h-12 w-12 text-black mb-4" />
            <h3 className="text-xl font-bold text-black mb-3">Supabase</h3>
            <p className="text-gray-600">Baza de date și backend pentru stocarea agentilor, conversațiilor și analizelor.</p>
          </div>
          <div className="p-8 border-2 border-black rounded-2xl">
            <Webhook className="h-12 w-12 text-black mb-4" />
            <h3 className="text-xl font-bold text-black mb-3">Webhooks</h3>
            <p className="text-gray-600">Comunicare în timp real între ElevenLabs și sistemul nostru pentru actualizări de status.</p>
          </div>
          <div className="p-8 border-2 border-black rounded-2xl">
            <Bot className="h-12 w-12 text-black mb-4" />
            <h3 className="text-xl font-bold text-black mb-3">OpenAI/GPT</h3>
            <p className="text-gray-600">Inteligența artificială pentru conversații naturale și analiza conținutului.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickstart = () => (
    <div className="max-w-5xl">
      <h1 className="text-5xl font-bold text-black mb-6">Ghid de Începere Rapidă</h1>
      <p className="text-xl text-gray-600 mb-12">Începeți să folosiți Kalina AI în mai puțin de 10 minute</p>
      
      <div className="space-y-12">
        <div className="p-8 bg-black text-white rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center text-xl font-bold">1</div>
            <h3 className="text-2xl font-bold">Creați primul agent</h3>
          </div>
          <p className="text-gray-300 mb-6">Începeți prin crearea unui agent vocal AI cu personalitate și scop specific.</p>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <code className="text-green-400">Navigați la: Dashboard → Agenți → Creați Agent Nou</code>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Completați informațiile generale</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Scrieți system prompt-ul</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Selectați vocea dorită</span>
            </div>
          </div>
        </div>

        <div className="p-8 border-2 border-black rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold">2</div>
            <h3 className="text-2xl font-bold text-black">Configurați apelul</h3>
          </div>
          <p className="text-gray-600 mb-6">Setați parametrii pentru primul apel de test.</p>
          <div className="bg-gray-100 p-4 rounded-lg border">
            <code className="text-black">Outbound → Selectați Agent → Selectați Numărul → Adăugați Contact</code>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-black" />
              <span className="text-sm text-gray-600">Alegeți agentul creat</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-black" />
              <span className="text-sm text-gray-600">Selectați numărul de telefon</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-black" />
              <span className="text-sm text-gray-600">Adăugați contactul pentru test</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-black text-white rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center text-xl font-bold">3</div>
            <h3 className="text-2xl font-bold">Lansați și monitorizați</h3>
          </div>
          <p className="text-gray-300 mb-6">Inițiați apelul de test și monitorizați performanțele.</p>
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <code className="text-green-400">Lansare Apel → Analytics → Istoric Conversații</code>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Urmăriți apelul în timp real</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Analizați transcrierea conversației</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-300">Optimizați agentul bazat pe rezultate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderArchitecture = () => (
    <div className="max-w-5xl">
      <h1 className="text-5xl font-bold text-black mb-6">Arhitectura Sistemului</h1>
      <p className="text-xl text-gray-600 mb-12">Diagrama completă a componentelor și fluxurilor de date</p>
      
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-black mb-8">Componente Principale</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="p-8 border-2 border-black rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Database className="h-12 w-12 text-black" />
              <h3 className="text-2xl font-bold text-black">Frontend (React)</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• Dashboard interactiv</li>
              <li>• Gestionare agenți</li>
              <li>• Monitorizare campanii</li>
              <li>• Analytics în timp real</li>
            </ul>
          </div>
          
          <div className="p-8 bg-black text-white rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Code className="h-12 w-12 text-white" />
              <h3 className="text-2xl font-bold">Backend (Supabase)</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li>• Database PostgreSQL</li>
              <li>• Edge Functions</li>
              <li>• Authentication</li>
              <li>• Real-time subscriptions</li>
            </ul>
          </div>
          
          <div className="p-8 bg-black text-white rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Mic className="h-12 w-12 text-white" />
              <h3 className="text-2xl font-bold">ElevenLabs API</h3>
            </div>
            <ul className="space-y-2 text-gray-300">
              <li>• Conversational AI</li>
              <li>• Voice synthesis</li>
              <li>• Phone call management</li>
              <li>• Webhook notifications</li>
            </ul>
          </div>
          
          <div className="p-8 border-2 border-black rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Bot className="h-12 w-12 text-black" />
              <h3 className="text-2xl font-bold text-black">AI Services</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• OpenAI/GPT pentru conversații</li>
              <li>• Analiza sentiment</li>
              <li>• Intent detection</li>
              <li>• Content processing</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-black mb-8">Fluxul de Date</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-6 bg-gray-100 rounded-xl">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">1</div>
            <ArrowRight className="h-6 w-6 text-gray-400" />
            <span className="font-semibold">Utilizator → Frontend → Supabase</span>
            <span className="text-gray-600">(Creare agent, configurare campanie)</span>
          </div>
          
          <div className="flex items-center gap-4 p-6 bg-gray-100 rounded-xl">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">2</div>
            <ArrowRight className="h-6 w-6 text-gray-400" />
            <span className="font-semibold">Supabase → ElevenLabs</span>
            <span className="text-gray-600">(Inițiere apel prin Edge Function)</span>
          </div>
          
          <div className="flex items-center gap-4 p-6 bg-gray-100 rounded-xl">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">3</div>
            <ArrowRight className="h-6 w-6 text-gray-400" />
            <span className="font-semibold">ElevenLabs → Webhook → Supabase</span>
            <span className="text-gray-600">(Status updates, conversații)</span>
          </div>
          
          <div className="flex items-center gap-4 p-6 bg-gray-100 rounded-xl">
            <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">4</div>
            <ArrowRight className="h-6 w-6 text-gray-400" />
            <span className="font-semibold">Supabase → Frontend</span>
            <span className="text-gray-600">(Real-time updates, analytics)</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVoiceAgents = () => (
    <div className="max-w-5xl">
      <h1 className="text-5xl font-bold text-black mb-6">Agenți Vocali AI</h1>
      <p className="text-xl text-gray-600 mb-12">Crearea și gestionarea agenților vocali inteligenți</p>
      
      <div className="grid gap-8 md:grid-cols-2 mb-16">
        <div className="p-8 bg-black text-white rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">Ce sunt agenții vocali?</h3>
          <p className="text-gray-300 mb-4">Agenții vocali sunt asistenti AI care pot purta conversații naturale prin telefon, răspund la întrebări și execută sarcini automate.</p>
          <ul className="space-y-2 text-gray-300">
            <li>• Conversații naturale</li>
            <li>• Personalitate configurabilă</li>
            <li>• Integrare cu sisteme externe</li>
            <li>• Învățare din interacțiuni</li>
          </ul>
        </div>
        <div className="p-8 border-2 border-black rounded-2xl">
          <h3 className="text-2xl font-bold text-black mb-4">Cum funcționează?</h3>
          <p className="text-gray-600 mb-4">Agenții folosesc AI-ul GPT pentru înțelegerea și generarea de text, plus ElevenLabs pentru sinteza vocii.</p>
          <ul className="space-y-2 text-gray-600">
            <li>• Processing natural language</li>
            <li>• Context awareness</li>
            <li>• Emotional intelligence</li>
            <li>• Multi-language support</li>
          </ul>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-black mb-8">Configurarea unui Agent</h2>
        <div className="space-y-8">
          <div className="p-8 border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-bold text-black mb-4">1. Informații Generale</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-gray-50 rounded-lg">
                <strong>Numele Agentului:</strong> Identificarea unică
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <strong>Descrierea:</strong> Scopul și funcționalitatea
              </div>
            </div>
          </div>

          <div className="p-8 border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-bold text-black mb-4">2. System Prompt</h3>
            <p className="text-gray-600 mb-4">Promptul definește personalitatea, stilul de conversație și regulile agentului.</p>
            <div className="bg-gray-900 p-4 rounded-lg text-green-400 font-mono text-sm">
              Ești un agent de vânzări prietenos și profesionist...<br/>
              Scopul tău este să califiezi lead-urile și să programezi întâlniri...<br/>
              Folosește un ton conversațional dar respectuos...
            </div>
          </div>

          <div className="p-8 border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-bold text-black mb-4">3. Configurare Voce</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <strong>Limba:</strong><br/>Română, Engleză, etc.
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <strong>Vocea:</strong><br/>Masculină/Feminină
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <strong>Stilul:</strong><br/>Calm, energic, profesional
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhoneCalls = () => (
    <div className="max-w-5xl">
      <h1 className="text-5xl font-bold text-black mb-6">Apeluri Telefonice</h1>
      <p className="text-xl text-gray-600 mb-12">Sistem complet de gestionare a apelurilor automate</p>
      
      <div className="grid gap-8 md:grid-cols-2 mb-16">
        <div className="p-8 bg-black text-white rounded-2xl">
          <PhoneCall className="h-12 w-12 mb-4" />
          <h3 className="text-2xl font-bold mb-4">Apeluri Individuale</h3>
          <p className="text-gray-300 mb-4">Apeluri personalizate către contacte specifice cu monitorizare detaliată.</p>
          <ul className="space-y-2 text-gray-300">
            <li>• Configurare rapidă</li>
            <li>• Monitoring în timp real</li>
            <li>• Transcriere automată</li>
            <li>• Analiza conversației</li>
          </ul>
        </div>
        <div className="p-8 border-2 border-black rounded-2xl">
          <Users className="h-12 w-12 text-black mb-4" />
          <h3 className="text-2xl font-bold text-black mb-4">Campanii în Masă</h3>
          <p className="text-gray-600 mb-4">Apeluri simultane către sute de contacte cu raportare centralizată.</p>
          <ul className="space-y-2 text-gray-600">
            <li>• Upload CSV contacte</li>
            <li>• Execuție paralelă</li>
            <li>• Progress tracking</li>
            <li>• Statistici detaliate</li>
          </ul>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-black mb-8">Proces de Execuție Apel</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-6 p-6 border border-gray-200 rounded-xl">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold">1</div>
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Inițiere Apel</h3>
              <p className="text-gray-600">Sistemul trimite cererea către ElevenLabs cu parametrii agentului și numărul de telefon.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-6 p-6 border border-gray-200 rounded-xl">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Conectare</h3>
              <p className="text-gray-600">ElevenLabs apelează numărul și începe conversația cu primul mesaj configurat.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-6 p-6 border border-gray-200 rounded-xl">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold">3</div>
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Conversație</h3>
              <p className="text-gray-600">Agentul AI conduce conversația conform promptului, adaptându-se la răspunsurile interlocutorului.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-6 p-6 border border-gray-200 rounded-xl">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold">4</div>
            <div>
              <h3 className="text-xl font-bold text-black mb-2">Finalizare & Analiza</h3>
              <p className="text-gray-600">La sfârșitul apelului, conversația este transcrisă și analizată pentru insight-uri.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 bg-gray-100 rounded-2xl">
        <h3 className="text-2xl font-bold text-black mb-4">Webhook Notifications</h3>
        <p className="text-gray-600 mb-4">Sistemul primește notificări în timp real despre statusul apelurilor:</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-white rounded-lg">
            <strong>call.started:</strong> Apelul a început
          </div>
          <div className="p-4 bg-white rounded-lg">
            <strong>call.ended:</strong> Apelul s-a terminat
          </div>
          <div className="p-4 bg-white rounded-lg">
            <strong>conversation.created:</strong> Conversația salvată
          </div>
          <div className="p-4 bg-white rounded-lg">
            <strong>transcript.ready:</strong> Transcrierea gata
          </div>
        </div>
      </div>
    </div>
  );

  const renderCredits = () => (
    <div className="max-w-5xl">
      <h1 className="text-5xl font-bold text-black mb-6">Sistem de Credite</h1>
      <p className="text-xl text-gray-600 mb-12">Cum funcționează sistemul de credite și facturare</p>
      
      <div className="grid gap-8 md:grid-cols-2 mb-16">
        <div className="p-8 bg-black text-white rounded-2xl">
          <CreditCard className="h-12 w-12 mb-4" />
          <h3 className="text-2xl font-bold mb-4">Credite Gratuită</h3>
          <p className="text-gray-300 mb-4">Fiecare utilizator nou primește 100.000 de credite gratuite la înregistrare.</p>
          <div className="text-3xl font-bold text-white">100,000</div>
          <div className="text-gray-400">credite inițiale</div>
        </div>
        
        <div className="p-8 border-2 border-black rounded-2xl">
          <Building2 className="h-12 w-12 text-black mb-4" />
          <h3 className="text-2xl font-bold text-black mb-4">Utilizare Credite</h3>
          <p className="text-gray-600 mb-4">Creditele se consumă în funcție de utilizare:</p>
          <ul className="space-y-2 text-gray-600">
            <li>• 1 credit = 1 secundă de conversație</li>
            <li>• Transcrieri: 10 credite/minut</li>
            <li>• Analize: 5 credite/operațiune</li>
          </ul>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-black mb-8">Detalii Facturare</h2>
        <div className="space-y-6">
          <div className="p-8 border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-bold text-black mb-4">Tracking Credite</h3>
            <p className="text-gray-600 mb-4">Sistemul urmărește automat utilizarea creditelor pentru fiecare operațiune:</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <strong>Total Credite:</strong><br/>Credite cumparate + gratuite
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <strong>Credite Folosite:</strong><br/>Consumul total
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <strong>Credite Rămase:</strong><br/>Disponibile pentru utilizare
              </div>
            </div>
          </div>

          <div className="p-8 border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-bold text-black mb-4">Funcții Database</h3>
            <p className="text-gray-600 mb-4">Sistemul folosește funcții PostgreSQL pentru gestionarea creditelor:</p>
            <div className="bg-gray-900 p-4 rounded-lg text-green-400 font-mono text-sm">
              deduct_credits(user_id, amount, description)<br/>
              add_credits(user_id, amount, stripe_session_id)<br/>
              admin_add_credits(user_email, amount)
            </div>
          </div>

          <div className="p-8 border border-gray-200 rounded-2xl">
            <h3 className="text-xl font-bold text-black mb-4">Istoric Tranzacții</h3>
            <p className="text-gray-600 mb-4">Toate operațiunile cu credite sunt înregistrate în tabela credit_transactions:</p>
            <ul className="space-y-2 text-gray-600">
              <li>• Tipul tranzacției (usage, purchase, admin_bonus)</li>
              <li>• Suma și descrierea</li>
              <li>• Timestamp și user_id</li>
              <li>• Referințe la conversații (când aplicabil)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'how-it-works':
        return renderHowItWorks();
      case 'quickstart':
        return renderQuickstart();
      case 'architecture':
        return renderArchitecture();
      case 'voice-agents':
        return renderVoiceAgents();
      case 'phone-calls':
        return renderPhoneCalls();
      case 'batch-campaigns':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">Campanii în Masă</h1>
            <p className="text-xl text-gray-600 mb-8">Apeluri simultane către sute de contacte</p>
            <div className="p-8 border-2 border-black rounded-2xl">
              <p className="text-gray-600">Încărcați fișiere CSV cu contacte și lansați campanii automate către toate contactele odată. Sistemul gestionează execuția paralelă și raportarea centralizată.</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">Analiză & Rapoarte</h1>
            <p className="text-xl text-gray-600 mb-8">Monitorizare performanță și insight-uri detaliate</p>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="p-8 bg-black text-white rounded-2xl">
                <BarChart3 className="h-12 w-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Metrici în Timp Real</h3>
                <p className="text-gray-300">Urmărirea conversațiilor active, rate de success și performanță agenți.</p>
              </div>
              <div className="p-8 border-2 border-black rounded-2xl">
                <PieChart className="h-12 w-12 text-black mb-4" />
                <h3 className="text-2xl font-bold text-black mb-4">Analiză Sentiment</h3>
                <p className="text-gray-600">Detectarea automată a emoțiilor și intențiilor din conversații.</p>
              </div>
            </div>
          </div>
        );
      case 'scheduling':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">Programări Automate</h1>
            <p className="text-xl text-gray-600 mb-8">Sistem de detectare și programare callback-uri</p>
            <div className="p-8 border-2 border-black rounded-2xl">
              <Calendar className="h-12 w-12 text-black mb-4" />
              <p className="text-gray-600">Sistemul detectează automat cererile de callback din conversații și programează apeluri de urmărire.</p>
            </div>
          </div>
        );
      case 'transcriptions':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">Transcrieri Audio</h1>
            <p className="text-xl text-gray-600 mb-8">Conversie automată speech-to-text</p>
            <div className="p-8 border-2 border-black rounded-2xl">
              <FileText className="h-12 w-12 text-black mb-4" />
              <p className="text-gray-600">Toate conversațiile sunt transcrise automat și stocate pentru analiză ulterioară și căutare.</p>
            </div>
          </div>
        );
      case 'web-scraping':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">Extragere Date Web</h1>
            <p className="text-xl text-gray-600 mb-8">Colectare automată de informații din pagini web</p>
            <div className="p-8 border-2 border-black rounded-2xl">
              <Globe className="h-12 w-12 text-black mb-4" />
              <p className="text-gray-600">Extractoare de date pentru îmbogățirea bazei de cunoștințe a agenților cu informații actualizate.</p>
            </div>
          </div>
        );
      case 'elevenlabs':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">Integrare ElevenLabs</h1>
            <p className="text-xl text-gray-600 mb-8">API integration pentru conversational AI</p>
            <div className="p-8 border-2 border-black rounded-2xl">
              <Mic className="h-12 w-12 text-black mb-4" />
              <p className="text-gray-600">Integrare completă cu ElevenLabs Conversational AI pentru gestionarea apelurilor telefonice și sinteza vocii.</p>
            </div>
          </div>
        );
      case 'webhooks':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">Webhooks & Callbacks</h1>
            <p className="text-xl text-gray-600 mb-8">Comunicare în timp real cu servicii externe</p>
            <div className="p-8 border-2 border-black rounded-2xl">
              <Webhook className="h-12 w-12 text-black mb-4" />
              <p className="text-gray-600">Sistem de webhook-uri pentru sincronizarea cu ElevenLabs și alte servicii externe.</p>
            </div>
          </div>
        );
      case 'apis':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">API Reference</h1>
            <p className="text-xl text-gray-600 mb-8">Documentația completă a API-urilor</p>
            <div className="p-8 border-2 border-black rounded-2xl">
              <Code className="h-12 w-12 text-black mb-4" />
              <p className="text-gray-600">Referința completă pentru toate endpoint-urile și funcționalitățile API.</p>
            </div>
          </div>
        );
      case 'database':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">Schema Bazei de Date</h1>
            <p className="text-xl text-gray-600 mb-8">Structura și relațiile tabelelor</p>
            <div className="p-8 border-2 border-black rounded-2xl">
              <Database className="h-12 w-12 text-black mb-4" />
              <p className="text-gray-600">Documentația schemei PostgreSQL cu toate tabelele, relațiile și funcțiile.</p>
            </div>
          </div>
        );
      case 'credits':
        return renderCredits();
      case 'pricing':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">Prețuri & Planuri</h1>
            <p className="text-xl text-gray-600 mb-8">Structura de prețuri și pachete disponibile</p>
            <div className="p-8 border-2 border-black rounded-2xl">
              <Building2 className="h-12 w-12 text-black mb-4" />
              <p className="text-gray-600">Informații despre planurile de abonament și opțiunile de plată.</p>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">Facturare</h1>
            <p className="text-xl text-gray-600 mb-8">Gestionarea facturării și plăților</p>
            <div className="p-8 border-2 border-black rounded-2xl">
              <Settings className="h-12 w-12 text-black mb-4" />
              <p className="text-gray-600">Sistemul de facturare automată și gestionarea conturilor.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="max-w-5xl">
            <h1 className="text-5xl font-bold text-black mb-6">În dezvoltare</h1>
            <p className="text-xl text-gray-600">Această secțiune este în curs de dezvoltare.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-white">
        {/* Sidebar */}
        <div className="w-80 border-r-2 border-black flex flex-col bg-white">
          <div className="p-8 border-b-2 border-black">
            <h1 className="text-3xl font-bold text-black">Documentație</h1>
            <p className="text-gray-600 mt-2">Ghid complet Kalina AI</p>
          </div>
          
          <nav className="flex-1 p-6">
            <div className="space-y-8">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-4 px-4 py-3 text-left rounded-xl transition-all duration-200 text-sm font-medium ${
                            activeSection === item.id
                              ? 'bg-black text-white transform scale-105'
                              : 'text-gray-700 hover:text-black hover:bg-gray-100 hover:transform hover:scale-102'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="p-12">
            {renderContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;