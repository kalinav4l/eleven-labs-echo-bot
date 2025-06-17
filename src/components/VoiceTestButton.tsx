
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useConversation } from '@11labs/react';
import { toast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface VoiceTestButtonProps {
  agentId: string;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onTranscription?: (message: Message) => void;
}

const VoiceTestButton: React.FC<VoiceTestButtonProps> = ({ 
  agentId, 
  onSpeakingChange, 
  onTranscription 
}) => {
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
      
      // Handle different message types
      if (message.type === 'user_transcript') {
        // User speaking
        const userMessage: Message = {
          id: Date.now().toString() + '_user',
          text: message.message || message.text || '',
          isUser: true,
          timestamp: new Date()
        };
        console.log('User transcript:', userMessage);
        onTranscription?.(userMessage);
      } else if (message.type === 'agent_response' || message.type === 'agent_transcript') {
        // Agent speaking
        const agentMessage: Message = {
          id: Date.now().toString() + '_agent',
          text: message.message || message.text || '',
          isUser: false,
          timestamp: new Date()
        };
        console.log('Agent transcript:', agentMessage);
        onTranscription?.(agentMessage);
      } else if (message.message || message.text) {
        // Fallback for any message with text content
        const fallbackMessage: Message = {
          id: Date.now().toString() + '_fallback',
          text: message.message || message.text,
          isUser: false, // Default to agent
          timestamp: new Date()
        };
        console.log('Fallback transcript:', fallbackMessage);
        onTranscription?.(fallbackMessage);
      }
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
        {/* Outer circle */}
        <div 
          className={`absolute w-40 h-40 rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-teal-400/20 transition-all duration-500 ${
            conversation.isSpeaking 
              ? 'animate-spin opacity-80 scale-110' 
              : isActive 
                ? 'animate-pulse opacity-60' 
                : 'opacity-30'
          }`}
        />
        
        {/* Middle circle */}
        <div 
          className={`absolute w-28 h-28 rounded-full bg-gradient-to-br from-blue-400/30 via-cyan-500/30 to-blue-600/30 transition-all duration-400 ${
            conversation.isSpeaking 
              ? 'animate-pulse opacity-70 scale-105' 
              : isActive 
                ? 'opacity-50' 
                : 'opacity-25'
          }`}
        />
        
        {/* Inner circle */}
        <div 
          className={`absolute w-20 h-20 rounded-full bg-gradient-to-br from-teal-400/40 via-cyan-400/40 to-blue-500/40 transition-all duration-300 ${
            conversation.isSpeaking 
              ? 'animate-bounce opacity-90' 
              : isActive 
                ? 'opacity-70' 
                : 'opacity-40'
          }`}
        />
      </div>

      {/* Main button */}
      <Button
        onClick={handleToggleConversation}
        disabled={isConnecting}
        className={`relative z-10 w-24 h-24 rounded-full transition-all duration-300 border-2 ${
          isActive
            ? 'bg-red-500 hover:bg-red-600 border-red-400 text-white shadow-xl scale-105'
            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {isConnecting ? (
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isActive ? (
          <MicOff className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </Button>

      {/* Status indicator */}
      {isActive && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="px-4 py-2 bg-black/90 text-white text-xs rounded-full backdrop-blur-sm">
            {conversation.isSpeaking ? 'Agentul vorbește...' : 'Ascultă...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceTestButton;
