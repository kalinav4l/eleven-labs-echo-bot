import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface KalinaAgent {
  id: string;
  agent_id: string;
  name: string;
  description: string | null;
  elevenlabs_agent_id: string | null;
}

export const useKalinaAgents = () => {
  const [agents, setAgents] = useState<KalinaAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAgents = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('kalina_agents')
          .select('id, agent_id, name, description, elevenlabs_agent_id')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) throw error;
        setAgents(data || []);
      } catch (error) {
        console.error('Error fetching agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, [user]);

  return { agents, isLoading };
};