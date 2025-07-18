
import { useCallback, useEffect, useRef } from 'react';
import { useConversationTracking } from './useConversationTracking';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface AutoSaveData {
  conversationId: string;
  agentId: string;
  agentName: string;
  messages: ChatMessage[];
  lastSaveTimestamp: number;
}

export const useAutoSaveConversation = (
  conversationId: string,
  agentId: string,
  agentName: string,
  messages: ChatMessage[],
  isActive: boolean
) => {
  const { saveConversation } = useConversationTracking();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);
  const AUTO_SAVE_INTERVAL = 15 * 60 * 1000; // 15 minutes

  const performAutoSave = useCallback(async () => {
    if (!isActive || messages.length === 0) return;

    const now = Date.now();
    const conversationData = {
      agent_id: agentId,
      agent_name: agentName,
      phone_number: 'Text Chat',
      contact_name: `Chat cu ${agentName}`,
      summary: `Auto-save conversație - ${messages.length} mesaje`,
      duration_seconds: Math.floor((now - (messages[0]?.timestamp.getTime() || now)) / 1000),
      cost_usd: 0.01 * messages.length,
      conversation_id: conversationId,
      transcript: messages.map(msg => ({
        speaker: msg.sender === 'user' ? 'user' : 'agent',
        message: msg.text,
        timestamp: msg.timestamp.toISOString()
      })),
      status: 'active' as const
    };

    try {
      await saveConversation.mutateAsync(conversationData);
      lastSaveRef.current = now;
      
      // Save to localStorage for recovery
      const autoSaveData: AutoSaveData = {
        conversationId,
        agentId,
        agentName,
        messages,
        lastSaveTimestamp: now
      };
      localStorage.setItem(`autosave_${conversationId}`, JSON.stringify(autoSaveData));
      
      console.log('Auto-save completed:', conversationId);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [conversationId, agentId, agentName, messages, isActive, saveConversation]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (isActive) {
      timerRef.current = setTimeout(performAutoSave, AUTO_SAVE_INTERVAL);
    }
  }, [isActive, performAutoSave]);

  // Reset timer when messages change (user activity)
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [messages.length, resetTimer]);

  // Manual save function
  const manualSave = useCallback(() => {
    performAutoSave();
  }, [performAutoSave]);

  // Recovery function
  const recoverConversation = useCallback((): AutoSaveData | null => {
    try {
      const saved = localStorage.getItem(`autosave_${conversationId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Recovery failed:', error);
      return null;
    }
  }, [conversationId]);

  return {
    manualSave,
    recoverConversation,
    lastSaveTimestamp: lastSaveRef.current
  };
};
