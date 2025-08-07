import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface PaymentIssueNotificationProps {
  hasPaymentIssue: boolean;
  onDismiss?: () => void;
}

export const PaymentIssueNotification: React.FC<PaymentIssueNotificationProps> = ({ 
  hasPaymentIssue, 
  onDismiss 
}) => {
  if (!hasPaymentIssue) return null;

  const handleUpdatePayment = () => {
    // Redirect to account/billing page or customer portal
    window.location.href = '/account';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 p-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-800 font-medium">
              Metoda de plată stabilită pentru abonamentul tău Plus nu poate fi debitată
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Pentru moment, îți menținem accesul activ. Pentru a putea continua să utilizezi Plus, actualizează-ți detaliile de plată.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button 
            onClick={handleUpdatePayment}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white border-0 h-8 px-3 text-sm font-medium"
          >
            Actualizează
          </Button>
          {onDismiss && (
            <Button 
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};