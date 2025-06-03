
import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

interface EmbedWidgetProps {
  agentId: string;
}

const EmbedWidget: React.FC<EmbedWidgetProps> = ({ agentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const agents = {
    'agent_01jwryy4w5e8fsta9v9j304zzq': { name: 'Borea', greeting: 'Salut! Sunt Borea, asistentul tău AI. Cum te pot ajuta?' },
    'VfDh7pN17jYNykYNZrJb': { name: 'Jesica', greeting: 'Bună! Sunt Jesica. Cu ce te pot ajuta astăzi?' },
    'agent_01jws2mjsjeh398vfnfd6k5hq0': { name: 'Ana', greeting: 'Salut! Sunt Ana, gata să te ajut cu orice întrebare ai.' }
  };

  const currentAgent = agents[agentId as keyof typeof agents] || agents['agent_01jwryy4w5e8fsta9v9j304zzq'];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        text: currentAgent.greeting,
        isUser: false
      }]);
    }
  }, [isOpen, messages.length, currentAgent.greeting]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Simulez un răspuns pentru demo - în realitate aici ai face call la API
      setTimeout(() => {
        const botResponse = {
          id: (Date.now() + 1).toString(),
          text: `Mulțumesc pentru mesaj! Sunt ${currentAgent.name} și încerc să te ajut cât mai bine. Aceasta este o versiune demo a widget-ului nostru.`,
          isUser: false
        };
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-white border-2 border-black rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3"
        >
          <img 
            src="/lovable-uploads/9d53b287-27b3-41d4-b4fb-90d03129d994.png" 
            alt="Speek Logo" 
            className="w-8 h-8"
          />
          <span className="text-black font-medium">Need help?</span>
        </button>
      ) : (
        <div className="bg-white border-2 border-black rounded-lg shadow-xl w-80 h-96 flex flex-col">
          {/* Header */}
          <div className="bg-black text-white p-4 rounded-t-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/9d53b287-27b3-41d4-b4fb-90d03129d994.png" 
                alt="Speek Logo" 
                className="w-6 h-6"
              />
              <span className="font-medium">{currentAgent.name}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg text-sm ${
                    message.isUser
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-black border border-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-black border border-gray-200 p-3 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Scrie mesajul tău..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbedWidget;
