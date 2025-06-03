
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone } from 'lucide-react';

interface EmbedWidgetProps {
  agentId: string;
  agentName?: string;
}

const EmbedWidget: React.FC<EmbedWidgetProps> = ({ agentId, agentName = "Agent AI" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const startSpeekCall = () => {
    setIsOpen(true);
    // Aici se poate integra cu sistemul de chat/video
    console.log(`Starting call with agent: ${agentId}`);
  };

  return (
    <div className="fixed bottom-5 right-5 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3 z-50 font-sans">
      <img 
        src="/lovable-uploads/f8295e99-79cd-45f2-ab8e-6b306829413e.png" 
        alt="Speek Logo" 
        className="w-8 h-8 rounded-full"
      />
      <div className="flex flex-col text-sm">
        <strong className="text-black">Ai nevoie de ajutor?</strong>
        <span className="text-gray-600 text-xs">Vorbește cu {agentName}</span>
      </div>
      <Button
        onClick={startSpeekCall}
        className="bg-black hover:bg-gray-800 text-white rounded-lg px-3 py-2 text-sm flex items-center gap-2"
      >
        <Phone className="w-4 h-4" />
        Start apel
      </Button>
    </div>
  );
};

export default EmbedWidget;
