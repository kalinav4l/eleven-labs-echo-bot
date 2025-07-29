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
  
  // Determine plan based on balance ranges (simpler approach)
  const getPlan = (balance: number) => {
    if (balance >= 500) return { 
      name: 'Silver', 
      color: 'bg-gradient-to-r from-slate-400 to-slate-500', 
      textColor: 'text-white',
      icon: Crown 
    };
    if (balance >= 99) return { 
      name: 'Bronze', 
      color: 'bg-gradient-to-r from-amber-500 to-orange-500', 
      textColor: 'text-white',
      icon: Zap 
    };
    return { 
      name: 'Free', 
      color: 'bg-gradient-to-r from-emerald-400 to-green-500', 
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
    <div className="flex items-center space-x-4 animate-fade-in">
      {/* Balance Display */}
      <div className="relative overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-500 hover:scale-105 group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative px-4 py-3 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-300">
              ${balanceUsd.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Sold disponibil
            </div>
          </div>
        </div>
      </div>

      {/* Plan Display */}
      <div className="relative group">
        <Badge 
          variant="secondary" 
          className={`${currentPlan.color} ${currentPlan.textColor} border-0 px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-500 cursor-pointer relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center space-x-2">
            <PlanIcon className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span className="group-hover:scale-105 transition-transform duration-300">{currentPlan.name}</span>
          </div>
        </Badge>
      </div>

      {/* Upgrade Button (only show if not on highest plan) */}
      {currentPlan.name !== 'Silver' && (
        <Button
          onClick={handleUpgrade}
          size="sm"
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-4 py-2 font-semibold shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-500 border-0 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center space-x-2">
            <Crown className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span>Upgrade</span>
          </div>
        </Button>
      )}
    </div>
  );
};

export default CreditsPlanDisplay;