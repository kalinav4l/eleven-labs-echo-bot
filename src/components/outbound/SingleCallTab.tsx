
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Loader2 } from 'lucide-react';

interface SingleCallTabProps {
  contactName: string;
  setContactName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  handleSingleCall: () => void;
  agentId: string;
  isInitiating: boolean;
}

export const SingleCallTab: React.FC<SingleCallTabProps> = ({
  contactName,
  setContactName,
  phoneNumber,
  setPhoneNumber,
  handleSingleCall,
  agentId,
  isInitiating,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Apel Individual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="contact-name" className="text-gray-900">
            Nume Contact (opțional)
          </Label>
          <Input
            id="contact-name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Numele persoanei"
            className="bg-white border-gray-300 text-gray-900"
          />
        </div>

        <div>
          <Label htmlFor="phone-number" className="text-gray-900">
            Număr de Telefon *
          </Label>
          <Input
            id="phone-number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+40712345678"
            className="bg-white border-gray-300 text-gray-900 font-mono"
          />
        </div>

        <Button
          onClick={handleSingleCall}
          disabled={!agentId.trim() || !phoneNumber.trim() || isInitiating}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white"
        >
          {isInitiating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Se Inițiază Apel...
            </>
          ) : (
            <>
              <Phone className="w-4 h-4 mr-2" />
              Inițiază Apel
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
