
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
      console.error('❌ Tip eroare:', typeof error === 'object' && error ? (error as any).name : 'N/A');
      console.error('❌ Detalii eroare:', typeof error === 'object' && error ? (error as any).message : error);
      console.error('❌ Stack trace:', typeof error === 'object' && error ? (error as any).stack : 'N/A');
      setIsActive(false);
      setIsConnecting(false);
      
      let errorMessage = "A apărut o eroare la conectarea cu agentul.";
      
      const errorString = typeof error === 'string' ? error : (typeof error === 'object' && error ? (error as any).message : '');
      
      if (errorString?.includes('microphone') || errorString?.includes('permission')) {
        errorMessage = "Agentul nu poate accesa microfonul. Verifică permisiunile browserului și agentului.";
      } else if (errorString?.includes('agent')) {
        errorMessage = "Agentul nu este disponibil sau configurarea este incorectă.";
      } else if (errorString?.includes('network') || errorString?.includes('connection')) {
        errorMessage = "Problemă de conexiune. Verifică internetul.";
      }
      
      toast({
        title: "Eroare",
        description: errorMessage,
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
        
        // Check if HTTPS is required
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          throw new Error('HTTPS este necesar pentru acces la microfon');
        }
        
        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Browserul nu suportă accesul la microfon');
        }
        
        console.log('🔍 Verific permisiunile...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 24000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        console.log('✅ Microfon obținut cu succes:', stream);
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        
         setHasPermission(true);
         console.log('🟢 Încep conversația cu agentul:', agentId);
         console.log('🔧 Verific dacă agentul există și este activ...');
         
         // Verifică dacă agentId este valid
         if (!agentId.startsWith('agent_')) {
           throw new Error('ID agent invalid: ' + agentId);
         }
         
         const sessionId = await conversation.startSession({ agentId });
         setCurrentConversationId(sessionId);
         console.log('📞 Conversație inițiată cu ID:', sessionId);
      } catch (error) {
        console.error('❌ Eroare detaliată la pornirea conversației:', error);
        console.error('❌ Tip eroare:', error.name);
        console.error('❌ Mesaj eroare:', error.message);
        setIsConnecting(false);
        setHasPermission(false);
        
        let errorMessage = "Pentru a testa agentul vocal, trebuie să permiți accesul la microfon.";
        
        if (error.name === 'NotAllowedError') {
          errorMessage = "Accesul la microfon a fost refuzat. Te rog permite accesul din setările browserului.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "Nu s-a găsit niciun microfon. Verifică că ai un microfon conectat.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Browserul nu suportă accesul la microfon.";
        } else if (error.message.includes('HTTPS')) {
          errorMessage = "Site-ul trebuie să fie pe HTTPS pentru acces la microfon.";
        }
        
        toast({
          title: "Eroare acces microfon",
          description: errorMessage,
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
