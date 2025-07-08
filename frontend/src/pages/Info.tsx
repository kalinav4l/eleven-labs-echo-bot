
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Users, Globe, Shield, Clock, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Info = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "AI Agenți Vocali",
      description: "Creează agenți AI care pot vorbi și înțelege limba română perfect"
    },
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: "Outbound Calls", 
      description: "Sistem complet de apeluri automate cu baze de date CSV și tracking"
    },
    {
      icon: <Globe className="w-8 h-8 text-green-500" />,
      title: "Multilingv",
      description: "Suport pentru română, engleză și alte limbi principale"
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      title: "Securitate",
      description: "Date protejate cu criptare și autentificare securizată"
    },
    {
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      title: "Real-time",
      description: "Conversații în timp real cu latență minimă"
    },
    {
      icon: <BarChart className="w-8 h-8 text-indigo-500" />,
      title: "Analytics",
      description: "Dashboard complet cu statistici și rapoarte detaliate"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Kalina <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Platforma completă pentru agenți AI vocali în limba română. 
              Creează, testează și implementează agenți inteligenți pentru business-ul tău.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/kalina-agents">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                  Începe Gratuit
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/outbound">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2">
                  Vezi Outbound Calls
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              De ce să alegi Kalina AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cele mai avansate funcționalități pentru agenți AI vocali, 
              optimizate special pentru piața românească.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-blue-100">Conversații Procesate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-blue-100">Uptime Garantat</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Suport Tehnic</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">5 Min</div>
              <div className="text-blue-100">Setup Rapid</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Gata să începi cu Kalina AI?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Alătură-te comunității de business-uri care automatizează 
            comunicarea cu clienții folosind agenți AI inteligenți.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg">
                Creează Cont Gratuit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-2">
                Vezi Prețurile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
