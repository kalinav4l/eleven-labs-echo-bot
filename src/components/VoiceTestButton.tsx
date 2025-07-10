
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
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Simple central circle with subtle animation */}
      <div className="relative">
        {isActive && (
          <div 
            className={`absolute -inset-8 rounded-full border border-muted-foreground/20 transition-all duration-1000 ${
              conversation.isSpeaking ? 'scale-110 opacity-30' : 'scale-100 opacity-10'
            }`}
          />
        )}
        
        <Button
          onClick={handleToggleConversation}
          disabled={isConnecting}
          variant={isActive ? "destructive" : "default"}
          size="lg"
          className="h-16 w-16 rounded-full relative transition-all duration-300 hover:scale-105"
        >
          {getButtonIcon()}
        </Button>
      </div>

      {/* Minimal status text */}
      <div className="text-sm text-muted-foreground">
        {getButtonText()}
      </div>
    </div>
  );
};

export default VoiceTestButton;
