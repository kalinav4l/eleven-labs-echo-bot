
import React, { useState } from 'react';
import { useConversation } from '@11labs/react';
import { cn } from '@/utils/utils.ts';

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
      {/* Main Circle with Liquid Glass Effect */}
      <div 
        className="relative cursor-pointer group"
        onClick={handleStartConversation}
      >
        {/* Outer Ring with Liquid Glass */}
        <div 
          className={cn(
            "w-64 h-64 rounded-full border transition-all duration-700 flex items-center justify-center relative overflow-hidden",
            "bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl",
            isActive || isConnected
              ? "shadow-teal-400/30 border-teal-400/30" 
              : "hover:shadow-white/20 hover:border-white/30"
          )}
          style={{
            background: isActive || isConnected 
              ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(20,184,166,0.1) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
          }}
        >
          {/* Glass reflection effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60" />
          
          {/* Inner Circle with Enhanced Glass Effect */}
          <div 
            className={cn(
              "w-44 h-44 rounded-full border transition-all duration-500 flex items-center justify-center relative overflow-hidden",
              "bg-white/15 backdrop-blur-lg border-white/25 shadow-lg",
              isActive || isConnected
                ? "border-teal-300/40 shadow-teal-300/20" 
                : "border-white/25"
            )}
            style={{
              background: isActive || isConnected 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(20,184,166,0.08) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)'
            }}
          >
            {/* Inner glass reflection */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50" />
            
            {/* Center Content */}
            <div className="text-center relative z-10">
              <div className={cn(
                "text-lg font-semibold transition-colors duration-300 mb-2",
                isActive || isConnected ? "text-teal-700" : "text-gray-700"
              )}>
                {isSpeaking ? "SPEAKING" : (isConnected ? "LISTENING" : "CLICK TO START")}
              </div>
              {!isConnected && (
                <div className="text-sm text-gray-500">
                  Click to disconnect
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Animated glow effects when active */}
        {(isActive || isConnected) && (
          <>
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-64 h-64 rounded-full bg-gradient-to-r from-teal-400/20 to-cyan-400/20 blur-xl animate-pulse" />
            
            {/* Speaking pulse effect */}
            {isSpeaking && (
              <div className="absolute inset-0 w-64 h-64 rounded-full border-2 border-teal-400/40 animate-ping" />
            )}
          </>
        )}

        {/* Floating particles when active */}
        {(isActive || isConnected) && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-teal-400/60 rounded-full animate-pulse"
                style={{
                  top: `${50 + 35 * Math.sin((i * Math.PI) / 3)}%`,
                  left: `${50 + 35 * Math.cos((i * Math.PI) / 3)}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAgentInterface;
