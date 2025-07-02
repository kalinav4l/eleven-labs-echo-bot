
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Save, X, MessageSquare, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthContext';
import VoiceTestButton from './VoiceTestButton';

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
}

const AgentTestModal: React.FC<AgentTestModalProps> = ({ agent, isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleVoiceTranscription = (message: Message) => {
    console.log('📝 Transcripție nouă:', message);
    setMessages(prev => [...prev, message]);
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
        console.log('Conversația a fost salvată cu succes');
        handleClose();
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setIsTextMode(false);
    onClose();
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-xl font-medium text-gray-800">
                Test Agent: {agent.name}
              </DialogTitle>
              <p className="text-sm text-gray-500">Testează funcționalitatea agentului tău</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-1">
          {/* Left side - Voice Interface */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100 mr-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-medium text-gray-800 mb-2">Conversație Vocală</h3>
              <p className="text-gray-500 text-sm">Vorbește direct cu agentul folosind vocea</p>
            </div>
            
            <div className="mb-8">
              <VoiceTestButton 
                agentId={agent.agent_id || agent.id}
                agentName={agent.name}
                onSpeakingChange={setIsSpeaking}
                onTranscription={handleVoiceTranscription}
              />
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 font-medium">
                {isSpeaking ? '🔊 Agentul vorbește...' : '🎤 Apasă pentru a începe'}
              </p>
            </div>
            
            {/* Mode toggle */}
            <div className="mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTextMode(!isTextMode)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {isTextMode ? 'Ascunde Chat Text' : 'Afișează Chat Text'}
              </Button>
            </div>
          </div>

          {/* Right side - Text Chat (conditional) */}
          {isTextMode && (
            <div className="flex-1 flex flex-col">
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 mb-4 border border-gray-100">
                <h3 className="text-lg font-medium text-gray-800 mb-1">Chat Text</h3>
                <p className="text-sm text-gray-500">Conversație suplimentară prin text</p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl p-4 mb-4 bg-white/50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 h-full flex items-center justify-center">
                    <div>
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium">Nicio conversație încă</p>
                      <p className="text-xs mt-1">Mesajele vocale și text vor apărea aici</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
                    >
                      <div
                        className={`inline-block max-w-xs p-3 rounded-2xl ${
                          message.isUser
                            ? 'bg-accent text-white shadow-md'
                            : 'bg-gray-100 text-gray-800 shadow-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.text}</p>
                        <p className="text-xs opacity-60 mt-1">
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

              {/* Text Input */}
              <div className="flex space-x-3 mb-4">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Scrie un mesaj..."
                  className="flex-1 border-gray-200 rounded-xl bg-white/80 focus:bg-white transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                />
                <Button
                  onClick={handleSendText}
                  disabled={!inputText.trim()}
                  className="bg-accent hover:bg-accent/90 text-white rounded-xl px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-400">
            Agent ID: {agent.agent_id || agent.id}
          </div>
          <div className="flex gap-3">
            {messages.length > 0 && (
              <Button
                onClick={handleSaveConversation}
                disabled={isSaving}
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvează...' : 'Salvează Test'}
              </Button>
            )}
            <Button 
              onClick={handleClose} 
              variant="outline"
              className="border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl"
            >
              Închide
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentTestModal;
