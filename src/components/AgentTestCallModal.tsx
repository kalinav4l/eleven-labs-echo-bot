
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Phone, Loader2, Wallet, AlertTriangle } from 'lucide-react';
import { useCallInitiation } from '@/hooks/useCallInitiation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { COST_PER_MINUTE } from '@/utils/costCalculations';

interface AgentTestCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: {
    id: string;
    agent_id: string;
    name: string;
  };
}

export const AgentTestCallModal: React.FC<AgentTestCallModalProps> = ({
  isOpen,
  onClose,
  agent
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { user } = useAuth();
  
  const { initiateCall, isInitiating } = useCallInitiation({
    agentId: agent.agent_id,
    phoneNumber: phoneNumber
  });

  // Fetch user balance and check admin status
  const fetchBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_balance')
        .select('balance_usd')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      setUserBalance(data?.balance_usd || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('is_admin_user', {
        _user_id: user.id
      });
      
      if (error) throw error;
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchBalance();
      checkAdminStatus();
    }
  }, [user, isOpen]);

  // Test calls are free for all users
  const estimatedCostPerMinute = 0;
  const availableMinutes = 999;
  const hasInsufficientBalance = false;

  const handleTestCall = async () => {
    if (!phoneNumber.trim()) return;
    
    await initiateCall(agent.agent_id, phoneNumber, `Test pentru ${agent.name}`);
    
    if (!isInitiating) {
      setPhoneNumber('');
      onClose();
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Phone className="w-5 h-5 text-[#0A5B4C]" />
            Test Apel - {agent.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="test-phone" className="text-gray-900">
              Numărul tău de telefon
            </Label>
            <Input
              id="test-phone"
              type="tel"
              placeholder="+40712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-white border-gray-300 text-gray-900 focus:border-[#0A5B4C] focus:ring-[#0A5B4C]"
            />
            <p className="text-sm text-gray-600">
              Agentul te va suna pe acest număr pentru a testa conversația
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-900 font-medium">Agent:</p>
            <p className="text-xs text-gray-600">{agent.name}</p>
          </div>

          {/* Balance and Cost Information */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#0A5B4C]" />
                <span className="text-sm font-medium text-gray-900">
                  Test Apel Gratuit
                </span>
              </div>
              <Badge variant="default">
                GRATUIT
              </Badge>
            </div>
            
            <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
              <span className="font-medium">✓ Apeluri de test gratuite pentru toți utilizatorii</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
              disabled={isInitiating}
            >
              Anulează
            </Button>
            <Button
              onClick={handleTestCall}
              disabled={!phoneNumber.trim() || isInitiating}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white border border-gray-700"
            >
              {isInitiating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Se Inițiază...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 mr-2" />
                  Inițiază Test
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
