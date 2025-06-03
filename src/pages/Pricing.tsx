
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu />
      
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-4">
            Alege Pachetul de Credite
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Cumpără credite pentru a continua să folosești asistenții AI. 1 minut de convorbire = 1.000 credite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages?.map((pkg, index) => (
            <Card 
              key={pkg.id} 
              className={`bg-black border-gray-800 relative transition-all duration-300 hover:scale-105 ${
                index === 1 ? 'border-white scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-medium">
                    Cel mai popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">{pkg.name}</CardTitle>
                <div className="mt-4">
                  <div className="text-white">
                    <span className="text-4xl font-bold">${pkg.price_usd / 100}</span>
                  </div>
                  <div className="text-gray-400 mt-2">
                    {pkg.credits.toLocaleString()} credite
                  </div>
                </div>
                <p className="text-gray-400 mt-2">
                  {Math.floor(pkg.credits / 1000)} minute de convorbire
                </p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-gray-300">
                    <Check size={16} className="text-white mr-3 flex-shrink-0" />
                    <span>{pkg.credits.toLocaleString()} credite</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check size={16} className="text-white mr-3 flex-shrink-0" />
                    <span>Acces la toți asistenții</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check size={16} className="text-white mr-3 flex-shrink-0" />
                    <span>Istoric conversații</span>
                  </li>
                  <li className="flex items-center text-gray-300">
                    <Check size={16} className="text-white mr-3 flex-shrink-0" />
                    <span>Suport prioritar</span>
                  </li>
                </ul>
                
                <Button 
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={!user}
                  className={`w-full transition-all duration-300 ${
                    index === 1 
                      ? 'bg-white text-black hover:bg-gray-200' 
                      : 'bg-transparent border border-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {!user ? 'Conectează-te pentru a cumpăra' : 'Cumpără Acum'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-8">
            Întrebări Frecvente
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-black border border-gray-800 p-6 rounded-lg hover:border-gray-700 transition-colors">
              <h3 className="text-white font-semibold mb-2">
                Cum se calculează creditele?
              </h3>
              <p className="text-gray-400">
                1 minut de convorbire cu asistentul AI costă 1.000 de credite. Creditele se deduc automat.
              </p>
            </div>
            
            <div className="bg-black border border-gray-800 p-6 rounded-lg hover:border-gray-700 transition-colors">
              <h3 className="text-white font-semibold mb-2">
                Creditele expiră?
              </h3>
              <p className="text-gray-400">
                Nu, creditele achiziționate nu expiră niciodată. Le poți folosi oricând.
              </p>
            </div>
            
            <div className="bg-black border border-gray-800 p-6 rounded-lg hover:border-gray-700 transition-colors">
              <h3 className="text-white font-semibold mb-2">
                Pot să returnez creditele?
              </h3>
              <p className="text-gray-400">
                Creditele achiziționate nu sunt returnabile, dar oferim suport complet pentru orice problemă.
              </p>
            </div>
            
            <div className="bg-black border border-gray-800 p-6 rounded-lg hover:border-gray-700 transition-colors">
              <h3 className="text-white font-semibold mb-2">
                Ce se întâmplă dacă rămân fără credite?
              </h3>
              <p className="text-gray-400">
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
