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
  const {
    user
  } = useAuth();
  const {
    profile
  } = useUserProfile();
  const navigate = useNavigate();
  const {
    data: userBalance,
    isLoading
  } = useQuery({
    queryKey: ['user-balance', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const {
        data,
        error
      } = await supabase.from('user_balance').select('balance_usd').eq('user_id', user.id).single();
      if (error) {
        console.error('Error fetching balance:', error);
        return null;
      }
      return data;
    },
    enabled: !!user
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
  return <div className="flex items-center space-x-3 animate-fade-in">
      {/* Balance Display - Liquid Glass Style */}
      <div className="relative overflow-hidden bg-white/20 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 liquid-glass">
        <div className="flex items-center space-x-3 px-[17px] py-[7px]">
          
          <div>
            <div className="text-base font-semibold text-gray-900">
              ${balanceUsd.toFixed(2)}
            </div>
            
          </div>
        </div>
      </div>

      {/* Plan Display - Same Size as Other Buttons */}
      <div className="relative overflow-hidden bg-white/20 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 liquid-glass">
        <div className="px-4 py-2.5 flex items-center justify-center min-w-[80px]">
          <div className="flex items-center space-x-2">
            <PlanIcon className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900">{currentPlan.name}</span>
          </div>
        </div>
      </div>

      {/* Upgrade Button - Same Style and Size */}
      {currentPlan.name !== 'Silver' && <div className="relative overflow-hidden bg-white/20 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 liquid-glass cursor-pointer" onClick={handleUpgrade}>
          <div className="px-4 py-2.5 flex items-center justify-center min-w-[80px]">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-medium text-gray-900">Upgrade</span>
            </div>
          </div>
        </div>}
    </div>;
};
export default CreditsPlanDisplay;