
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone } from 'lucide-react';
import { useConversation } from '@11labs/react';
import { toast } from '@/components/ui/use-toast';

interface VoiceTestButtonProps {
  agentId: string;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

const VoiceTestButton: React.FC<VoiceTestButtonProps> = ({ agentId, onSpeakingChange }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      setIsConnecting(false);
      setIsActive(true);
      toast({
        title: "Conectat!",
        description: "Poți vorbi acum cu agentul",
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
      setIsActive(false);
      setIsConnecting(false);
      toast({
        title: "Deconectat",
        description: "Conversația s-a încheiat",
      });
    },
    onMessage: (message) => {
      console.log('Message received:', message);
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setIsActive(false);
      setIsConnecting(false);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la conectarea cu agentul",
        variant: "destructive",
      });
    }
  });

  // Monitor speaking state
  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(conversation.isSpeaking || false);
    }
  }, [conversation.isSpeaking, onSpeakingChange]);

  const handleToggleConversation = async () => {
    if (!agentId) {
      toast({
        title: "Eroare",
        description: "ID-ul agentului nu este disponibil",
        variant: "destructive",
      });
      return;
    }

    if (isActive) {
      // Stop conversation
      try {
        await conversation.endSession();
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
    } else {
      // Start conversation
      setIsConnecting(true);
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Start session with agent ID
        await conversation.startSession({ agentId });
      } catch (error) {
        console.error('Error starting conversation:', error);
        setIsConnecting(false);
        toast({
          title: "Eroare",
          description: "Nu s-a putut iniția conversația. Verifică permisiunile microfonului.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated background circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer circle - animated when speaking */}
        <div 
          className={`absolute w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400 transition-all duration-300 ${
            conversation.isSpeaking 
              ? 'animate-spin opacity-80 scale-110' 
              : isActive 
                ? 'animate-pulse opacity-60' 
                : 'opacity-40'
          }`}
        />
        
        {/* Middle circle */}
        <div 
          className={`absolute w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 transition-all duration-300 ${
            conversation.isSpeaking 
              ? 'animate-pulse opacity-70 scale-105' 
              : isActive 
                ? 'opacity-50' 
                : 'opacity-30'
          }`}
        />
        
        {/* Inner circle */}
        <div 
          className={`absolute w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 transition-all duration-300 ${
            conversation.isSpeaking 
              ? 'animate-bounce opacity-90' 
              : isActive 
                ? 'opacity-70' 
                : 'opacity-50'
          }`}
        />
      </div>

      {/* Main button */}
      <Button
        onClick={handleToggleConversation}
        disabled={isConnecting}
        className={`relative z-10 w-20 h-20 rounded-full transition-all duration-300 ${
          isActive
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110'
            : 'bg-black hover:bg-gray-800 text-white shadow-lg'
        }`}
      >
        {isConnecting ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isActive ? (
          <MicOff className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </Button>

      {/* Status indicator */}
      {isActive && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="px-3 py-1 bg-black/80 text-white text-xs rounded-full">
            {conversation.isSpeaking ? 'Agentul vorbește...' : 'Ascultă...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceTestButton;
