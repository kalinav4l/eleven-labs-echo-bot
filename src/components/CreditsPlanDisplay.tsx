import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CreditCard, Crown, Zap, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const CreditsPlanDisplay = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  const { data: userBalance, isLoading } = useQuery({
    queryKey: ['user-balance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_balance')
        .select('balance_usd')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching balance:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  if (!user || isLoading) {
    return null;
  }

  const balanceUsd = userBalance?.balance_usd ?? 0;
  
  // Determine plan - keep it simple with only green accent
  const getPlan = (balance: number) => {
    if (balance >= 500) return { 
      name: 'Silver', 
      color: 'bg-white/20 backdrop-blur-sm border border-white/30', 
      textColor: 'text-gray-900',
      icon: Crown 
    };
    if (balance >= 99) return { 
      name: 'Bronze', 
      color: 'bg-white/20 backdrop-blur-sm border border-white/30', 
      textColor: 'text-gray-900',
      icon: Zap 
    };
    return { 
      name: 'Free', 
      color: 'bg-green-500/90 backdrop-blur-sm', 
      textColor: 'text-white',
      icon: DollarSign 
    };
  };

  const currentPlan = getPlan(balanceUsd);
  const PlanIcon = currentPlan.icon;

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="flex items-center space-x-3 animate-fade-in">
      {/* Balance Display - Liquid Glass Style */}
      <div className="relative overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group liquid-glass">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative px-4 py-2.5 flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-sm">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              ${balanceUsd.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">
              Sold disponibil
            </div>
          </div>
        </div>
      </div>

      {/* Plan Display - Liquid Glass Style */}
      <div className="relative">
        <Badge 
          variant="secondary" 
          className={`${currentPlan.color} ${currentPlan.textColor} border-0 px-4 py-2.5 text-sm font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer liquid-glass`}
        >
          <div className="flex items-center space-x-2">
            <PlanIcon className="w-4 h-4" />
            <span>{currentPlan.name}</span>
          </div>
        </Badge>
      </div>

      {/* Upgrade Button - Minimalist Green */}
      {currentPlan.name !== 'Silver' && (
        <Button
          onClick={handleUpgrade}
          size="sm"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 liquid-glass"
        >
          <div className="flex items-center space-x-2">
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </div>
        </Button>
      )}
    </div>
  );
};

export default CreditsPlanDisplay;