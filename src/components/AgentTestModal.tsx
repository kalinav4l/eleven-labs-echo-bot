
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Save } from 'lucide-react';
import { useConversation } from '@11labs/react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface AgentTestModalProps {
  agent: any;
  isOpen: boolean;
  onClose: () => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
}

const AgentTestModal: React.FC<AgentTestModalProps> = ({ 
  agent, 
  isOpen, 
  onClose, 
  onSpeakingChange 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to agent:', agent?.name);
    },
    onDisconnect: () => {
      console.log('Disconnected from agent');
      setIsListening(false);
      onSpeakingChange?.(false);
    },
    onMessage: (message) => {
      if (message.message) {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: message.message,
          isUser: message.source === 'user',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Update speaking state based on message source
        if (message.source !== 'user') {
          onSpeakingChange?.(true);
          // Stop speaking animation after a delay (simulating speech duration)
          setTimeout(() => {
            onSpeakingChange?.(false);
          }, message.message.length * 50); // Rough estimation of speech duration
        }
      }
    },
    onError: (error) => {
      console.error('Conversation error:', error);
      setIsListening(false);
      onSpeakingChange?.(false);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartConversation = async () => {
    if (!agent) return;
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId: agent.id });
      setIsListening(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleEndConversation = async () => {
    try {
      await conversation.endSession();
      setIsListening(false);
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response using GPT
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: { message: inputText, agentName: agent?.name }
      });

      if (!error && data?.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
    }
  };

  const handleSaveConversation = async () => {
    if (messages.length === 0 || !user || !agent) return;

    setIsSaving(true);
    try {
      const conversationText = messages.map(msg => 
        `${msg.isUser ? 'User' : agent.name}: ${msg.text}`
      ).join('\n\n');

      const title = `Test cu ${agent.name} - ${new Date().toLocaleDateString('ro-RO')}`;

      const { error } = await supabase.functions.invoke('save-conversation', {
        body: {
          title,
          content: conversationText,
          agentName: agent.name,
          messageCount: messages.length
        }
      });

      if (!error) {
        console.log('Conversation saved successfully');
        // Show success message
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isListening) {
      handleEndConversation();
    }
    setMessages([]);
    onClose();
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-black">Test Agent: {agent.name}</DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded p-4 mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-600">
              <p>Începe o conversație cu {agent.name}</p>
              <p className="text-sm mt-2">Folosește microfonul sau scrie un mesaj</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block max-w-xs p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-black'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString('ro-RO', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Controls */}
        <div className="flex items-center justify-center mb-4">
          {!isListening ? (
            <Button
              onClick={handleStartConversation}
              className="bg-black hover:bg-gray-800 text-white rounded-full w-12 h-12"
            >
              <Mic className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={handleEndConversation}
              className="bg-gray-600 hover:bg-gray-700 text-white rounded-full w-12 h-12"
            >
              <MicOff className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Text Input */}
        <div className="flex space-x-2 mb-4">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Scrie un mesaj..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
          />
          <Button
            onClick={handleSendText}
            disabled={!inputText.trim()}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            onClick={handleSaveConversation}
            disabled={messages.length === 0 || isSaving}
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvează...' : 'Salvează Conversația'}
          </Button>
          <Button onClick={handleClose} variant="outline">
            Închide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentTestModal;
