
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { Coins, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CreditsDisplay = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: credits, isLoading } = useQuery({
    queryKey: ['user-credits', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_credits')
        .select('remaining_credits, total_credits')
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

  const remainingCredits = credits?.remaining_credits ?? 10000;

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 px-3 py-2 bg-[#FFD666] border border-[#FFBB00] rounded-lg">
        <Coins className="w-4 h-4 text-[#FFBB00]" />
        <span className="text-sm text-black font-bold">
          {remainingCredits.toLocaleString()} credite
        </span>
      </div>
      <Button
        onClick={handleUpgrade}
        size="sm"
        className="bg-[#FFBB00] hover:bg-[#E6A600] text-black px-3 py-2 font-bold border border-black"
      >
        <Plus className="w-4 h-4 mr-1" />
        Upgrade
      </Button>
    </div>
  );
};

export default CreditsDisplay;
