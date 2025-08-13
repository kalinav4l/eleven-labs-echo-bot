import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface CallStatus {
  contactId: string;
  contactName: string;
  status: 'waiting' | 'calling' | 'in-progress' | 'processing' | 'completed' | 'failed';
  conversationId?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  cost?: number;
}

interface CampaignSession {
  id: string;
  sessionId: string;
  agentId: string;
  phoneId?: string;
  status: 'active' | 'paused' | 'stopped' | 'completed';
  totalContacts: number;
  currentProgress: number;
  currentContactName?: string;
  callStatuses: CallStatus[];
  startedAt: string;
  updatedAt: string;
}

export const useCampaignPersistence = (sessionId: string) => {
  const { user } = useAuth();
  const [campaignSession, setCampaignSession] = useState<CampaignSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Generez un session ID unic pentru această campanie
  const generateSessionId = useCallback(() => {
    return `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Salvez sau actualizez sesiunea campaniei
  const saveCampaignSession = useCallback(async (sessionData: {
    agentId: string;
    phoneId?: string;
    status: 'active' | 'paused' | 'stopped' | 'completed';
    totalContacts: number;
    currentProgress: number;
    currentContactName?: string;
    callStatuses: CallStatus[];
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('campaign_sessions')
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          agent_id: sessionData.agentId,
          phone_id: sessionData.phoneId,
          status: sessionData.status,
          total_contacts: sessionData.totalContacts,
          current_progress: sessionData.currentProgress,
          current_contact_name: sessionData.currentContactName,
          call_statuses: JSON.stringify(sessionData.callStatuses),
          completed_at: sessionData.status === 'completed' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) {
        console.error('Eroare la salvarea sesiunii campaniei:', error);
        return false;
      }

      console.log('✅ Sesiune campanie salvată:', data);
      return true;
    } catch (error) {
      console.error('Eroare la salvarea sesiunii campaniei:', error);
      return false;
    }
  }, [user, sessionId]);

  // Încarc sesiunea campaniei existentă
  const loadCampaignSession = useCallback(async () => {
    if (!user || !sessionId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('campaign_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error) {
        console.error('Eroare la încărcarea sesiunii campaniei:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const session: CampaignSession = {
          id: data.id,
          sessionId: data.session_id,
          agentId: data.agent_id,
          phoneId: data.phone_id,
          status: data.status as 'active' | 'paused' | 'stopped' | 'completed',
          totalContacts: data.total_contacts,
          currentProgress: data.current_progress,
          currentContactName: data.current_contact_name,
          callStatuses: typeof data.call_statuses === 'string' 
            ? JSON.parse(data.call_statuses) 
            : (Array.isArray(data.call_statuses) ? data.call_statuses : []),
          startedAt: data.started_at,
          updatedAt: data.updated_at
        };

        setCampaignSession(session);
        console.log('✅ Sesiune campanie încărcată:', session);
      }
    } catch (error) {
      console.error('Eroare la încărcarea sesiunii campaniei:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId]);

  // Șterg sesiunea campaniei
  const deleteCampaignSession = useCallback(async () => {
    if (!user || !sessionId) return false;

    try {
      const { error } = await supabase
        .from('campaign_sessions')
        .delete()
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Eroare la ștergerea sesiunii campaniei:', error);
        return false;
      }

      setCampaignSession(null);
      console.log('✅ Sesiune campanie ștearsă');
      return true;
    } catch (error) {
      console.error('Eroare la ștergerea sesiunii campaniei:', error);
      return false;
    }
  }, [user, sessionId]);

  // Mă abonez la actualizări în timp real
  const subscribeToUpdates = useCallback(() => {
    if (!user || !sessionId || isSubscribed) return;

    console.log('🔄 Abonare la actualizări realtime pentru sesiunea:', sessionId);

    const channel = supabase
      .channel(`campaign_session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaign_sessions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📡 Actualizare realtime sesiune campanie:', payload);
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const data = payload.new;
            if (data.session_id === sessionId) {
              const session: CampaignSession = {
                id: data.id,
                sessionId: data.session_id,
                agentId: data.agent_id,
                phoneId: data.phone_id,
                status: data.status as 'active' | 'paused' | 'stopped' | 'completed',
                totalContacts: data.total_contacts,
                currentProgress: data.current_progress,
                currentContactName: data.current_contact_name,
                callStatuses: typeof data.call_statuses === 'string' 
                  ? JSON.parse(data.call_statuses) 
                  : (Array.isArray(data.call_statuses) ? data.call_statuses : []),
                startedAt: data.started_at,
                updatedAt: data.updated_at
              };
              setCampaignSession(session);
            }
          } else if (payload.eventType === 'DELETE') {
            if (payload.old?.session_id === sessionId) {
              setCampaignSession(null);
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
  }, [user, sessionId, isSubscribed]);

  // Încarc sesiunea la mount și mă abonez la actualizări
  useEffect(() => {
    loadCampaignSession();
    const unsubscribe = subscribeToUpdates();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadCampaignSession, subscribeToUpdates]);

  return {
    campaignSession,
    isLoading,
    saveCampaignSession,
    loadCampaignSession,
    deleteCampaignSession,
    generateSessionId
  };
};