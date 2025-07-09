import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  User, 
  Send, 
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  inputMessage: string;
  isLoading: boolean;
  selectedModel: string;
  selectedAgent: Agent | null;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  inputMessage,
  isLoading,
  selectedModel,
  selectedAgent,
  onInputChange,
  onSendMessage,
  onKeyPress,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Asistent AI - Chat cu RAG</h2>
              <p className="text-sm text-muted-foreground">
                {selectedAgent 
                  ? `Conversație RAG cu ${selectedAgent.name} - răspunsuri bazate pe documentele procesate cu AI` 
                  : 'Creează un agent și încarcă documente pentru răspunsuri specifice bazate pe conținutul tău'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedModel}</Badge>
            {selectedAgent && (
              <Badge variant="outline">{selectedAgent.name}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col h-[calc(100%-120px)]">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.type === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`p-2 rounded-full ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className={`flex flex-col max-w-[70%] ${
                  message.type === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-muted">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Gândesc...</span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Input
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={selectedAgent ? `Scrie un mesaj pentru ${selectedAgent.name}...` : "Scrie mesajul tău aici..."}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={onSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};