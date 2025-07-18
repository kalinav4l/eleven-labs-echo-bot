
import { useEffect, useRef, useState } from 'react';
import { useConversationTracking } from './useConversationTracking';
import { useAutoSaveConversation } from './useAutoSaveConversation';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface UseChatConversationTrackingProps {
  messages: ChatMessage[];
  agentId: string;
  agentName: string;
  isActive: boolean;
}

export const useChatConversationTracking = ({
  messages,
  agentId,
  agentName,
  isActive
}: UseChatConversationTrackingProps) => {
  const { saveConversation } = useConversationTracking();
  const [conversationId] = useState(() => uuidv4());
  const conversationStartRef = useRef<Date | null>(null);
  const lastMessageCountRef = useRef(0);

  // Use the auto-save hook
  const { manualSave } = useAutoSaveConversation(
    conversationId,
    agentId,
    agentName,
    messages,
    isActive
  );

  // Track conversation start
  useEffect(() => {
    if (isActive && messages.length > 0 && !conversationStartRef.current) {
      conversationStartRef.current = new Date();
      console.log('Conversation started with ID:', conversationId);
    }
  }, [isActive, messages.length, conversationId]);

  // Enhanced save logic - now works with auto-save
  useEffect(() => {
    const shouldSave = 
      messages.length > 0 && 
      messages.length !== lastMessageCountRef.current &&
      conversationStartRef.current &&
      (messages.length % 10 === 0 || !isActive); // Save every 10 messages or when conversation ends

    if (shouldSave) {
      const duration = conversationStartRef.current 
        ? Math.floor((Date.now() - conversationStartRef.current.getTime()) / 1000)
        : 0;

      const transcript = messages.map(msg => ({
        speaker: msg.sender === 'user' ? 'user' : 'agent',
        message: msg.text,
        timestamp: msg.timestamp.toISOString()
      }));

      const conversationData = {
        agent_id: agentId,
        agent_name: agentName,
        phone_number: 'Text Chat',
        contact_name: `Chat cu ${agentName}`,
        summary: `Conversație text cu ${agentName} - ${messages.length} mesaje`,
        duration_seconds: duration,
        cost_usd: 0.01 * messages.length,
        conversation_id: conversationId,
        transcript,
        status: isActive ? 'active' as const : 'success' as const
      };

      saveConversation.mutate(conversationData);
      lastMessageCountRef.current = messages.length;
    }
  }, [messages, isActive, agentId, agentName, saveConversation, conversationId]);

  // Final save when conversation ends
  useEffect(() => {
    if (!isActive && messages.length > 0 && conversationStartRef.current) {
      manualSave();
      console.log('Final save for conversation:', conversationId);
    }
  }, [isActive, messages.length, manualSave, conversationId]);

  // Reset when conversation truly ends
  useEffect(() => {
    if (!isActive && messages.length === 0) {
      conversationStartRef.current = null;
      lastMessageCountRef.current = 0;
    }
  }, [isActive, messages.length]);

  return {
    conversationId,
    manualSave
  };
};
