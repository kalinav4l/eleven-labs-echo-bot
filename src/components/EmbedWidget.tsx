import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Phone, X, Send, Mic, MicOff } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface EmbedWidgetProps {
  agentId: string;
  agentName?: string;
}

const EmbedWidget: React.FC<EmbedWidgetProps> = ({ agentId, agentName = "Agent AI" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const addMessage = (text: string, isUser: boolean) => {
    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    addMessage(text, true);
    setInputText('');
    setIsLoading(true);

    try {
      console.log('Sending message to chat API...', { agentId, agentName, message: text });
      
      const response = await fetch('https://pwfczzxwjfxomqzhhwvj.functions.supabase.co/chat-with-gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          agentName: agentName,
          agentId: agentId
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Eroare API: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.response) {
        addMessage(data.response, false);
      } else if (data.error) {
        addMessage(`Eroare: ${data.error}`, false);
      } else {
        addMessage('Nu am primit un răspuns valid de la server.', false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Conexiunea cu serverul a eșuat. Verifică conexiunea la internet și încearcă din nou.', false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (isListening) {
      setIsListening(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsListening(true);
        // Demo - oprește după 3 secunde
        setTimeout(() => {
          setIsListening(false);
          addMessage("Funcția vocală este în dezvoltare.", true);
        }, 3000);
      } catch (error) {
        console.error('Microphone access denied:', error);
        alert('Pentru funcția vocală, te rog să permiți accesul la microfon.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  if (!isOpen) {
    return (
      <div 
        className="fixed bottom-5 right-5 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3 z-50 font-sans hover:scale-105 transition-transform cursor-pointer border border-gray-200"
        onClick={() => setIsOpen(true)}
      >
        <img 
          src="https://ik.imagekit.io/2eeuoo797/Group%2064.png?updatedAt=1748951277306" 
          alt="Speek Logo" 
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex flex-col text-sm">
          <strong className="text-black">Ai nevoie de ajutor?</strong>
          <span className="text-gray-600 text-xs">Vorbește cu {agentName}</span>
        </div>
        <Button className="bg-black hover:bg-gray-800 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-2">
          <Phone className="w-4 h-4" />
          Start apel
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50 font-sans">
      {/* Header */}
      <div className="bg-black text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="https://ik.imagekit.io/2eeuoo797/Group%2064.png?updatedAt=1748951277306" 
            alt="Speek Logo" 
            className="w-6 h-6 rounded-full"
          />
          <span className="font-medium">Chat cu {agentName}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-gray-800 p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Începe o conversație cu {agentName}</p>
            <p className="text-sm mt-1">Scrie un mesaj pentru a începe</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.isUser
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-gray-200'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-black border border-gray-200 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Voice Button */}
      <div className="px-4 py-2 border-t border-gray-200 flex justify-center">
        <Button
          onClick={handleVoiceToggle}
          disabled={isLoading}
          className={`w-12 h-12 rounded-full ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
              : 'bg-black hover:bg-gray-800'
          } text-white`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Scrie un mesaj..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!inputText.trim() || isLoading}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmbedWidget;
