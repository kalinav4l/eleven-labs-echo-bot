import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CreditCard, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const CreditsPlanDisplay = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  const { data: credits, isLoading } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('remaining_credits, total_credits, used_credits')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  if (!user || isLoading) {
    return null;
  }

  const usedCredits = credits?.used_credits ?? 0;
  const remainingCredits = credits?.remaining_credits ?? 0;
  const totalCredits = credits?.total_credits ?? 0;
  
  // Determine plan based on total credits
  const getPlan = (total: number) => {
    if (total >= 3333) return { name: 'Silver', color: 'bg-gradient-to-r from-gray-400 to-gray-600', icon: Crown };
    if (total >= 660) return { name: 'Bronze', color: 'bg-gradient-to-r from-orange-400 to-orange-600', icon: Zap };
    return { name: 'Free', color: 'bg-gradient-to-r from-green-400 to-green-600', icon: CreditCard };
  };

  const currentPlan = getPlan(totalCredits);
  const PlanIcon = currentPlan.icon;

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Credits Display */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
        <CreditCard className="w-4 h-4 text-gray-600" />
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {remainingCredits.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            credite
          </div>
        </div>
      </div>

      {/* Plan Display */}
      <div className="flex items-center space-x-2">
        <Badge 
          variant="secondary" 
          className={`${currentPlan.color} text-white border-0 px-3 py-2 hover:scale-105 transition-all duration-300 shadow-sm`}
        >
          <PlanIcon className="w-3 h-3 mr-1" />
          {currentPlan.name}
        </Badge>
      </div>

      {/* Upgrade Button (only show if not on highest plan) */}
      {currentPlan.name !== 'Silver' && (
        <Button
          onClick={handleUpgrade}
          size="sm"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white px-3 py-2 hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <Crown className="w-4 h-4 mr-1" />
          Upgrade
        </Button>
      )}
    </div>
  );
};

export default CreditsPlanDisplay;