
import React, { useState } from 'react';
import { useConversation } from '@11labs/react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Main Agent Circle */}
      <div className="relative">
        {/* Outer Ring - Animated when active */}
        <div 
          className={cn(
            "w-32 h-32 rounded-full border-4 transition-all duration-1000 cursor-pointer",
            isActive 
              ? "border-green-400 shadow-lg shadow-green-400/30 animate-pulse" 
              : "border-gray-400 hover:border-gray-300"
          )}
          onClick={handleStartConversation}
        >
          {/* Inner Circle */}
          <div 
            className={cn(
              "w-full h-full rounded-full flex items-center justify-center transition-all duration-700",
              isActive 
                ? "bg-gradient-to-r from-green-500 to-green-600 shadow-inner" 
                : "bg-gray-500 hover:bg-gray-400"
            )}
          >
            {/* Icon */}
            {isConnected ? (
              isSpeaking ? (
                <Volume2 className="w-12 h-12 text-white animate-bounce" />
              ) : (
                <MicOff className="w-12 h-12 text-white" />
              )
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </div>
        </div>

        {/* Floating Animation Dots when active */}
        {isActive && (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
                style={{
                  top: `${50 + 45 * Math.sin((i * Math.PI) / 3)}%`,
                  left: `${50 + 45 * Math.cos((i * Math.PI) / 3)}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          Asistent AI Virtual
        </h2>
        <p className="text-gray-300 max-w-md">
          {isConnected 
            ? (isSpeaking ? "Vorbesc..." : "Ascult... Spune-mi cum te pot ajuta!")
            : "Apasă pe cercul verde pentru a începe o conversație"
          }
        </p>
        
        {isActive && (
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className={cn(
              "w-3 h-3 rounded-full",
              isConnected ? "bg-green-400 animate-pulse" : "bg-yellow-400 animate-spin"
            )} />
            <span className="text-sm text-gray-400">
              {isConnected ? "Conectat" : "Se conectează..."}
            </span>
          </div>
        )}
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-12">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Servicii AI
          </h3>
          <p className="text-gray-300 text-sm">
            Oferim soluții avansate de inteligență artificială pentru afacerea ta.
          </p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Consultanță
          </h3>
          <p className="text-gray-300 text-sm">
            Echipa noastră de experți te poate ghida în implementarea AI.
          </p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Suport 24/7
          </h3>
          <p className="text-gray-300 text-sm">
            Suntem aici să te ajutăm oricând ai nevoie de asistență.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAgentInterface;
