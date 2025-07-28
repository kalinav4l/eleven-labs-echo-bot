import React, { useState } from 'react';
import { Check, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      name: 'Free',
      description: 'Pentru persoane care vor să încerce cel mai avansat AI audio',
      credits: '10k credite/lună',
      monthlyPrice: 0,
      annualPrice: 0,
      popular: false,
      features: [
        'Text to Speech',
        'Speech to Text',
        'Conversational AI',
        'Studio',
        'Automated Dubbing',
        'API access'
      ],
      usage: [
        '10 minute de Text to Speech de înaltă calitate',
        '15 minute de Conversational AI'
      ]
    },
    {
      name: 'Starter',
      description: 'Pentru amatori care creează proiecte cu AI audio',
      credits: '30k credite/lună',
      monthlyPrice: 5,
      annualPrice: 4.4, // 12% discount
      popular: false,
      features: [
        'Totul din free, plus',
        'Commercial license',
        'Instant Voice Cloning',
        '20 projects in Studio',
        'Dubbing Studio'
      ],
      usage: [
        '30 minute de Text to Speech de înaltă calitate',
        '50 minute de Conversational AI'
      ]
    },
    {
      name: 'Creator',
      description: 'Pentru creatori care fac conținut premium pentru audiențe globale',
      credits: '100k credite/lună',
      monthlyPrice: 22,
      annualPrice: 19.36, // 12% discount
      originalPrice: 22,
      popular: true,
      discount: 'PRIMA LUNĂ 50% REDUCERE',
      features: [
        'Totul din Starter, plus',
        'Professional Voice Cloning',
        'Usage based billing pentru credite adiționale',
        'Audio de înaltă calitate 192 kbps'
      ],
      usage: [
        '100 minute de Text to Speech de înaltă calitate',
        '260 minute de Conversational AI'
      ]
    },
    {
      name: 'Pro',
      description: 'Pentru creatori care își măresc producția de conținut',
      credits: '500k credite/lună',
      monthlyPrice: 99,
      annualPrice: 87.12, // 12% discount
      popular: false,
      features: [
        'Totul din Creator, plus',
        '44.1kHz PCM audio output via API'
      ],
      usage: [
        '500 minute de Text to Speech de înaltă calitate',
        '1,100 minute de Conversational AI'
      ]
    }
  ];

  const handleGetStarted = async (plan: any) => {
    if (plan.name === 'Free') {
      toast({
        title: "Plan gratuit",
        description: "Deja beneficiezi de planul gratuit!",
      });
      return;
    }

    if (!user) {
      navigate('/auth');
      toast({
        title: "Autentificare necesară",
        description: "Te rugăm să te autentifici pentru a continua.",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          plan_name: plan.name,
          price: isAnnual ? plan.annualPrice : plan.monthlyPrice,
          credits: plan.credits,
          billing_period: isAnnual ? 'annual' : 'monthly'
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut inițializa procesul de plată. Te rugăm să încerci din nou.",
        variant: "destructive"
      });
    }
  };

  const calculateCost = (minutes: number) => {
    const costPerMinute = 0.15;
    return (minutes * costPerMinute).toFixed(2);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Plans built for creators and business of all sizes
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-end gap-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                  MONTHLY
                </span>
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  className="data-[state=checked]:bg-gray-900"
                />
                <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                  ANNUAL BILLING
                </span>
                {isAnnual && (
                  <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                    2 MONTHS FREE
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {plans.map((plan, index) => (
              <Card
                key={plan.name}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? 'border-2 border-black bg-white shadow-lg'
                    : 'border border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-px left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-black text-white border-0 px-4 py-1 rounded-none text-xs font-medium">
                      MOST POPULAR
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                  
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      {plan.credits}
                    </div>
                    {plan.discount && (
                      <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-3">
                        {plan.discount}
                      </div>
                    )}
                    <div className="flex items-end gap-1">
                      {plan.originalPrice && plan.originalPrice !== (isAnnual ? plan.annualPrice : plan.monthlyPrice) && (
                        <span className="text-lg text-gray-400 line-through">
                          ${plan.originalPrice}
                        </span>
                      )}
                      <span className="text-4xl font-bold text-gray-900">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-gray-600 text-sm mb-1">/per month</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Button
                    onClick={() => handleGetStarted(plan)}
                    variant={plan.popular ? "default" : "outline"}
                    className={`w-full mb-6 ${
                      plan.popular
                        ? 'bg-black hover:bg-gray-800 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    GET STARTED
                  </Button>
                  
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Credits usage examples */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-3">Credits usable for either:</div>
                    <div className="space-y-2">
                      {plan.usage.map((usage, usageIndex) => (
                        <div key={usageIndex} className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">
                            {usage}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button className="text-sm text-gray-600 mt-3 hover:text-gray-800 transition-colors">
                      View more
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Calculator Section */}
          <Card className="max-w-2xl mx-auto bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center text-gray-900">
                <Calculator className="h-5 w-5 text-gray-600" />
                Calculator de costuri
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Calculează costul pentru numărul de minute de care ai nevoie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Minute necesare pe lună:</label>
                  <input
                    type="number"
                    value={calculatorMinutes}
                    onChange={(e) => setCalculatorMinutes(Number(e.target.value))}
                    className="w-full mt-2 px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    min="1"
                    max="10000"
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      ${calculateCost(calculatorMinutes)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Cost estimat pentru {calculatorMinutes} minute
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PricingPage;