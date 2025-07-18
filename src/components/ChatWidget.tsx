import React, { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { cn } from '@/utils/utils.ts';
import { Phone } from 'lucide-react';
import { useAutoSaveConversation } from '@/hooks/useAutoSaveConversation';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

const ChatWidget = () => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId] = useState(() => uuidv4());
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to chat widget agent');
      setIsActive(true);
    },
    onDisconnect: () => {
      console.log('Disconnected from chat widget agent');
      setIsActive(false);
      // Perform final save on disconnect
      manualSave();
    },
    onMessage: (message) => {
      console.log('Chat widget message received:', message);
      const newMessage: ChatMessage = {
        id: uuidv4(),
        text: message.message || '',
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
    },
    onError: (error) => {
      console.error('Chat widget conversation error:', error);
    }
  });

  const { manualSave, recoverConversation } = useAutoSaveConversation(
    conversationId,
    'agent_01jwvb1kq9f2wss361kfwj0p5n',
    'Chat Assistant',
    messages,
    isActive
  );

  // Recovery on component mount
  useEffect(() => {
    const recovered = recoverConversation();
    if (recovered && recovered.messages.length > 0) {
      setMessages(recovered.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
      console.log('Recovered conversation:', recovered.conversationId);
    }
  }, [recoverConversation]);

  // Persist conversation state across route changes
  useEffect(() => {
    const savedConversationState = sessionStorage.getItem('chatWidgetActive');
    if (savedConversationState === 'true' && conversation.status !== 'connected') {
      setIsActive(true);
      conversation.startSession({
        agentId: 'agent_01jwvb1kq9f2wss361kfwj0p5n'
      }).catch(error => {
        console.error('Failed to restore chat widget conversation:', error);
        setIsActive(false);
        sessionStorage.removeItem('chatWidgetActive');
      });
    }
  }, []);

  // Save conversation state
  useEffect(() => {
    if (conversation.status === 'connected') {
      sessionStorage.setItem('chatWidgetActive', 'true');
    } else {
      sessionStorage.removeItem('chatWidgetActive');
    }
  }, [conversation.status]);

  // Clean up on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (conversation.status === 'connected') {
        conversation.endSession();
      }
      sessionStorage.removeItem('chatWidgetActive');
      // Perform final save before unload
      manualSave();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [conversation, manualSave]);

  const handleStartConversation = async () => {
    if (conversation.status === 'connected') {
      await conversation.endSession();
      setIsActive(false);
      sessionStorage.removeItem('chatWidgetActive');
      // Final save before ending
      manualSave();
    } else {
      try {
        setIsActive(true);
        await conversation.startSession({
          agentId: 'agent_01jwvb1kq9f2wss361kfwj0p5n'
        });
      } catch (error) {
        console.error('Failed to start chat widget conversation:', error);
        setIsActive(false);
        sessionStorage.removeItem('chatWidgetActive');
      }
    }
  };

  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div className="flex items-center space-x-3">
        {/* Circle Button */}
        <div 
          className="relative cursor-pointer"
          onClick={handleStartConversation}
        >
          {/* Main Circle */}
          <div 
            className={cn(
              "w-14 h-14 rounded-full border-2 transition-all duration-500 flex items-center justify-center bg-white shadow-lg",
              isActive || isConnected
                ? "border-green-500 shadow-green-500/30" 
                : "border-gray-400 hover:border-gray-600"
            )}
          >
            <Phone 
              size={20} 
              className={cn(
                "transition-colors duration-300",
                isActive || isConnected ? "text-green-500" : "text-gray-400"
              )} 
            />
          </div>

          {/* Pulsing effect when speaking */}
          {isSpeaking && (
            <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-green-500 animate-ping opacity-30" />
          )}
        </div>

        {/* Speak Text */}
        <div className={cn(
          "text-sm font-medium transition-colors duration-300",
          isActive || isConnected ? "text-green-500" : "text-gray-600"
        )}>
          Speak
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
