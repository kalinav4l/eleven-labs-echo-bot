import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CachedConversation {
  id: string;
  user_id: string;
  conversation_id: string;
  agent_id?: string;
  agent_name?: string;
  phone_number?: string;
  contact_name?: string;
  call_status?: string;
  duration_seconds: number;
  cost_credits: number;
  transcript?: any;
  metadata?: any;
  analysis?: any;
  call_date?: string;
  created_at: string;
  updated_at: string;
}

interface ConversationData {
  duration: number;
  cost: number;
  transcript?: any;
  metadata?: any;
  analysis?: any;
}

export const useCachedConversations = () => {
  const [cachedConversations, setCachedConversations] = useState<CachedConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load cached conversations from Supabase
  const loadCachedConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_analytics_cache')
        .select('*')
        .order('call_date', { ascending: false });

      if (error) throw error;
      setCachedConversations(data || []);
    } catch (error) {
      console.error('Error loading cached conversations:', error);
    }
  };

  // Get conversation data from cache or API
  const getConversationData = async (conversationId: string): Promise<ConversationData> => {
    // First check if it's in cache
    const cached = cachedConversations.find(c => c.conversation_id === conversationId);
    if (cached) {
      return {
        duration: cached.duration_seconds,
        cost: cached.cost_credits,
        transcript: cached.transcript,
        metadata: cached.metadata,
        analysis: cached.analysis
      };
    }

    // If not in cache, fetch from ElevenLabs API
    try {
      const { data } = await supabase.functions.invoke('get-elevenlabs-conversation', {
        body: { conversationId }
      });

      if (data?.metadata) {
        const duration = Math.round(data.metadata.call_duration_secs || 0);
        const cost = data.metadata.cost || 0;
        
        return {
          duration,
          cost,
          transcript: data.transcript,
          metadata: data.metadata,
          analysis: data.analysis
        };
      }
    } catch (error) {
      console.error('Error fetching conversation from API:', error);
    }

    return { duration: 0, cost: 0 };
  };

  // Save all conversations to cache
  const saveAllConversationsToCache = async (callHistory: any[]) => {
    setIsSaving(true);
    let savedCount = 0;
    let skippedCount = 0;

    try {
      toast({
        title: "Salvare în progres",
        description: "Se salvează conversațiile în cache..."
      });

      for (const call of callHistory) {
        if (!call.conversation_id) continue;

        // Check if already cached
        const existsInCache = cachedConversations.find(c => c.conversation_id === call.conversation_id);
        if (existsInCache) {
          skippedCount++;
          continue;
        }

        try {
          // Fetch conversation data from ElevenLabs
          const { data } = await supabase.functions.invoke('get-elevenlabs-conversation', {
            body: { conversationId: call.conversation_id }
          });

          if (data) {
            const duration = Math.round(data.metadata?.call_duration_secs || 0);
            const cost = data.metadata?.cost || 0;

            // Save to cache
            const { error } = await supabase
              .from('conversation_analytics_cache')
              .upsert({
                conversation_id: call.conversation_id,
                agent_id: call.agent_id,
                agent_name: call.agent_name,
                phone_number: call.phone_number,
                contact_name: call.contact_name,
                call_status: call.call_status,
                duration_seconds: duration,
                cost_credits: cost,
                transcript: data.transcript,
                metadata: data.metadata,
                analysis: data.analysis,
                call_date: call.call_date,
                user_id: (await supabase.auth.getUser()).data.user?.id
              });

            if (!error) {
              savedCount++;
            }
          }
        } catch (error) {
          console.error(`Error saving conversation ${call.conversation_id}:`, error);
        }
      }

      // Reload cached conversations
      await loadCachedConversations();

      toast({
        title: "Salvare completă",
        description: `${savedCount} conversații salvate, ${skippedCount} erau deja în cache.`
      });

    } catch (error) {
      console.error('Error saving conversations:', error);
      toast({
        title: "Eroare la salvare",
        description: "A apărut o eroare la salvarea conversațiilor.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Get conversation data efficiently (cache first, then API)
  const getConversationDataBatch = async (conversationIds: string[]) => {
    const results: Record<string, ConversationData> = {};
    const uncachedIds: string[] = [];

    // First, get data from cache
    conversationIds.forEach(id => {
      const cached = cachedConversations.find(c => c.conversation_id === id);
      if (cached) {
        results[id] = {
          duration: cached.duration_seconds,
          cost: cached.cost_credits,
          transcript: cached.transcript,
          metadata: cached.metadata,
          analysis: cached.analysis
        };
      } else {
        uncachedIds.push(id);
      }
    });

    // Then fetch uncached ones from API
    for (const id of uncachedIds) {
      const data = await getConversationData(id);
      results[id] = data;
    }

    return results;
  };

  useEffect(() => {
    loadCachedConversations();
  }, []);

  return {
    cachedConversations,
    isLoading,
    isSaving,
    getConversationData,
    getConversationDataBatch,
    saveAllConversationsToCache,
    loadCachedConversations
  };
};