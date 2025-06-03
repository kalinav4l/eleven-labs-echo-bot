
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HamburgerMenu from '@/components/HamburgerMenu';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      monthlyPrice: '29',
      yearlyPrice: '290',
      description: 'Perfect pentru început',
      features: [
        '100 minute de convorbire/lună',
        '1 agent AI',
        'Suport email',
        'Rapoarte de bază',
        'Integrări standard'
      ]
    },
    {
      name: 'Professional',
      monthlyPrice: '79',
      yearlyPrice: '790',
      description: 'Pentru echipe mici și mijlocii',
      features: [
        '500 minute de convorbire/lună',
        '3 agenți AI',
        'Suport prioritar',
        'Rapoarte avansate',
        'Integrări premium',
        'Personalizare voce',
        'API access'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      monthlyPrice: '199',
      yearlyPrice: '1990',
      description: 'Pentru companii mari',
      features: [
        'Minute nelimitate',
        'Agenți AI nelimitați',
        'Suport dedicat 24/7',
        'Rapoarte personalizate',
        'Toate integrările',
        'White-label solution',
        'Onboarding dedicat',
        'SLA garantat'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <HamburgerMenu />
      
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-4">
            Alege Planul Potrivit
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Planuri flexibile pentru orice nevoie de business. Începe gratuit și scalează pe măsură ce crești.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`bg-black border-gray-800 relative transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'border-white scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-white text-black px-4 py-1 rounded-full text-sm font-medium">
                    Cel mai popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <div className="text-white">
                    <span className="text-4xl font-bold">{plan.monthlyPrice}</span>
                    <span className="text-lg">€/lună</span>
                  </div>
                  <div className="text-gray-400 mt-2">
                    sau {plan.yearlyPrice}€/an (2 luni gratuite)
                  </div>
                </div>
                <p className="text-gray-400 mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <Check size={16} className="text-white mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-white text-black hover:bg-gray-200' 
                      : 'bg-transparent border border-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  Începe Acum
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-8">
            Întrebări Frecvente despre Prețuri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-black border border-gray-800 p-6 rounded-lg hover:border-gray-700 transition-colors">
              <h3 className="text-white font-semibold mb-2">
                Pot să-mi schimb planul oricând?
              </h3>
              <p className="text-gray-400">
                Da, poți să-ți schimbi planul oricând. Diferența de preț va fi calculată proporțional.
              </p>
            </div>
            
            <div className="bg-black border border-gray-800 p-6 rounded-lg hover:border-gray-700 transition-colors">
              <h3 className="text-white font-semibold mb-2">
                Există o perioadă de testare gratuită?
              </h3>
              <p className="text-gray-400">
                Da, oferim 14 zile de testare gratuită pentru toate planurile, fără obligații.
              </p>
            </div>
            
            <div className="bg-black border border-gray-800 p-6 rounded-lg hover:border-gray-700 transition-colors">
              <h3 className="text-white font-semibold mb-2">
                Ce se întâmplă dacă depășesc minutele incluse?
              </h3>
              <p className="text-gray-400">
                Minutele suplimentare sunt taxate la 0.1€/minut pentru toate planurile.
              </p>
            </div>
            
            <div className="bg-black border border-gray-800 p-6 rounded-lg hover:border-gray-700 transition-colors">
              <h3 className="text-white font-semibold mb-2">
                Pot să anulez oricând?
              </h3>
              <p className="text-gray-400">
                Da, poți să anulezi abonamentul oricând, fără penalizări sau taxe ascunse.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
