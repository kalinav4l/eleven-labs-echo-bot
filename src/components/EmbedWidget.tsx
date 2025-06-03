
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
    // Demonstrativ - în realitate se deschide modal-ul de chat
    console.log(`Starting chat with agent: ${agentId}`);
  };

  return (
    <div className="fixed bottom-5 right-5 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3 z-50 font-sans hover:scale-105 transition-transform cursor-pointer">
      <img 
        src="https://ik.imagekit.io/2eeuoo797/Group%2064.png?updatedAt=1748951277306" 
        alt="Speek Logo" 
        className="w-8 h-8 rounded-full object-cover"
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
