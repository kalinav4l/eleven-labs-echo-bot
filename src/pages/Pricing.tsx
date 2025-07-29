import React, { useState } from 'react';
import { Check, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const plans = [
    {
      name: 'GRATUIT',
      monthlyPrice: 0,
      annualPrice: 0,
      minutes: 33,
      description: 'Perfect pentru testare',
      features: [
        '33 credite incluse',
        'Toate funcționalitățile AI',
        'Fără card de credit',
        'Support prin email'
      ],
      buttonText: 'Începe Gratuit',
      popular: false
    },
    {
      name: 'BRONZE',
      monthlyPrice: 99,
      annualPrice: 87.12, // 12% discount
      minutes: 660,
      description: 'Pentru utilizatori ocazionali',
      features: [
        '660 credite incluse',
        '$0.15/credit suplimentar',
        'Analytics de bază',
        'Priority support',
        'Integrări API'
      ],
      buttonText: 'Alege Bronze',
      popular: true
    },
    {
      name: 'SILVER',
      monthlyPrice: 500,
      annualPrice: 440, // 12% discount
      minutes: 3333,
      description: 'Pentru utilizatori activi',
      features: [
        '3,333 credite incluse',
        '$0.15/credit suplimentar',
        'Analytics avansate',
        'Priority support',
        'Rapoarte detaliate',
        'White-label basic'
      ],
      buttonText: 'Alege Silver',
      popular: false
    },
    {
      name: 'ENTERPRISE',
      monthlyPrice: 'Custom',
      annualPrice: 'Custom',
      minutes: 'Nelimitate',
      description: 'Pentru companii mari',
      features: [
        'Credite nelimitate',
        'Prețuri personalizate',
        'White-label complet',
        'Account manager dedicat',
        'Integrări personalizate',
        'SLA garantat'
      ],
      buttonText: 'Contactează-ne',
      popular: false
    }
  ];

  const getDisplayPrice = (plan: any) => {
    if (plan.monthlyPrice === 'Custom') return 'Custom';
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    return price === 0 ? 'GRATUIT' : `$${price}`;
  };

  const getRecommendedPlan = (minutes: number) => {
    if (minutes <= 5) return 'GRATUIT';
    if (minutes <= 200) return 'BRONZE';
    if (minutes <= 500) return 'SILVER';
    return 'ENTERPRISE';
  };

  const calculateCost = (minutes: number) => {
    if (minutes <= 5) return 0;
    if (minutes <= 200) return isAnnual ? 26.4 : 30;
    if (minutes <= 500) return isAnnual ? 66 : 75;
    return minutes * 0.15;
  };

  const handlePlanSelect = async (planName: string) => {
    if (!user) {
      navigate('/auth');
      toast({
        title: "Autentificare necesară",
        description: "Te rugăm să te autentifici pentru a continua.",
      });
      return;
    }

    if (planName === 'GRATUIT') {
      toast({
        title: "Plan gratuit activ",
        description: "Ai deja acces la planul gratuit de 5 minute.",
      });
      return;
    }

    if (planName === 'ENTERPRISE') {
      window.open('mailto:contact@company.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }

    try {
      const packageName = planName === 'BRONZE' ? 'Bronze Plan' : 'Silver Plan';
      
      const { data: packages } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('name', packageName)
        .single();

      if (!packages) {
        toast({
          title: "Eroare",
          description: "Pachetul selectat nu este disponibil momentan.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { package_id: packages.id }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut inițializa procesul de plată. Te rugăm să încerci din nou.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Planuri și Prețuri
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Alege planul perfect pentru nevoile tale. Transparent, flexibil și fără surprize.
            </p>
          </div>

          {/* Monthly/Yearly Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  !isAnnual 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
                  isAnnual 
                    ? 'bg-black text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 16%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative bg-white border rounded-2xl p-8 ${
                  plan.popular 
                    ? 'border-2 border-black shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                } transition-all duration-200`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900">
                      {getDisplayPrice(plan)}
                      {plan.monthlyPrice !== 'Custom' && plan.monthlyPrice !== 0 && (
                        <span className="text-lg font-normal text-gray-600">
                          /{isAnnual ? 'yr' : 'mo'}
                        </span>
                      )}
                    </div>
                    {isAnnual && plan.monthlyPrice !== 'Custom' && typeof plan.monthlyPrice === 'number' && plan.monthlyPrice > 0 && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Save ${(((plan.monthlyPrice as number) * 12) - ((plan.annualPrice as number) * 12)).toFixed(0)}/yr
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => handlePlanSelect(plan.name)}
                    className={`w-full mb-6 ${
                      plan.popular 
                        ? 'bg-black hover:bg-gray-800 text-white' 
                        : 'bg-gray-900 hover:bg-black text-white'
                    }`}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>

                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                      See all features
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-16">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Fără contracte</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Anulare oricând</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PricingPage;