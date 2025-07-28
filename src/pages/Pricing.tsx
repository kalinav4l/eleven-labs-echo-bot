import React, { useState } from 'react';
import { Check, Star, Calculator, ArrowRight, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PricingPage = () => {
  const [calculatorMinutes, setCalculatorMinutes] = useState(100);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const plans = [
    {
      name: 'GRATUIT',
      price: '$0',
      originalPrice: null,
      minutes: 5,
      pricePerMinute: '$0.15',
      description: 'Perfect pentru a testa serviciul',
      features: [
        '5 minute de utilizare',
        'Toate funcționalitățile AI',
        'Fără card de credit necesar',
        'Support prin email'
      ],
      buttonText: 'Începe Gratuit',
      popular: false,
      highlight: false
    },
    {
      name: 'BRONZE',
      price: '$30',
      originalPrice: null,
      minutes: 200,
      pricePerMinute: '$0.15',
      description: 'Excelent pentru utilizatori ocazionali',
      features: [
        '200 minute incluse',
        '$0.15/minut pentru minute suplimentare',
        'Toate funcționalitățile AI',
        'Analytics de bază',
        'Support prin email'
      ],
      buttonText: 'Alege Bronze',
      popular: true,
      highlight: true
    },
    {
      name: 'SILVER',
      price: '$75',
      originalPrice: null,
      minutes: 500,
      pricePerMinute: '$0.15',
      description: 'Ideal pentru utilizatori cu nevoi medii',
      features: [
        '500 minute incluse',
        '$0.15/minut pentru minute suplimentare',
        'Toate funcționalitățile AI',
        'Analytics avansate',
        'Priority support',
        'Rapoarte detaliate'
      ],
      buttonText: 'Alege Silver',
      popular: false,
      highlight: false
    },
    {
      name: 'ENTERPRISE',
      price: 'Custom',
      originalPrice: null,
      minutes: 'Personalizat',
      pricePerMinute: 'Negociabil',
      description: 'Pentru companii mari cu nevoi specifice',
      features: [
        'Minute nelimitate',
        'Prețuri personalizate',
        'White-label soluții',
        'Account manager dedicat',
        'Integrări personalizate',
        'SLA garantat'
      ],
      buttonText: 'Contactează-ne',
      popular: false,
      highlight: false
    }
  ];

  const getRecommendedPlan = (minutes: number) => {
    if (minutes <= 5) return 'GRATUIT';
    if (minutes <= 200) return 'BRONZE';
    if (minutes <= 500) return 'SILVER';
    return 'ENTERPRISE';
  };

  const calculateCost = (minutes: number) => {
    if (minutes <= 5) return 0;
    if (minutes <= 200) return 30;
    if (minutes <= 500) return 75;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Alege planul potrivit pentru tine
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Prețuri transparente bazate pe minute de utilizare. Începe gratuit și plătește doar pentru ceea ce folosești.
          </p>
        </div>

        {/* Calculator Section */}
        <Card className="max-w-md mx-auto mb-16 border-2 border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Calculator className="w-5 h-5" />
              Calculator Rapid
            </CardTitle>
            <CardDescription>
              Descoperă planul ideal pentru tine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="minutes">Câte minute estimezi pe lună?</Label>
              <Input
                id="minutes"
                type="number"
                value={calculatorMinutes}
                onChange={(e) => setCalculatorMinutes(parseInt(e.target.value) || 0)}
                className="text-center text-lg font-semibold"
              />
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-center">
                <p className="text-sm text-gray-600">Plan recomandat:</p>
                <p className="text-lg font-bold text-blue-600">
                  {getRecommendedPlan(calculatorMinutes)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Cost estimat: <span className="font-semibold">${calculateCost(calculatorMinutes)}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.highlight ? 'border-2 border-blue-500 shadow-lg scale-105' : 'border border-gray-200'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.price}
                    {plan.price !== 'Custom' && plan.price !== '$0' && (
                      <span className="text-sm font-normal text-gray-500">/lună</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{plan.minutes} minute{typeof plan.minutes === 'number' && plan.minutes !== 1 ? '' : ''}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>{plan.pricePerMinute}/minut</span>
                  </div>
                </div>
                <CardDescription className="text-center">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                >
                  {plan.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Întrebări frecvente</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Cum se calculează minutele?</h3>
                <p className="text-gray-600">
                  Fiecare minut de conversație cu AI-ul este calculat la tariful de $0.15/minut. 
                  Minutele incluse în plan se consumă primul, apoi se aplică tariful per minut.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Pot să îmi schimb planul oricând?</h3>
                <p className="text-gray-600">
                  Da, poți să îți upgrading sau downgrading planul oricând. 
                  Modificările se aplică din următoarea perioadă de facturare.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Ce se întâmplă cu minutele neutilizate?</h3>
                <p className="text-gray-600">
                  Minutele incluse în plan se resetează la fiecare ciclu de facturare și nu se reportează.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;