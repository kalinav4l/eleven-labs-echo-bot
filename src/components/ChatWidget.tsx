
import React, { useState } from 'react';
import { useConversation } from '@11labs/react';
import { cn } from '@/lib/utils';
import { Phone } from 'lucide-react';

const ChatWidget = () => {
  const [isActive, setIsActive] = useState(false);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to chat widget agent');
    },
    onDisconnect: () => {
      console.log('Disconnected from chat widget agent');
      setIsActive(false);
    },
    onMessage: (message) => {
      console.log('Chat widget message received:', message);
    },
    onError: (error) => {
      console.error('Chat widget conversation error:', error);
    }
  });

  const handleStartConversation = async () => {
    if (conversation.status === 'connected') {
      await conversation.endSession();
      setIsActive(false);
    } else {
      try {
        setIsActive(true);
        await conversation.startSession({
          agentId: 'agent_01jwvb1kq9f2wss361kfwj0p5n'
        });
      } catch (error) {
        console.error('Failed to start chat widget conversation:', error);
        setIsActive(false);
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
