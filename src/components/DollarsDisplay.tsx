
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DollarsDisplay = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: balance, isLoading } = useQuery({
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
        return { balance_usd: 100.00 }; // Default balance for new users
      }

      return data;
    },
    enabled: !!user,
  });

  if (!user || isLoading) {
    return null;
  }

  const currentBalance = balance?.balance_usd ?? 100.00;

  const handleAddFunds = () => {
    navigate('/pricing');
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <DollarSign className="w-4 h-4 text-green-600" />
        <span className="text-sm text-gray-700 font-medium">
          ${currentBalance.toFixed(2)}
        </span>
      </div>
      <Button
        onClick={handleAddFunds}
        size="sm"
        className="bg-black hover:bg-gray-800 text-white px-3 py-2"
      >
        <Plus className="w-4 h-4 mr-1" />
        Adaugă
      </Button>
    </div>
  );
};

export default DollarsDisplay;
