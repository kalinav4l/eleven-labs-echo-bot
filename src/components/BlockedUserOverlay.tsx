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
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-100 border-b-2 border-amber-300 p-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="text-amber-600 font-bold text-lg">⚠️</div>
          <div>
            <p className="font-semibold text-amber-800">Cont Restricționat</p>
            <p className="text-sm text-amber-700">Unele funcționalități sunt limitate. Contactează suportul pentru detalii.</p>
          </div>
        </div>
        <Button 
          onClick={handleSupport}
          variant="outline"
          size="sm"
          className="border-amber-300 text-amber-700 hover:bg-amber-50"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Suport
        </Button>
      </div>
    </div>
  );
};