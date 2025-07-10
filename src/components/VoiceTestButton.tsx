
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
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      {/* Large animated button with multiple effects */}
      <div className="relative">
        {/* Outer animated ring */}
        <div 
          className={`absolute -inset-12 rounded-full border-2 transition-all duration-1000 ${
            isActive 
              ? 'border-primary/30 animate-pulse scale-110' 
              : 'border-muted-foreground/10 scale-100'
          }`}
        />
        
        {/* Middle animated ring */}
        <div 
          className={`absolute -inset-8 rounded-full border transition-all duration-700 ${
            isActive 
              ? 'border-primary/40 animate-ping scale-105' 
              : 'border-muted-foreground/5 scale-100'
          }`}
        />
        
        {/* Speaking animation ring */}
        {conversation.isSpeaking && (
          <div className="absolute -inset-16 rounded-full border-2 border-primary/20 animate-pulse" />
        )}
        
        {/* Main large button */}
        <Button
          onClick={handleToggleConversation}
          disabled={isConnecting}
          className={`h-32 w-32 rounded-full relative transition-all duration-500 transform hover:scale-110 active:scale-95 shadow-2xl ${
            isActive
              ? 'bg-gradient-to-br from-destructive via-destructive/90 to-destructive/80 hover:from-destructive/90 hover:to-destructive shadow-destructive/30'
              : isConnecting
                ? 'bg-gradient-to-br from-muted via-muted/90 to-muted/80 animate-pulse'
                : 'bg-gradient-to-br from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:to-primary shadow-primary/30'
          }`}
        >
          {/* Animated background glow */}
          <div 
            className={`absolute inset-2 rounded-full transition-all duration-300 ${
              conversation.isSpeaking 
                ? 'bg-white/20 animate-pulse' 
                : 'bg-white/5'
            }`}
          />
          
          {/* Icon with larger size */}
          <span className="relative z-10 text-white">
            {isConnecting ? (
              <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isActive ? (
              <PhoneOff className="w-8 h-8" />
            ) : hasPermission === false ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Phone className="w-8 h-8" />
            )}
          </span>
        </Button>
      </div>

      {/* Enhanced status text with animations */}
      <div className="text-center space-y-3">
        <div className={`text-lg font-semibold transition-all duration-300 ${
          isActive ? 'text-primary animate-pulse' : 'text-muted-foreground'
        }`}>
          {getButtonText()}
        </div>
        
        {/* Speaking indicator with animation */}
        {isActive && (
          <div className={`text-sm transition-all duration-500 transform ${
            conversation.isSpeaking 
              ? 'text-primary font-medium animate-bounce' 
              : 'text-muted-foreground'
          }`}>
            {conversation.isSpeaking ? '🎤 Agentul vorbește...' : '👂 Te ascult'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceTestButton;
