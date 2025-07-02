
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useConversation } from '@11labs/react';
import { toast } from '@/components/ui/use-toast';
import { useConversationTracking } from '@/hooks/useConversationTracking';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface VoiceTestButtonProps {
  agentId: string;
  agentName?: string;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onTranscription?: (message: Message) => void;
}

const VoiceTestButton: React.FC<VoiceTestButtonProps> = ({ 
  agentId, 
  agentName = 'Kalina Agent',
  onSpeakingChange, 
  onTranscription 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationStart, setConversationStart] = useState<Date | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { saveConversation, updateConversation } = useConversationTracking();

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs agent');
      setIsConnecting(false);
      setIsActive(true);
      setConversationStart(new Date());
      toast({
        title: "Conectat!",
        description: "Poți vorbi acum cu agentul",
      });
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs agent');
      handleConversationEnd();
      setIsActive(false);
      setIsConnecting(false);
      toast({
        title: "Deconectat",
        description: "Conversația s-a încheiat",
      });
    },
    onMessage: (message) => {
      console.log('Message received:', message);
      
      if (message.message && typeof message.message === 'string') {
        const transcriptionMessage: Message = {
          id: Date.now().toString() + '_' + message.source,
          text: message.message,
          isUser: message.source === 'user',
          timestamp: new Date()
        };
        
        console.log('Adding transcription:', transcriptionMessage);
        setMessages(prev => [...prev, transcriptionMessage]);
        onTranscription?.(transcriptionMessage);
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

  const handleConversationEnd = async () => {
    if (conversationStart && messages.length > 0) {
      const duration = Math.floor((Date.now() - conversationStart.getTime()) / 1000);
      
      try {
        // Save the conversation to Analytics Hub
        const conversationData = {
          agent_id: agentId,
          agent_name: agentName,
          phone_number: 'Voice Chat',
          contact_name: `Conversație cu ${agentName}`,
          summary: `Conversație vocală cu ${agentName} - ${messages.length} mesaje`,
          duration_seconds: duration,
          cost_usd: 0.05 * (duration / 60), // Estimate cost
          transcript: messages,
          status: 'success' as const,
          conversation_id: currentConversationId,
          elevenlabs_history_id: currentConversationId // This would come from ElevenLabs response
        };

        await saveConversation.mutateAsync(conversationData);
        
        toast({
          title: "Conversație salvată",
          description: "Conversația a fost salvată în Analytics Hub",
        });
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
    
    // Reset state
    setMessages([]);
    setConversationStart(null);
    setCurrentConversationId(null);
  };

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
        const sessionId = await conversation.startSession({ agentId });
        setCurrentConversationId(sessionId);
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
          className={`absolute w-20 h-20 rounded-full bg-gradient-to-br from-gray-400/20 via-gray-500/20 to-gray-400/20 transition-all duration-500 ${
            conversation.isSpeaking 
              ? 'animate-spin opacity-80 scale-110' 
              : isActive 
                ? 'animate-pulse opacity-60' 
                : 'opacity-30'
          }`}
        />
        
        {/* Middle circle */}
        <div 
          className={`absolute w-14 h-14 rounded-full bg-gradient-to-br from-gray-400/30 via-gray-500/30 to-gray-600/30 transition-all duration-400 ${
            conversation.isSpeaking 
              ? 'animate-pulse opacity-70 scale-105' 
              : isActive 
                ? 'opacity-50' 
                : 'opacity-25'
          }`}
        />
        
        {/* Inner circle */}
        <div 
          className={`absolute w-10 h-10 rounded-full bg-gradient-to-br from-gray-400/40 via-gray-400/40 to-gray-500/40 transition-all duration-300 ${
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
        size="sm"
        className={`relative z-10 h-8 px-3 rounded-md transition-all duration-300 border ${
          isActive
            ? 'bg-red-500 hover:bg-red-600 border-red-400 text-white shadow-md'
            : 'bg-black hover:bg-gray-800 border-gray-600 text-white shadow-sm'
        }`}
      >
        {isConnecting ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
        ) : isActive ? (
          <MicOff className="w-3 h-3 mr-1" />
        ) : (
          <Mic className="w-3 h-3 mr-1" />
        )}
        <span className="text-xs font-medium">
          {isConnecting ? 'Conectare...' : isActive ? 'Oprește' : 'Test Agent'}
        </span>
      </Button>

      {/* Status indicator */}
      {isActive && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="px-2 py-1 bg-black/90 text-white text-xs rounded backdrop-blur-sm">
            {conversation.isSpeaking ? 'Agentul vorbește...' : 'Ascultă...'}
          </div>
        </div>
      )}

      {/* Conversation counter */}
      {isActive && messages.length > 0 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="px-2 py-1 bg-gray-700 text-white text-xs rounded">
            {messages.length} mesaje
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceTestButton;
