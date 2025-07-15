import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Bot, Phone, BarChart3, Calendar, Globe, Mail, FileText, Settings, ChevronRight, Play, MessageCircle, Users, Zap, Shield, BookOpen, Headphones } from 'lucide-react';

const Documentation = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('getting-started');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const sections = [
    { id: 'getting-started', title: 'Început rapid', icon: Play },
    { id: 'agents', title: 'Agenți AI', icon: Bot },
    { id: 'calls', title: 'Apeluri telefonice', icon: Phone },
    { id: 'analytics', title: 'Analytics', icon: BarChart3 },
    { id: 'calendar', title: 'Calendar', icon: Calendar },
    { id: 'scraping', title: 'Web Scraping', icon: Globe },
    { id: 'gmail', title: 'Gmail', icon: Mail },
    { id: 'transcripts', title: 'Transcripturi', icon: FileText },
    { id: 'settings', title: 'Setări', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
              <div className="max-w-3xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Bun venit la Kalina AI
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Platforma completă pentru crearea și gestionarea asistenților vocali inteligenți
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                    <Headphones className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Agenți vocali AI</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Apeluri automate</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Analytics avansate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Start Steps */}
            <div className="elevenlabs-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Primii pași</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <h3 className="font-semibold text-gray-900">Creează primul agent</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Începe prin a crea primul tău asistent AI vocal cu personalitate și obiective specifice.
                  </p>
                  <button 
                    onClick={() => setActiveSection('agents')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                  >
                    Vezi ghidul <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <h3 className="font-semibold text-gray-900">Testează și optimizează</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Testează agentul în diverse scenarii și ajustează răspunsurile pentru rezultate perfecte.
                  </p>
                  <button 
                    onClick={() => setActiveSection('calls')}
                    className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
                  >
                    Vezi ghidul <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <h3 className="font-semibold text-gray-900">Lansează și monitorizează</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Pornește campaniile de apeluri și urmărește performanțele în timp real.
                  </p>
                  <button 
                    onClick={() => setActiveSection('analytics')}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                  >
                    Vezi ghidul <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Features Overview */}
            <div className="elevenlabs-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Funcționalități principale</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Agenți AI Personalizați</h3>
                    <p className="text-gray-600 text-sm">
                      Creează asistenți vocali cu personalități unice, instruiți pentru obiectivele tale specifice.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Apeluri Automate</h3>
                    <p className="text-gray-600 text-sm">
                      Efectuează apeluri individuale sau în lot către sute de contacte simultan.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Analytics Detaliate</h3>
                    <p className="text-gray-600 text-sm">
                      Analizează performanțele, sentimentul clientului și optimizează strategiile.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Integrări Puternice</h3>
                    <p className="text-gray-600 text-sm">
                      Conectează cu Gmail, calendar, CRM-uri și alte sisteme pentru automatizări complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'agents':
        return (
          <div className="space-y-8">
            <div className="elevenlabs-card">
              <div className="flex items-center gap-3 mb-6">
                <Bot className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Agenți AI</h1>
                  <p className="text-gray-600">Crearea și gestionarea asistenților vocali inteligenți</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-8">
                <h3 className="font-semibold text-gray-900 mb-2">Ce sunt agenții AI?</h3>
                <p className="text-gray-600">
                  Agenții AI sunt asistenți vocali inteligenți care pot purta conversații naturale cu clienții tăi. 
                  Aceștia pot răspunde la întrebări, programa întâlniri, colecta informații și executa diverse sarcini automate.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Cum să creezi un agent nou</h3>
                  <div className="space-y-4">
                    {[
                      { step: '1', title: 'Accesează secțiunea Agents', desc: 'Din meniul principal, navighează la "Agents"' },
                      { step: '2', title: 'Creează agent nou', desc: 'Apasă butonul "Create New Agent"' },
                      { step: '3', title: 'Configurează datele de bază', desc: 'Nume, descriere și vocea agentului' },
                      { step: '4', title: 'Scrie System Prompt', desc: 'Instrucțiunile care definesc comportamentul' },
                      { step: '5', title: 'Testează și salvează', desc: 'Verifică funcționarea și salvează configurația' }
                    ].map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Componente cheie</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">System Prompt</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Instrucțiunile principale care definesc personalitatea, cunoștințele și comportamentul agentului.
                      </p>
                      <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                        Tu ești un asistent virtual pentru o clinică medicală. Ești prietenos, profesionist și ajuți pacienții să programeze consultații...
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">First Message</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Primul mesaj pe care îl va spune agentul când începe conversația.
                      </p>
                      <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                        "Bună ziua! Sunt asistentul virtual al clinicii. Cu ce vă pot ajuta astăzi?"
                      </div>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Voice & Language</h4>
                      <p className="text-sm text-gray-600">
                        Alege vocea și limba în care va vorbi agentul. Poți selecta din diverse opțiuni pentru a se potrivi brandului tău.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="elevenlabs-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Bune practici pentru agenți de succes</h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">Fii specific</h4>
                  <p className="text-sm text-green-700">
                    Oferă instrucțiuni clare și detaliate despre cum să răspundă în diverse situații.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Testează mult</h4>
                  <p className="text-sm text-blue-700">
                    Încearcă diverse scenarii înainte să lansezi agentul în producție.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">Monitorizează</h4>
                  <p className="text-sm text-purple-700">
                    Urmărește performanțele și optimizează pe baza feedback-ului.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'calls':
        return (
          <div className="space-y-8">
            <div className="elevenlabs-card">
              <div className="flex items-center gap-3 mb-6">
                <Phone className="h-8 w-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Apeluri Telefonice</h1>
                  <p className="text-gray-600">Inițierea și gestionarea apelurilor automate</p>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Apeluri Individuale</h3>
                      <p className="text-gray-600 mb-4">
                        Perfect pentru apeluri personalizate către clienți importanți sau testarea agentului.
                      </p>
                      <div className="space-y-3">
                        {[
                          'Selectează agentul AI dorit',
                          'Introdu numărul de telefon',
                          'Adaugă context specific (opțional)',
                          'Inițiază apelul instant'
                        ].map((step, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Apeluri în Serie (Batch)</h3>
                      <p className="text-gray-600 mb-4">
                        Efectuează sute de apeluri simultan către liste de contacte predefinite.
                      </p>
                      <div className="space-y-3">
                        {[
                          'Încarcă fișier CSV cu contactele',
                          'Mapează coloanele (nume, telefon, etc.)',
                          'Configurează programarea',
                          'Lansează campania automată'
                        ].map((step, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                              {index + 1}
                            </div>
                            <span className="text-sm text-gray-700">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h4 className="font-medium text-yellow-900 mb-2">💡 Sfat Pro</h4>
                      <p className="text-sm text-yellow-700">
                        Testează întotdeauna agentul cu apeluri individuale înainte să lansezi o campanie batch.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Statistici în timp real</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Apeluri astăzi</span>
                          <span className="font-medium">247</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rata de răspuns</span>
                          <span className="font-medium text-green-600">68%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Durata medie</span>
                          <span className="font-medium">3m 24s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="elevenlabs-card">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Gestionarea și Monitorizarea Apelurilor</h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <MessageCircle className="h-8 w-8 text-blue-600 mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Istoric Conversații</h4>
                  <p className="text-sm text-gray-600">
                    Vezi toate conversațiile, ascultă înregistrările și analizează transcripturile.
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <BarChart3 className="h-8 w-8 text-green-600 mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Rapoarte Live</h4>
                  <p className="text-sm text-gray-600">
                    Monitorizează progresul campaniilor și performanțele în timp real.
                  </p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <Shield className="h-8 w-8 text-purple-600 mb-3" />
                  <h4 className="font-medium text-gray-900 mb-2">Control Calitate</h4>
                  <p className="text-sm text-gray-600">
                    Verifică calitatea apelurilor și identifică oportunitățile de îmbunătățire.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <div className="elevenlabs-card">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                  <p className="text-gray-600">Analiza performanțelor și optimizarea rezultatelor</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Conversații Totale</h3>
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">1,247</div>
                  <div className="text-sm text-gray-600">+23% față de luna trecută</div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Rata de Succes</h3>
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">68.5%</div>
                  <div className="text-sm text-gray-600">+5.2% creștere</div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Durata Medie</h3>
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">3m 24s</div>
                  <div className="text-sm text-gray-600">Optim pentru engagement</div>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Sentiment Score</h3>
                    <Zap className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">8.2/10</div>
                  <div className="text-sm text-gray-600">Pozitiv în general</div>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="elevenlabs-card">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Tipuri de Analize Disponibile</h3>
                <div className="space-y-4">
                  {[
                    { icon: MessageCircle, title: 'Analiza Conversațiilor', desc: 'Transcripturi detaliate, identificarea subiectelor și analiza flow-ului conversației' },
                    { icon: Users, title: 'Sentiment Analysis', desc: 'Evaluarea sentimentului clientului pe parcursul conversației' },
                    { icon: BarChart3, title: 'Performance Metrics', desc: 'KPI-uri detaliate pentru fiecare agent și campanie' },
                    { icon: Zap, title: 'Keyword Tracking', desc: 'Identificarea cuvintelor cheie și trending topics' }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="elevenlabs-card">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Rapoarte și Export</h3>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Rapoarte Automate</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Primește rapoarte săptămânale și lunare direct pe email cu analiza performanțelor.
                    </p>
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      Configurează rapoarte →
                    </button>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Export Date</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Exportă datele în format CSV, Excel sau JSON pentru analize externe.
                    </p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">CSV</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">Excel</span>
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">JSON</span>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">API Access</h4>
                    <p className="text-sm text-gray-600">
                      Integrează datele direct în sistemele tale prin API-ul nostru RESTful.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="elevenlabs-card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Secțiunea {activeSection}</h2>
            <p className="text-gray-600">Conținutul pentru această secțiune va fi disponibil în curând.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Documentație</h1>
            <p className="text-sm text-gray-600 mt-1">Ghidul complet Kalina AI</p>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.title}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Need Help?</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Nu găsești ce cauți? Contactează echipa noastră de suport.
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Contact Support →
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Documentation;