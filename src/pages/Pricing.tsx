import React, { useState, useEffect } from 'react';
import { Check, Star, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { useScrollReveal } from '@/hooks/useScrollReveal';
const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal('up', 0.2);
  const { ref: toggleRef, isVisible: toggleVisible } = useScrollReveal('up', 0.4);
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal('up', 0.6);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('credit_packages')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });

        if (error) throw error;

        console.log('Plans loaded:', data);
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: "Eroare",
          description: "Nu am putut încărca planurile. Te rugăm să încerci din nou.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [toast]);
  const getDisplayPrice = (plan: any) => {
    if (plan.name === 'ENTERPRISE') return 'Custom';
    const price = isAnnual ? plan.price_yearly : plan.price_monthly;
    return price === 0 ? 'GRATUIT' : `$${(price / 100).toFixed(0)}`;
  };

  const getButtonText = (plan: any) => {
    if (plan.name === 'GRATUIT') return 'Începe Gratuit';
    if (plan.name === 'ENTERPRISE') return 'Contactează-ne';
    return `Alege ${plan.name}`;
  };

  const handlePlanSelect = async (plan: any) => {
    if (!user) {
      navigate('/auth');
      toast({
        title: "Autentificare necesară",
        description: "Te rugăm să te autentifici pentru a continua."
      });
      return;
    }

    setProcessingPlan(plan.id);

    try {
      if (plan.name === 'GRATUIT') {
        toast({
          title: "Plan gratuit activ",
          description: "Ai deja acces la planul gratuit."
        });
        setProcessingPlan(null);
        return;
      }

      if (plan.name === 'ENTERPRISE') {
        window.open('mailto:support@kalina.ai?subject=Enterprise Plan Inquiry', '_blank');
        setProcessingPlan(null);
        return;
      }

      // Call create-checkout edge function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          packageId: plan.id,
          isAnnual: isAnnual
        }
      });

      if (error) throw error;

      if (data.contact_required) {
        toast({
          title: "Contact Necesar",
          description: data.message
        });
        window.open(`mailto:${data.contact_email}`, '_blank');
        return;
      }

      if (data.success && data.redirect_url) {
        // Free plan activated
        window.location.href = data.redirect_url;
        return;
      }

      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Eroare",
        description: error.message || "Te rugăm să încerci din nou sau contactează-ne direct.",
        variant: "destructive"
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Se încarcă planurile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Debug: Check if plans are empty
  if (!loading && plans.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Nu s-au găsit planuri active.</p>
            <Button onClick={() => window.location.reload()}>Reîncarcă</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  return <DashboardLayout>
      <div className="min-h-screen py-12 bg-white relative overflow-hidden">
        {/* Liquid Glass Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-pink-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-gradient-to-br from-yellow-200/20 to-green-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div 
            ref={headerRef}
            className={`text-center mb-12 transition-all duration-1000 ease-out ${
              headerVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4 relative">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text">
                Planuri și Prețuri
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Alege planul perfect pentru nevoile tale. Transparent, flexibil și fără surprize.
            </p>
          </div>

          {/* Monthly/Yearly Toggle */}
          <div 
            ref={toggleRef}
            className={`flex items-center justify-center mb-12 transition-all duration-1000 ease-out ${
              toggleVisible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <div className="flex items-center bg-gray-100 rounded-full p-1 backdrop-blur-sm bg-opacity-80 border border-white/20 shadow-lg">
              <button 
                onClick={() => setIsAnnual(false)} 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                  !isAnnual 
                    ? 'bg-white text-gray-900 shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:scale-105'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)} 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-500 relative ${
                  isAnnual 
                    ? 'bg-black text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-900 hover:scale-105'
                }`}
              >
                Yearly
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                  Save 16%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div 
            ref={cardsRef}
            className={`grid lg:grid-cols-4 md:grid-cols-2 gap-8 transition-all duration-1200 ease-out ${
              cardsVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-12'
            }`}
          >
            {plans.map((plan, index) => (
              <Card 
                key={plan.name} 
                className={`relative bg-white/90 backdrop-blur-md border rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/20 group ${
                  plan.is_popular 
                    ? 'border-2 border-black shadow-2xl shadow-black/10 transform scale-105 bg-gradient-to-b from-white/95 to-gray-50/95' 
                    : 'border-gray-200 hover:border-gray-300 bg-gradient-to-b from-white/90 to-gray-50/90'
                }`}
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  background: plan.is_popular 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)' 
                    : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)'
                }}
              >
                {/* Liquid Glass Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center relative z-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:scale-105 transition-transform duration-300">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">
                      {getDisplayPrice(plan)}
                      {plan.name !== 'ENTERPRISE' && plan.price_monthly > 0 && (
                        <span className="text-lg font-normal text-gray-600">
                          /{isAnnual ? 'an' : 'lună'}
                        </span>
                      )}
                    </div>
                    {isAnnual && plan.name !== 'ENTERPRISE' && plan.price_monthly > 0 && (
                      <div className="text-sm text-green-600 font-medium mt-1 animate-pulse">
                        Economisești ${((plan.price_monthly * 12 - plan.price_yearly) / 100).toFixed(0)}/an
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => handlePlanSelect(plan)} 
                    disabled={processingPlan === plan.id}
                    className={`w-full mb-6 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      plan.is_popular 
                        ? 'bg-black hover:bg-gray-800 text-white shadow-lg' 
                        : 'bg-gray-900 hover:bg-black text-white'
                    }`} 
                    size="lg"
                  >
                    {processingPlan === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Procesez...
                      </>
                    ) : (
                      getButtonText(plan)
                    )}
                  </Button>

                  <ul className="space-y-3 text-left">
                    {plan.features && plan.features.map((feature: string, featureIndex: number) => (
                      <li 
                        key={featureIndex} 
                        className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1"
                        style={{ animationDelay: `${(index * 0.2) + (featureIndex * 0.1)}s` }}
                      >
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 animate-pulse" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <button className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-all duration-300 hover:scale-105">
                      See all features
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-16">
            
          </div>
        </div>
      </div>
    </DashboardLayout>;
};
export default PricingPage;