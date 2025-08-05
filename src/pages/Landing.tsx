import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Bot, Phone, Mic, BarChart3, ArrowRight, Zap, Globe, Shield } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Kalina AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/pricing">
              <Button variant="ghost">Prețuri</Button>
            </Link>
            <Link to="/auth">
              <Button>Începe Acum</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Platforma AI Vocală #1 din România
          </Badge>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transformă afacerea ta cu
            <span className="text-blue-600 block">Agenți AI Vocali</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Creează, gestionează și optimizează agenți AI care pot purta conversații naturale în română. 
            Perfect pentru call center-uri, vânzări și support client.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Începe Gratuit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Vezi Prețurile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              De ce să alegi Kalina AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              O platformă completă pentru automatizarea conversațiilor și optimizarea proceselor de comunicare.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Bot className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Agenți AI Inteligenți</CardTitle>
                <CardDescription>
                  Creează agenți care înțeleg contextul și răspund natural în limba română
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Phone className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Apeluri Automate</CardTitle>
                <CardDescription>
                  Inițiază și gestionează campanii de apeluri cu inteligență artificială
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Mic className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Voce Naturală</CardTitle>
                <CardDescription>
                  Tecnologie avansată de text-to-speech cu voci naturale românești
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Analytics Detaliate</CardTitle>
                <CardDescription>
                  Monitorizează performanțele și optimizează conversațiile în timp real
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-teal-600 mb-4" />
                <CardTitle>Multi-lingv</CardTitle>
                <CardDescription>
                  Suport pentru română și alte limbi europene cu acceași calitate
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Securitate GDPR</CardTitle>
                <CardDescription>
                  Protecția datelor conform standardelor europene și românești
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 bg-blue-600">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold text-white mb-16">
            Încrederea companiilor românești
          </h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Apeluri procesate</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime garantat</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Companii active</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Support tehnic</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gray-900">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Gata să transformi comunicarea afacerii tale?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Începe gratuit cu 5$ credit și creează primul tău agent AI în mai puțin de 5 minute.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg">
              Începe Acum - Gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-white border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Bot className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Kalina AI</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link to="/pricing" className="hover:text-blue-600">Prețuri</Link>
              <Link to="/auth" className="hover:text-blue-600">Conectare</Link>
              <span>© 2024 Kalina AI. Toate drepturile rezervate.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;