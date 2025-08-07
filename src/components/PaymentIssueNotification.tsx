import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, CreditCard } from 'lucide-react';

type NotificationType = 'payment_method' | 'low_balance' | 'no_balance';

interface PaymentIssueNotificationProps {
  notificationType: NotificationType | null;
  spentAmount?: number;
  remainingBalance?: number;
  onDismiss?: () => void;
}

export const PaymentIssueNotification: React.FC<PaymentIssueNotificationProps> = ({ 
  notificationType,
  spentAmount = 0,
  remainingBalance = 0,
  onDismiss 
}) => {
  if (!notificationType) return null;

  const getNotificationContent = () => {
    switch (notificationType) {
      case 'low_balance':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          subtextColor: 'text-amber-700',
          buttonColor: 'bg-amber-600 hover:bg-amber-700',
          title: `Balanță scăzută: $${remainingBalance.toFixed(2)} rămase`,
          subtitle: `Ai mai puțin de $100 în cont. Recomandăm să adaugi credite pentru a evita întreruperea serviciilor.`,
          buttonText: 'Adaugă Credite'
        };
      
      case 'no_balance':
        return {
          icon: <CreditCard className="h-5 w-5 text-red-600 flex-shrink-0" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          subtextColor: 'text-red-700',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          title: 'Ai epuizat toate creditele disponibile',
          subtitle: 'Pentru a continua să utilizezi serviciile, trebuie să adaugi credite în cont.',
          buttonText: 'Adaugă Credite Urgent'
        };
      
      default: // payment_method
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />,
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-800',
          subtextColor: 'text-amber-700',
          buttonColor: 'bg-amber-600 hover:bg-amber-700',
          title: 'Metoda de plată stabilită pentru abonamentul tău Plus nu poate fi debitată',
          subtitle: 'Pentru moment, îți menținem accesul activ. Pentru a putea continua să utilizezi Plus, actualizează-ți detaliile de plată.',
          buttonText: 'Actualizează'
        };
    }
  };

  const content = getNotificationContent();

  const handleAction = () => {
    if (notificationType === 'payment_method') {
      window.location.href = '/account';
    } else {
      window.location.href = '/pricing';
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${content.bgColor} border-b ${content.borderColor} p-3`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          {content.icon}
          <div className="flex-1">
            <p className={`text-sm ${content.textColor} font-medium`}>
              {content.title}
            </p>
            <p className={`text-xs ${content.subtextColor} mt-1`}>
              {content.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button 
            onClick={handleAction}
            size="sm"
            className={`${content.buttonColor} text-white border-0 h-8 px-3 text-sm font-medium`}
          >
            {content.buttonText}
          </Button>
          {onDismiss && (
            <Button 
              onClick={onDismiss}
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 ${content.textColor.replace('text-', 'text-').replace('-800', '-600')} hover:${content.bgColor.replace('bg-', 'bg-').replace('-50', '-100')}`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};