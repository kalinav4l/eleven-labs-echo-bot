
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const agentConfig = {
  name: "NumeleSiteuluiMeu AI", // This will be customized later
  voiceId: "21m00Tcm4TlvDq8ikWAM", // This will be customized later
  welcomeMessage: "Bună! Sunt asistentul tău virtual. Cu ce te pot ajuta azi?"
};

const MyChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 'welcome', text: agentConfig.welcomeMessage, isUser: false }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessageText = inputText;
    setMessages(prev => [...prev, { id: Date.now().toString(), text: userMessageText, isUser: true }]);
    setInputText('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('get-ai-voice-response', {
        body: {
          message: userMessageText,
          agentName: agentConfig.name,
          voiceId: agentConfig.voiceId
        }
      });

      if (error) throw new Error(error.message);

      const { text: aiText, audio: audioDataUrl } = data;

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiText, isUser: false }]);

      const audio = new Audio(audioDataUrl);
      audio.play();

    } catch (err: any) {
      console.error("Error calling Supabase function:", err);
      setMessages(prev => [...prev, { id: 'error', text: 'Oops, a apărut o eroare. Încearcă din nou.', isUser: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Window */}
      <div className={cn(
        "w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 ease-in-out origin-bottom-right",
        isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
      )}>
        {/* Header */}
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center rounded-t-lg">
          <h3 className="font-semibold text-base">{agentConfig.name}</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white transition-opacity"><X size={20} /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex", msg.isUser ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm",
                msg.isUser ? "bg-black text-white" : "bg-gray-200 text-black"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></span>
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" style={{animationDelay: '0.2s'}}></span>
                    <span className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" style={{animationDelay: '0.4s'}}></span>
                  </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t bg-white rounded-b-lg">
          <div className="flex space-x-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Scrie mesajul tău..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading} className="bg-black hover:bg-gray-700">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "absolute bottom-0 right-0 w-16 h-16 bg-black text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-700",
          isOpen && "opacity-0 scale-0"
        )}
      >
        <MessageSquare size={24} />
      </button>
    </div>
  );
};

export default MyChatWidget;
