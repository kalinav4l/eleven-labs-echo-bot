import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface BlockedUserOverlayProps {
  isBlocked: boolean;
}

export const BlockedUserOverlay: React.FC<BlockedUserOverlayProps> = ({ isBlocked }) => {
  if (!isBlocked) return null;

  const handleSupport = () => {
    // Open support - you can implement email, chat, etc.
    window.location.href = 'mailto:support@kalina.ai?subject=Cont Blocat - Solicita Suport';
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-red-600 flex items-center justify-center">
      {/* Support Button in corner */}
      <div className="absolute top-6 right-6">
        <Button 
          onClick={handleSupport}
          className="bg-white text-red-600 hover:bg-gray-100 font-semibold"
          size="lg"
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Suport
        </Button>
      </div>

      {/* Main Block Message */}
      <div className="text-center">
        <h1 className="text-white text-[120px] md:text-[200px] font-black tracking-wider mb-8">
          BLOCK
        </h1>
        <div className="text-white text-xl md:text-2xl max-w-2xl mx-auto px-6">
          <p className="mb-4 font-semibold">
            Contul tău a fost suspendat temporar.
          </p>
          <p className="text-lg opacity-90">
            Pentru mai multe informații sau pentru a contesta această decizie, te rugăm să contactezi echipa de suport.
          </p>
        </div>
      </div>
    </div>
  );
};