import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Upload } from 'lucide-react';
import { BatchCallData } from '@/hooks/useBatchCalling';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BatchCallData) => Promise<void>;
}

interface Recipient {
  phone_number: string;
  name?: string;
  variables?: string;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [callName, setCallName] = useState('');
  const [agentId, setAgentId] = useState('');
  const [agentPhoneId, setAgentPhoneId] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { phone_number: '', name: '', variables: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addRecipient = () => {
    setRecipients([...recipients, { phone_number: '', name: '', variables: '' }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  const updateRecipient = (index: number, field: keyof Recipient, value: string) => {
    const updated = [...recipients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipients(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formattedRecipients = recipients
        .filter(r => r.phone_number.trim())
        .map(r => ({
          phone_number: r.phone_number.trim(),
          conversation_initiation_client_data: {
            user_id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dynamic_variables: r.variables ? JSON.parse(r.variables) : {
              nume: r.name || 'Client',
              produs: 'serviciu'
            }
          }
        }));

      await onSubmit({
        call_name: callName,
        agent_id: agentId,
        agent_phone_id: agentPhoneId,
        recipients: formattedRecipients
      });

      // Reset form
      setCallName('');
      setAgentId('');
      setAgentPhoneId('');
      setRecipients([{ phone_number: '', name: '', variables: '' }]);
    } catch (error) {
      console.error('Error submitting batch call:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('telefon'));
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('nume'));
      
      if (phoneIndex === -1) {
        alert('CSV-ul trebuie să conțină o coloană pentru telefon');
        return;
      }

      const csvRecipients = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return {
          phone_number: values[phoneIndex] || '',
          name: nameIndex >= 0 ? values[nameIndex] || '' : '',
          variables: ''
        };
      }).filter(r => r.phone_number);

      setRecipients(csvRecipients);
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Creează Lot Nou de Apeluri</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="callName">Numele Campaniei</Label>
              <Input
                id="callName"
                value={callName}
                onChange={(e) => setCallName(e.target.value)}
                placeholder="ex: Confirmare comenzi Ianuarie"
                required
              />
            </div>
            <div>
              <Label htmlFor="agentId">Agent ID</Label>
              <Input
                id="agentId"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="ID-ul agentului AI"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="agentPhoneId">Phone Number ID</Label>
            <Input
              id="agentPhoneId"
              value={agentPhoneId}
              onChange={(e) => setAgentPhoneId(e.target.value)}
              placeholder="ID-ul numărului de telefon"
              required
            />
          </div>

          {/* Recipients Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg">Destinatari</Label>
              <div className="flex space-x-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Încarcă CSV
                  </Button>
                </label>
                <Button
                  type="button"
                  onClick={addRecipient}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adaugă
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {recipients.map((recipient, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="col-span-4">
                    <Input
                      placeholder="Număr telefon"
                      value={recipient.phone_number}
                      onChange={(e) => updateRecipient(index, 'phone_number', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="Nume client"
                      value={recipient.name}
                      onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder='{"produs": "laptop"}'
                      value={recipient.variables}
                      onChange={(e) => updateRecipient(index, 'variables', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      onClick={() => removeRecipient(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      disabled={recipients.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline">
              Anulează
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !callName || !agentId || !agentPhoneId || recipients.filter(r => r.phone_number.trim()).length === 0}
            >
              {isSubmitting ? 'Se procesează...' : `Inițiază Lot (${recipients.filter(r => r.phone_number.trim()).length} apeluri)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};