import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Upload, Download, ArrowLeft } from 'lucide-react';
import { BatchCallData } from '@/hooks/useBatchCalling';
import { usePhoneNumbers } from '@/hooks/usePhoneNumbers';
import { useKalinaAgents } from '@/hooks/useKalinaAgents';
import { toast } from '@/hooks/use-toast';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BatchCallData) => Promise<void>;
}

interface Recipient {
  phone_number: string;
  name?: string;
  language?: string;
  voice_id?: string;
  first_message?: string;
  prompt?: string;
  city?: string;
  other_dyn_variable?: string;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [callName, setCallName] = useState('Untitled Batch');
  const [agentId, setAgentId] = useState('');
  const [agentPhoneId, setAgentPhoneId] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timing, setTiming] = useState('immediate');

  // Fetch data
  const { phoneNumbers, isLoading: phoneLoading } = usePhoneNumbers();
  const { agents, isLoading: agentsLoading } = useKalinaAgents();

  const addRecipient = () => {
    setRecipients([...recipients, { phone_number: '', name: '', language: 'en' }]);
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
      console.log('📝 Form data before processing:', {
        callName,
        agentId,
        agentPhoneId,
        recipients: recipients.filter(r => r.phone_number.trim())
      });

      const validRecipients = recipients.filter(r => r.phone_number.trim());
      
      if (validRecipients.length === 0) {
        toast({
          title: "Eroare",
          description: "Trebuie să adaugi cel puțin un destinatar valid",
          variant: "destructive"
        });
        return;
      }

      if (!agentId || !agentPhoneId) {
        toast({
          title: "Eroare",
          description: "Selectează agentul și numărul de telefon",
          variant: "destructive"
        });
        return;
      }

      const formattedRecipients = validRecipients.map(r => ({
        phone_number: r.phone_number.trim(),
        conversation_initiation_client_data: {
          user_id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          conversation_config_override: {
            ...(r.voice_id && {
              tts: { voice_id: r.voice_id }
            }),
            ...(r.first_message && {
              agent: {
                first_message: r.first_message,
                language: r.language || 'en',
                ...(r.prompt && {
                  prompt: { prompt: r.prompt }
                })
              }
            })
          },
          dynamic_variables: {
            name: r.name || 'Client',
            city: r.city || '',
            ...(r.other_dyn_variable && { other: r.other_dyn_variable })
          }
        }
      }));

      console.log('📤 Sending to API:', {
        call_name: callName,
        agent_id: agentId,
        agent_phone_id: agentPhoneId,
        recipients: formattedRecipients
      });

      await onSubmit({
        call_name: callName,
        agent_id: agentId,
        agent_phone_id: agentPhoneId,
        recipients: formattedRecipients
      });

      // Reset form
      setCallName('Untitled Batch');
      setAgentId('');
      setAgentPhoneId('');
      setRecipients([]);
    } catch (error) {
      console.error('Error submitting batch call:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "Fișier prea mare",
        description: "Fișierul nu poate depăși 25MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    const allowedTypes = ['.csv', '.xls', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Format invalid",
        description: "Doar fișierele CSV și Excel sunt acceptate",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Fișier invalid",
            description: "Fișierul trebuie să conțină header și cel puțin o linie de date",
            variant: "destructive"
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const phoneIndex = headers.findIndex(h => h.includes('phone_number'));
        const nameIndex = headers.findIndex(h => h.includes('name'));
        const languageIndex = headers.findIndex(h => h.includes('language'));
        const voiceIdIndex = headers.findIndex(h => h.includes('voice_id'));
        const firstMessageIndex = headers.findIndex(h => h.includes('first_message'));
        const promptIndex = headers.findIndex(h => h.includes('prompt'));
        const cityIndex = headers.findIndex(h => h.includes('city'));
        const otherVarIndex = headers.findIndex(h => h.includes('other_dyn_variable'));
        
        if (phoneIndex === -1) {
          toast({
            title: "Coloană lipsă",
            description: "CSV-ul trebuie să conțină o coloană 'phone_number'",
            variant: "destructive"
          });
          return;
        }

        const csvRecipients = lines.slice(1)
          .map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            return {
              phone_number: values[phoneIndex] || '',
              name: nameIndex >= 0 ? values[nameIndex] || '' : '',
              language: languageIndex >= 0 ? values[languageIndex] || 'en' : 'en',
              voice_id: voiceIdIndex >= 0 ? values[voiceIdIndex] || '' : '',
              first_message: firstMessageIndex >= 0 ? values[firstMessageIndex] || '' : '',
              prompt: promptIndex >= 0 ? values[promptIndex] || '' : '',
              city: cityIndex >= 0 ? values[cityIndex] || '' : '',
              other_dyn_variable: otherVarIndex >= 0 ? values[otherVarIndex] || '' : ''
            };
          })
          .filter(r => r.phone_number.trim());

        if (csvRecipients.length === 0) {
          toast({
            title: "Niciun destinatar valid",
            description: "Nu s-au găsit numere de telefon valide în fișier",
            variant: "destructive"
          });
          return;
        }

        setRecipients(csvRecipients);
        toast({
          title: "Succes",
          description: `S-au încărcat ${csvRecipients.length} destinatari`,
        });
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast({
          title: "Eroare la procesare",
          description: "Nu s-a putut procesa fișierul. Verificați formatul.",
          variant: "destructive"
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "Eroare la citire",
        description: "Nu s-a putut citi fișierul",
        variant: "destructive"
      });
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const headers = ['phone_number', 'name', 'language', 'voice_id', 'first_message', 'prompt', 'city', 'other_dyn_variable'];
    const csvContent = headers.join(',') + '\n+123456789,John Doe,en,,Hello John,You are a helpful assistant,London,';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_call_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center space-y-0 pb-4">
          <Button variant="ghost" size="sm" onClick={onClose} className="mr-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <DialogTitle className="text-xl font-semibold">Create a batch call</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Batch name */}
          <div>
            <Label htmlFor="callName" className="text-sm font-medium">Batch name</Label>
            <Input
              id="callName"
              value={callName}
              onChange={(e) => setCallName(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <Label className="text-sm font-medium">Phone Number</Label>
            <Select value={agentPhoneId} onValueChange={setAgentPhoneId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a phone number" />
              </SelectTrigger>
              <SelectContent>
                {phoneLoading ? (
                  <SelectItem value="" disabled>Se încarcă...</SelectItem>
                ) : phoneNumbers.length === 0 ? (
                  <SelectItem value="" disabled>Nu există numere de telefon</SelectItem>
                ) : (
                  phoneNumbers.map((phone) => (
                    <SelectItem key={phone.id} value={phone.elevenlabs_phone_id || phone.id}>
                      {phone.label} ({phone.phone_number})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Select Agent */}
          <div>
            <Label className="text-sm font-medium">Select Agent</Label>
            <Select value={agentId} onValueChange={setAgentId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agentsLoading ? (
                  <SelectItem value="" disabled>Se încarcă...</SelectItem>
                ) : agents.length === 0 ? (
                  <SelectItem value="" disabled>Nu există agenți</SelectItem>
                ) : (
                  agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.elevenlabs_agent_id || agent.agent_id}>
                      {agent.name}
                      {agent.description && (
                        <span className="text-muted-foreground"> - {agent.description}</span>
                      )}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Recipients Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">Recipients</Label>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>25.0 MB</span>
                <span className="px-2 py-1 bg-muted rounded text-xs">CSV</span>
                <span className="px-2 py-1 bg-muted rounded text-xs">XLS</span>
              </div>
            </div>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleCSVUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </span>
                </Button>
              </label>
            </div>

            {/* Formatting info */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Formatting</h4>
              <p className="text-sm text-muted-foreground mb-2">
                The <strong>phone_number</strong> column is required. You can also pass certain{' '}
                <strong>overrides</strong>. Any other columns will be passed as dynamic variables.
              </p>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={downloadTemplate}
                className="mt-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>

            {/* Recipients table */}
            {recipients.length > 0 && recipients[0].phone_number && (
              <div className="mt-4 border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 grid grid-cols-3 gap-4 font-medium text-sm">
                  <div>name</div>
                  <div>phone_number</div>
                  <div>language</div>
                </div>
                {recipients.slice(0, 3).map((recipient, index) => (
                  <div key={index} className="px-4 py-2 grid grid-cols-3 gap-4 border-t text-sm">
                    <div>{recipient.name || '-'}</div>
                    <div>{recipient.phone_number}</div>
                    <div>{recipient.language || 'en'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timing */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Timing</Label>
            <Tabs value={timing} onValueChange={setTiming} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="immediate" className="flex-1">Send immediately</TabsTrigger>
                <TabsTrigger value="scheduled" className="flex-1">Schedule for later</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline">
              Test call
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !callName || !agentId || !agentPhoneId || recipients.filter(r => r.phone_number.trim()).length === 0}
              className="bg-black text-white hover:bg-black/90"
            >
              {isSubmitting ? 'Processing...' : 'Submit a Batch Call'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};