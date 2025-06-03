
import React, { useState } from 'react';
import { useConversation } from '@11labs/react';
import { cn } from '@/lib/utils';

const AIAgentInterface = () => {
  const [isActive, setIsActive] = useState(false);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to AI agent');
    },
    onDisconnect: () => {
      console.log('Disconnected from AI agent');
      setIsActive(false);
    },
    onMessage: (message) => {
      console.log('Message received:', message);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
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
          agentId: 'agent_01jwv84ep3ev38y3bgrk22n2hw'
        });
      } catch (error) {
        console.error('Failed to start conversation:', error);
        setIsActive(false);
      }
    }
  };

  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Main Circle */}
      <div 
        className="relative cursor-pointer"
        onClick={handleStartConversation}
      >
        {/* Outer Ring */}
        <div 
          className={cn(
            "w-48 h-48 rounded-full border-2 transition-all duration-700 flex items-center justify-center",
            isActive || isConnected
              ? "border-green-400 shadow-lg shadow-green-400/30" 
              : "border-gray-600 hover:border-gray-500"
          )}
        >
          {/* Inner Circle */}
          <div 
            className={cn(
              "w-32 h-32 rounded-full border-2 transition-all duration-500 flex items-center justify-center",
              isActive || isConnected
                ? "border-green-400" 
                : "border-gray-600"
            )}
          >
            {/* Center Text */}
            <div className="text-center">
              <div className={cn(
                "text-sm font-medium transition-colors duration-300",
                isActive || isConnected ? "text-green-400" : "text-gray-400"
              )}>
                {isSpeaking ? "SPEAKING" : (isConnected ? "LISTENING" : "CLICK TO START")}
              </div>
              {!isConnected && (
                <div className="text-xs text-gray-500 mt-1">
                  Click to disconnect
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pulsing effect when speaking */}
        {isSpeaking && (
          <div className="absolute inset-0 w-48 h-48 rounded-full border-2 border-green-400 animate-ping opacity-30" />
        )}
      </div>
    </div>
  );
};

export default AIAgentInterface;
