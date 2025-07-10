import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { toast } from '@/hooks/use-toast';
import { Loader2, Phone, Plus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface PhoneNumberData {
  phone_number: string;
  label: string;
}

export default function PhoneNumbers() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PhoneNumberData>({
    phone_number: '',
    label: ''
  });

  const handleInputChange = (field: keyof PhoneNumberData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone_number || !formData.label) {
      toast({
        title: "Eroare",
        description: "Toate câmpurile sunt obligatorii",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/convai/phone-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': 'conv_01jzssz233fw29c0rb1zcfmja7' // You might want to move this to environment variables
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Succes!",
          description: "Numărul de telefon a fost adăugat cu succes",
        });
        
        // Reset form
        setFormData({
          phone_number: '',
          label: ''
        });
      } else {
        throw new Error(result.message || 'A apărut o eroare');
      }
    } catch (error) {
      console.error('Error adding phone number:', error);
      toast({
        title: "Eroare",
        description: error instanceof Error ? error.message : "A apărut o eroare la adăugarea numărului",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Numere de Telefon SIP</h1>
          </div>
          <p className="text-muted-foreground">
            Adaugă un nou număr de telefon SIP pentru agentul conversațional
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adaugă Număr Nou
            </CardTitle>
            <CardDescription>
              Completează informațiile pentru a conecta un număr de telefon SIP la sistemul conversațional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Număr de Telefon *</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    placeholder="+37378123378"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    Format internațional complet (ex: +37378123378)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="label">Etichetă *</Label>
                  <Input
                    id="label"
                    placeholder="Nume descriptiv pentru acest număr"
                    value={formData.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Pentru identificarea ușoară (ex: "Suport Clienți", "Vânzări")
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Se adaugă...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Adaugă Număr
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold mb-3 text-blue-900">Despre SIP Trunk:</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• <strong>SIP Trunk</strong> permite conectarea directă fără configurări complexe</li>
            <li>• Numărul trebuie să fie în format internațional complet (+37378123378)</li>
            <li>• Nu sunt necesare credențiale externe (SID/Token)</li>
            <li>• Conexiunea se face automat prin protocolul SIP</li>
            <li>• Suportă apeluri bidireccționale pentru agentul conversațional</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}