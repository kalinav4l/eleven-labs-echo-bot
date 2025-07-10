import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserPhoneNumbers } from '@/hooks/useUserPhoneNumbers';
import { Phone, Loader2 } from 'lucide-react';

interface PhoneSelectorProps {
  selectedPhoneId: string;
  onPhoneSelect: (phoneId: string) => void;
}

export const PhoneSelector: React.FC<PhoneSelectorProps> = ({
  selectedPhoneId,
  onPhoneSelect,
}) => {
  const { data: phoneNumbers, isLoading } = useUserPhoneNumbers();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Se încarcă numerele de telefon...</span>
      </div>
    );
  }

  if (!phoneNumbers || phoneNumbers.length === 0) {
    return (
      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        Nu aveți numere de telefon configurate încă. Mergeți la{' '}
        <a href="/account/phone-numbers" className="text-primary hover:underline">
          Numere de Telefon
        </a>{' '}
        pentru a configura primul număr.
      </div>
    );
  }

  return (
    <Select value={selectedPhoneId} onValueChange={onPhoneSelect}>
      <SelectTrigger className="w-full">
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <SelectValue placeholder="Selectează numărul de contact..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        {phoneNumbers.map((phone) => (
          <SelectItem key={phone.id} value={phone.id}>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="font-medium">{phone.label}</span>
                <span className="text-xs text-gray-500">{phone.phone_number}</span>
              </div>
              <div className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                phone.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {phone.status === 'active' ? 'Activ' : 'Inactiv'}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};