
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { saveConversation } = useConversationTracking();

  const conversation = useConversation({
    onConnect: () => {
      console.log('✅ Conectat la ElevenLabs agent');
      setIsConnecting(false);
      setIsActive(true);
      setConversationStart(new Date());
      toast({
        title: "Conectat!",
        description: "Poți vorbi acum cu agentul",
      });
    },
    onDisconnect: () => {
      console.log('❌ Deconectat de la ElevenLabs agent');
      handleConversationEnd();
      setIsActive(false);
      setIsConnecting(false);
    },
    onMessage: (message) => {
      console.log('💬 Mesaj primit:', message);
      
      if (message.message && typeof message.message === 'string') {
        const transcriptionMessage: Message = {
          id: Date.now().toString() + '_' + message.source,
          text: message.message,
          isUser: message.source === 'user',
          timestamp: new Date()
        };
        
        console.log('📝 Adaug transcripție:', transcriptionMessage);
        setMessages(prev => [...prev, transcriptionMessage]);
        onTranscription?.(transcriptionMessage);
      }
    },
    onError: (error) => {
      console.error('❌ Eroare conversație:', error);
      setIsActive(false);
      setIsConnecting(false);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la conectarea cu agentul. Verifică permisiunile microfonului.",
        variant: "destructive",
      });
    }
  });

  // Check microphone permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasPermission(result.state === 'granted');
        
        result.onchange = () => {
          setHasPermission(result.state === 'granted');
        };
      } catch (error) {
        console.log('Permission API not supported');
        setHasPermission(null);
      }
    };
    
    checkPermission();
  }, []);

  const handleConversationEnd = async () => {
    if (conversationStart && messages.length > 0) {
      const duration = Math.floor((Date.now() - conversationStart.getTime()) / 1000);
      
      try {
        const conversationData = {
          agent_id: agentId,
          agent_name: agentName,
          phone_number: 'Voice Chat',
          contact_name: `Test vocal cu ${agentName}`,
          summary: `Test vocal cu ${agentName} - ${messages.length} mesaje în ${duration}s`,
          duration_seconds: duration,
          cost_usd: 0.05 * (duration / 60),
          transcript: messages,
          status: 'success' as const,
          conversation_id: currentConversationId,
          elevenlabs_history_id: currentConversationId
        };

        await saveConversation.mutateAsync(conversationData);
        
        toast({
          title: "Conversație salvată",
          description: "Testul vocal a fost salvat în Analytics Hub",
        });
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
    
    setMessages([]);
    setConversationStart(null);
    setCurrentConversationId(null);
  };

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
      try {
        console.log('🔴 Opresc conversația...');
        await conversation.endSession();
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
    } else {
      setIsConnecting(true);
      try {
        console.log('🎤 Cer permisiuni microfon...');
        await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 24000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        setHasPermission(true);
        console.log('🟢 Încep conversația cu agentul:', agentId);
        const sessionId = await conversation.startSession({ agentId });
        setCurrentConversationId(sessionId);
        console.log('📞 Conversație inițiată cu ID:', sessionId);
      } catch (error) {
        console.error('❌ Eroare la pornirea conversației:', error);
        setIsConnecting(false);
        setHasPermission(false);
        toast({
          title: "Eroare acces microfon",
          description: "Pentru a testa agentul vocal, trebuie să permiți accesul la microfon.",
          variant: "destructive",
        });
      }
    }
  };

  const getButtonText = () => {
    if (isConnecting) return 'Conectare...';
    if (isActive) return 'Oprește';
    if (hasPermission === false) return 'Permite Microfon';
    return 'Test Vocal';
  };

  const getButtonIcon = () => {
    if (isConnecting) {
      return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />;
    }
    if (isActive) {
      return <PhoneOff className="w-4 h-4" />;
    }
    if (hasPermission === false) {
      return <MicOff className="w-4 h-4" />;
    }
    return <Phone className="w-4 h-4" />;
  };

  return (
    <div className="relative flex flex-col items-center justify-center space-y-6">
      {/* Enhanced voice visualization with multiple rings */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Outer ring */}
          <div 
            className={`absolute w-48 h-48 rounded-full border border-accent/20 transition-all duration-[2000ms] ${
              conversation.isSpeaking 
                ? 'animate-ping scale-125 opacity-30' 
                : 'scale-100 opacity-10'
            }`}
          />
          {/* Middle ring */}
          <div 
            className={`absolute w-36 h-36 rounded-full border-2 border-accent/30 transition-all duration-1000 ${
              conversation.isSpeaking 
                ? 'animate-pulse scale-110 opacity-50' 
                : 'scale-100 opacity-20'
            }`}
          />
          {/* Inner ring */}
          <div 
            className={`absolute w-24 h-24 rounded-full border-2 border-accent/40 transition-all duration-700 ${
              conversation.isSpeaking 
                ? 'animate-bounce scale-105 opacity-60' 
                : 'scale-100 opacity-30'
            }`}
          />
          {/* Core glow */}
          <div 
            className={`absolute w-20 h-20 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 transition-all duration-500 ${
              conversation.isSpeaking 
                ? 'animate-pulse scale-110 opacity-80 shadow-2xl shadow-accent/30' 
                : 'scale-100 opacity-40'
            }`}
          />
        </div>
      )}

      {/* Main button - larger and more elegant */}
      <Button
        onClick={handleToggleConversation}
        disabled={isConnecting}
        className={`relative z-10 h-20 w-20 rounded-full transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:scale-105 ${
          isActive
            ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-2 border-red-400 text-white shadow-red-500/30'
            : hasPermission === false
              ? 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-2 border-orange-400 text-white shadow-orange-500/30'
              : 'bg-gradient-to-br from-accent to-accent/90 hover:from-accent/90 hover:to-accent border-2 border-accent/30 text-white shadow-accent/30'
        }`}
      >
        <span className="relative z-10">
          {getButtonIcon()}
        </span>
        {/* Inner glow effect */}
        <div className={`absolute inset-1 rounded-full bg-white/10 transition-opacity duration-300 ${
          conversation.isSpeaking ? 'opacity-100' : 'opacity-0'
        }`} />
      </Button>

      {/* Status text with better typography */}
      <div className="text-center space-y-2 max-w-xs">
        <div className={`text-base font-medium transition-colors ${
          isActive ? 'text-accent' : 'text-muted-foreground'
        }`}>
          {getButtonText()}
        </div>
        
        {isActive && (
          <div className="text-sm text-muted-foreground bg-accent/5 px-4 py-2 rounded-full border border-accent/10">
            {conversation.isSpeaking ? '🔊 Agentul vorbește' : '🎤 Te ascult'}
          </div>
        )}
        
        {messages.length > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            {messages.length} mesaje schimbate
          </div>
        )}
      </div>

      {/* Permission helper with better styling */}
      {hasPermission === false && !isActive && (
        <div className="text-sm text-orange-600 text-center max-w-xs bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg">
          Permite accesul la microfon pentru test
        </div>
      )}
    </div>
  );
};

export default VoiceTestButton;
