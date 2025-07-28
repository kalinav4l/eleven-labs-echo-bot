import React, { useState } from 'react';
import { Check, Star, Calculator, ArrowRight, Clock, DollarSign, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';

const PricingPage = () => {
  const [calculatorMinutes, setCalculatorMinutes] = useState(100);
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const plans = [
    {
      name: 'GRATUIT',
      icon: Sparkles,
      monthlyPrice: 0,
      annualPrice: 0,
      minutes: 5,
      description: 'Perfect pentru testare',
      features: [
        '5 minute de utilizare',
        'Toate funcționalitățile AI',
        'Fără card de credit',
        'Support prin email'
      ],
      buttonText: 'Începe Gratuit',
      popular: false,
      gradient: 'from-gray-400 to-gray-600'
    },
    {
      name: 'BRONZE',
      icon: Zap,
      monthlyPrice: 30,
      annualPrice: 26.4, // 12% discount
      minutes: 200,
      description: 'Pentru utilizatori ocazionali',
      features: [
        '200 minute incluse',
        '$0.15/minut suplimentar',
        'Analytics de bază',
        'Priority support',
        'Integrări API'
      ],
      buttonText: 'Alege Bronze',
      popular: true,
      gradient: 'from-amber-400 to-orange-600'
    },
    {
      name: 'SILVER',
      icon: Crown,
      monthlyPrice: 75,
      annualPrice: 66, // 12% discount
      minutes: 500,
      description: 'Pentru utilizatori activi',
      features: [
        '500 minute incluse',
        '$0.15/minut suplimentar',
        'Analytics avansate',
        'Priority support',
        'Rapoarte detaliate',
        'White-label basic'
      ],
      buttonText: 'Alege Silver',
      popular: false,
      gradient: 'from-gray-300 to-gray-500'
    },
    {
      name: 'ENTERPRISE',
      icon: Crown,
      monthlyPrice: 'Custom',
      annualPrice: 'Custom',
      minutes: 'Nelimitate',
      description: 'Pentru companii mari',
      features: [
        'Minute nelimitate',
        'Prețuri personalizate',
        'White-label complet',
        'Account manager dedicat',
        'Integrări personalizate',
        'SLA garantat'
      ],
      buttonText: 'Contactează-ne',
      popular: false,
      gradient: 'from-purple-400 to-purple-600'
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background Glass Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 space-y-12 p-8">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Pricing that scales with you</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Planuri și Prețuri
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Alege planul perfect pentru nevoile tale. Transparent, flexibil și fără surprize.
            </p>
          </div>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Lunar
            </span>
            <div className="relative">
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-purple-600"
              />
              {isAnnual && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-green-500 text-white text-xs rounded-md whitespace-nowrap">
                  Economisești 12%
                </div>
              )}
            </div>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Anual
            </span>
          </div>

          {/* Calculator Section */}
          <div className="max-w-md mx-auto">
            <Card className="bg-white/70 backdrop-blur-md border border-white/30 shadow-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2 text-lg">
                  <Calculator className="w-5 h-5 text-purple-600" />
                  Calculator Inteligent
                </CardTitle>
                <CardDescription className="text-sm">
                  Descoperă planul ideal pentru tine
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="minutes" className="text-sm font-medium">
                    Câte minute estimezi pe lună?
                  </Label>
                  <Input
                    id="minutes"
                    type="number"
                    value={calculatorMinutes}
                    onChange={(e) => setCalculatorMinutes(parseInt(e.target.value) || 0)}
                    className="text-center text-lg font-semibold mt-1 bg-white/50 border-white/30"
                  />
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200/50">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Plan recomandat:</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {getRecommendedPlan(calculatorMinutes)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Cost: <span className="font-semibold">${calculateCost(calculatorMinutes)}{isAnnual ? '/an' : '/lună'}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={plan.name} 
                  className={`relative group transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
                    plan.popular 
                      ? 'bg-white/80 backdrop-blur-md border-2 border-purple-300/50 shadow-2xl ring-4 ring-purple-100/50' 
                      : 'bg-white/60 backdrop-blur-md border border-white/30 shadow-xl hover:shadow-2xl'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Star className="w-3 h-3" />
                        CEL MAI POPULAR
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4 relative">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{plan.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="relative">
                        {!isAnnual && plan.monthlyPrice !== 'Custom' && typeof plan.monthlyPrice === 'number' && plan.monthlyPrice > 0 && (
                          <div className="text-sm text-gray-500 line-through">
                            ${(plan.monthlyPrice as number) * 12}/an
                          </div>
                        )}
                        <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {getDisplayPrice(plan)}
                          {plan.monthlyPrice !== 'Custom' && plan.monthlyPrice !== 0 && (
                            <span className="text-sm font-normal text-gray-500">
                              /{isAnnual ? 'an' : 'lună'}
                            </span>
                          )}
                        </div>
                        {isAnnual && plan.monthlyPrice !== 'Custom' && typeof plan.monthlyPrice === 'number' && plan.monthlyPrice > 0 && (
                          <div className="text-xs text-green-600 font-semibold">
                            Economisești ${(((plan.monthlyPrice as number) * 12) - ((plan.annualPrice as number) * 12)).toFixed(0)}/an
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{plan.minutes} minute{typeof plan.minutes === 'number' && plan.minutes !== 1 ? '' : ''}</span>
                      </div>
                    </div>
                    <CardDescription className="text-center text-sm mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      onClick={() => handlePlanSelect(plan.name)}
                      className={`w-full group relative overflow-hidden ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg'
                          : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black'
                      } transition-all duration-300`}
                      size="lg"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {plan.buttonText}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Trust Indicators */}
          <div className="text-center space-y-4">
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