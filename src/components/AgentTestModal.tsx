
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Save, X } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    onClose();
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[700px] flex flex-col bg-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-black text-xl">Test Agent: {agent.name}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-1 gap-6">
          {/* Left side - Voice Interface */}
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Conversație Vocală</h3>
              <p className="text-gray-600">Vorbește direct cu agentul folosind microfonul</p>
            </div>
            
            <div className="mb-8">
              <VoiceTestButton 
                agentId={agent.agent_id || agent.id}
                onSpeakingChange={setIsSpeaking}
              />
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">
                {isSpeaking ? 'Agentul vorbește...' : 'Apasă butonul pentru a începe'}
              </p>
              <p className="text-xs text-gray-400">
                Agent ID: {agent.agent_id || agent.id}
              </p>
            </div>
          </div>

          {/* Right side - Text Chat */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chat Text</h3>
              <p className="text-sm text-gray-600">Alternativă de comunicare prin text</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-white">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 h-full flex items-center justify-center">
                  <div>
                    <p>Începe o conversație text cu {agent.name}</p>
                    <p className="text-sm mt-2">Sau folosește interfața vocală din stânga</p>
                  </div>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentTestModal;
