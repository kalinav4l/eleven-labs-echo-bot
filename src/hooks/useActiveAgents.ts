import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface ActiveAgent {
  id: string;
  agentId: string;
  agentName: string;
  status: 'idle' | 'calling' | 'in_conversation' | 'processing';
  currentContactName?: string;
  currentPhoneNumber?: string;
  conversationId?: string;
  callStartedAt?: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export const useActiveAgents = () => {
  const { user } = useAuth();
  const [activeAgents, setActiveAgents] = useState<ActiveAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Actualizez statusul unui agent
  const updateAgentStatus = useCallback(async (
    agentId: string,
    agentName: string,
    status: 'idle' | 'calling' | 'in_conversation' | 'processing',
    details?: {
      currentContactName?: string;
      currentPhoneNumber?: string;
      conversationId?: string;
      callStartedAt?: string;
    }
  ) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('active_agents')
        .upsert({
          user_id: user.id,
          agent_id: agentId,
          agent_name: agentName,
          status,
          current_contact_name: details?.currentContactName,
          current_phone_number: details?.currentPhoneNumber,
          conversation_id: details?.conversationId,
          call_started_at: details?.callStartedAt
        })
        .select()
        .single();

      if (error) {
        console.error('Eroare la actualizarea statusului agentului:', error);
        return false;
      }

      console.log('✅ Status agent actualizat:', data);
      return true;
    } catch (error) {
      console.error('Eroare la actualizarea statusului agentului:', error);
      return false;
    }
  }, [user]);

  // Șterg un agent activ
  const removeActiveAgent = useCallback(async (agentId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('active_agents')
        .delete()
        .eq('user_id', user.id)
        .eq('agent_id', agentId);

      if (error) {
        console.error('Eroare la ștergerea agentului activ:', error);
        return false;
      }

      console.log('✅ Agent activ șters:', agentId);
      return true;
    } catch (error) {
      console.error('Eroare la ștergerea agentului activ:', error);
      return false;
    }
  }, [user]);

  // Încarc toți agenții activi
  const loadActiveAgents = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('active_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('last_activity_at', { ascending: false });

      if (error) {
        console.error('Eroare la încărcarea agenților activi:', error);
        setIsLoading(false);
        return;
      }

      const agents: ActiveAgent[] = data.map(item => ({
        id: item.id,
        agentId: item.agent_id,
        agentName: item.agent_name,
        status: item.status as 'idle' | 'calling' | 'in_conversation' | 'processing',
        currentContactName: item.current_contact_name,
        currentPhoneNumber: item.current_phone_number,
        conversationId: item.conversation_id,
        callStartedAt: item.call_started_at,
        lastActivityAt: item.last_activity_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setActiveAgents(agents);
      console.log('✅ Agenți activi încărcați:', agents.length);
    } catch (error) {
      console.error('Eroare la încărcarea agenților activi:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Mă abonez la actualizări în timp real
  const subscribeToUpdates = useCallback(() => {
    if (!user || isSubscribed) return;

    console.log('🔄 Abonare la actualizări realtime pentru agenții activi');

    const channel = supabase
      .channel('active_agents_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_agents',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 Actualizare realtime agent activ:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const data = payload.new;
            const agent: ActiveAgent = {
              id: data.id,
              agentId: data.agent_id,
              agentName: data.agent_name,
              status: data.status as 'idle' | 'calling' | 'in_conversation' | 'processing',
              currentContactName: data.current_contact_name,
              currentPhoneNumber: data.current_phone_number,
              conversationId: data.conversation_id,
              callStartedAt: data.call_started_at,
              lastActivityAt: data.last_activity_at,
              createdAt: data.created_at,
              updatedAt: data.updated_at
            };

            setActiveAgents(prev => {
              const existingIndex = prev.findIndex(a => a.agentId === agent.agentId);
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = agent;
                return updated;
              } else {
                return [agent, ...prev];
              }
            });
          } else if (payload.eventType === 'DELETE') {
            const agentId = payload.old?.agent_id;
            if (agentId) {
              setActiveAgents(prev => prev.filter(a => a.agentId !== agentId));
            }
          }
        }
      )
      .subscribe();

    setIsSubscribed(true);

    return () => {
      supabase.removeChannel(channel);
      setIsSubscribed(false);
    };
  }, [user, isSubscribed]);

  // Încarc agenții la mount și mă abonez la actualizări
  useEffect(() => {
    loadActiveAgents();
    const unsubscribe = subscribeToUpdates();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]); // Only depend on user, not on the functions

  // Curat agenții inactivi (mai vechi de 10 minute)
  const cleanupInactiveAgents = useCallback(async () => {
    if (!user) return;

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    try {
      const { error } = await supabase
        .from('active_agents')
        .delete()
        .eq('user_id', user.id)
        .lt('last_activity_at', tenMinutesAgo);

      if (error) {
        console.error('Eroare la curățarea agenților inactivi:', error);
      } else {
        console.log('✅ Agenți inactivi curățați');
      }
    } catch (error) {
      console.error('Eroare la curățarea agenților inactivi:', error);
    }
  }, [user]);

  // Curăț agenții inactivi la fiecare 5 minute
  useEffect(() => {
    const interval = setInterval(cleanupInactiveAgents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cleanupInactiveAgents]);

  return {
    activeAgents,
    isLoading,
    updateAgentStatus,
    removeActiveAgent,
    loadActiveAgents
  };
};