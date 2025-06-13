
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { toast } from '@/components/ui/use-toast';
import HamburgerMenu from '@/components/HamburgerMenu';

const Pricing = () => {
  const { user } = useAuth();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['credit-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .order('price_usd', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast({
        title: "Autentificare necesară",
        description: "Te rog să te conectezi pentru a achiziționa credite.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { packageId }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut crea sesiunea de plată. Încearcă din nou.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-foreground">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      <HamburgerMenu />
      
      {/* Background Glass Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-green-200/20 to-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-72 h-72 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Alege Pachetul de Credite
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Cumpără credite pentru a continua să folosești asistenții AI. 1 minut de convorbire = 1.000 credite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages?.map((pkg, index) => (
            <Card 
              key={pkg.id} 
              className={`liquid-glass relative transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in ${
                index === 1 ? 'ring-2 ring-accent/50 scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Cel mai popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-foreground text-2xl">{pkg.name}</CardTitle>
                <div className="mt-4">
                  <div className="text-foreground">
                    <span className="text-4xl font-bold">${pkg.price_usd / 100}</span>
                  </div>
                  <div className="text-muted-foreground mt-2">
                    {pkg.credits.toLocaleString()} credite
                  </div>
                </div>
                <p className="text-muted-foreground mt-2">
                  {Math.floor(pkg.credits / 1000)} minute de convorbire
                </p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-muted-foreground">
                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                    <span>{pkg.credits.toLocaleString()} credite</span>
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                    <span>Acces la toți asistenții</span>
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                    <span>Istoric conversații</span>
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <Check size={16} className="text-accent mr-3 flex-shrink-0" />
                    <span>Suport prioritar</span>
                  </li>
                </ul>
                
                <Button 
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={!user}
                  className={`w-full transition-all duration-300 ${
                    index === 1 
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90' 
                      : 'glass-button'
                  }`}
                >
                  {!user ? 'Conectează-te pentru a cumpăra' : 'Cumpără Acum'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Întrebări Frecvente
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="liquid-glass p-6 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-foreground font-semibold mb-2">
                Cum se calculează creditele?
              </h3>
              <p className="text-muted-foreground">
                1 minut de convorbire cu asistentul AI costă 1.000 de credite. Creditele se deduc automat.
              </p>
            </div>
            
            <div className="liquid-glass p-6 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-foreground font-semibold mb-2">
                Creditele expiră?
              </h3>
              <p className="text-muted-foreground">
                Nu, creditele achiziționate nu expiră niciodată. Le poți folosi oricând.
              </p>
            </div>
            
            <div className="liquid-glass p-6 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-foreground font-semibold mb-2">
                Pot să returnez creditele?
              </h3>
              <p className="text-muted-foreground">
                Creditele achiziționate nu sunt returnabile, dar oferim suport complet pentru orice problemă.
              </p>
            </div>
            
            <div className="liquid-glass p-6 rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="text-foreground font-semibold mb-2">
                Ce se întâmplă dacă rămân fără credite?
              </h3>
              <p className="text-muted-foreground">
                Când creditele se termină, poți cumpăra un nou pachet pentru a continua să folosești serviciul.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
