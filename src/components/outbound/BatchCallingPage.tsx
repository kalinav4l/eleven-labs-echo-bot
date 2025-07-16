import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Phone, 
  Upload, 
  Download, 
  Clock, 
  Calendar,
  FileText,
  Users,
  Play,
  Check,
  X,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useUserPhoneNumbers } from '@/hooks/useUserPhoneNumbers';

interface BatchCall {
  id: string;
  name: string;
  agent_name: string;
  phone_number: string;
  recipients_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  created_at: string;
}

interface Recipient {
  phone_number: string;
  name: string;
  language: string;
  city?: string;
  status?: 'pending' | 'calling' | 'completed' | 'failed';
}

interface BatchCallingPageProps {
  onBack?: () => void;
}

export const BatchCallingPage: React.FC<BatchCallingPageProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'details'>('list');
  const [batchCalls, setBatchCalls] = useState<BatchCall[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchCall | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  
  // Form state
  const [batchName, setBatchName] = useState('Untitled Batch');
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [timing, setTiming] = useState<'immediate' | 'scheduled'>('immediate');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { data: agents = [] } = useUserAgents();
  const { data: phoneNumbers = [] } = useUserPhoneNumbers();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('nume'));
      const phoneIndex = headers.findIndex(h => h.includes('phone') || h.includes('telefon'));
      const languageIndex = headers.findIndex(h => h.includes('language') || h.includes('limba'));
      const cityIndex = headers.findIndex(h => h.includes('city') || h.includes('oras'));

      if (phoneIndex === -1) {
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "CSV-ul trebuie să conțină o coloană pentru telefon"
        });
        return;
      }

      const parsedRecipients = lines.slice(1).map((line) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return {
          phone_number: values[phoneIndex] || '',
          name: nameIndex >= 0 ? values[nameIndex] || 'Unknown' : 'Unknown',
          language: languageIndex >= 0 ? values[languageIndex] || 'en' : 'en',
          city: cityIndex >= 0 ? values[cityIndex] || '' : '',
          status: 'pending' as const
        };
      }).filter(recipient => recipient.phone_number);

      setRecipients(parsedRecipients);
      toast({
        title: "Succes",
        description: `S-au încărcat ${parsedRecipients.length} recipients`
      });
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'name,phone_number,language\nNev,+3838310429,en\nAntoni,+3838310429,pl\nThor,+3838310429,de';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_call_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmitBatch = () => {
    if (!selectedPhoneNumber || !selectedAgent || recipients.length === 0) {
      toast({
        variant: "destructive",
        title: "Eroare",
        description: "Completează toate câmpurile și încarcă recipients"
      });
      return;
    }
    setShowTermsModal(true);
  };

  const confirmSubmitBatch = () => {
    if (!termsAccepted) {
      toast({
        variant: "destructive", 
        title: "Eroare",
        description: "Trebuie să accepți termenii și condițiile"
      });
      return;
    }

    const newBatch: BatchCall = {
      id: Math.random().toString(36).substr(2, 9),
      name: batchName,
      agent_name: agents.find(a => a.elevenlabs_agent_id === selectedAgent)?.name || 'Unknown Agent',
      phone_number: selectedPhoneNumber,
      recipients_count: recipients.length,
      status: 'completed',
      progress: 100,
      created_at: new Date().toISOString()
    };

    setBatchCalls([newBatch, ...batchCalls]);
    setShowTermsModal(false);
    setCurrentView('list');
    
    // Reset form
    setBatchName('Untitled Batch');
    setSelectedPhoneNumber('');
    setSelectedAgent('');
    setRecipients([]);
    setTermsAccepted(false);

    toast({
      title: "Batch Call Creat",
      description: "Batch call-ul a fost submis cu succes"
    });
  };

  const renderListView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Batch Calling</h1>
        <Button 
          onClick={() => setCurrentView('create')}
          className="bg-black text-white hover:bg-black/90"
        >
          Create a batch call
        </Button>
      </div>

      <div className="relative">
        <Input
          placeholder="Search Batch Calls..."
          className="pl-4 pr-4 py-3 w-full max-w-md"
        />
      </div>

      {batchCalls.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Phone className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No batch calls found</h3>
          <p className="text-muted-foreground mb-6">You have not created any batch calls yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {batchCalls.map((batch) => (
            <Card 
              key={batch.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedBatch(batch);
                setCurrentView('details');
              }}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{batch.name}</h3>
                    <p className="text-muted-foreground">{batch.recipients_count} recipients</p>
                    <p className="text-sm text-muted-foreground">{batch.agent_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{batch.progress}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setCurrentView('list')}
          className="p-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold">Create a batch call</h1>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div>
            <Label htmlFor="batch-name">Batch name</Label>
            <Input
              id="batch-name"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Select value={selectedPhoneNumber} onValueChange={setSelectedPhoneNumber}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a phone number" />
              </SelectTrigger>
              <SelectContent>
                {phoneNumbers.map((phone) => (
                  <SelectItem key={phone.id} value={phone.phone_number}>
                    {phone.label} ({phone.phone_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Select Agent</Label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.elevenlabs_agent_id || agent.agent_id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Recipients</Label>
              <div className="text-sm text-muted-foreground">25.0 MB CSV XLS</div>
            </div>
            
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-4"
              >
                Upload
              </Button>
              <p className="text-sm text-muted-foreground">Upload a CSV to start adding recipients to this batch call</p>
            </div>

            <div className="mt-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Formatting</span>
                <p className="text-sm text-muted-foreground mt-1">
                  The <span className="font-mono">phone_number</span> column is required. You can also pass certain <span className="font-mono">overrides</span>. Any other columns will be passed as dynamic variables.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="mt-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Timing</Label>
            <div className="flex gap-2">
              <Button
                variant={timing === 'immediate' ? 'default' : 'outline'}
                onClick={() => setTiming('immediate')}
                className={timing === 'immediate' ? 'bg-black text-white' : ''}
              >
                Send immediately
              </Button>
              <Button
                variant={timing === 'scheduled' ? 'default' : 'outline'}
                onClick={() => setTiming('scheduled')}
              >
                Schedule for later
              </Button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline">Test call</Button>
            <Button 
              onClick={handleSubmitBatch}
              className="bg-black text-white hover:bg-black/90"
            >
              Submit a Batch Call
            </Button>
          </div>
        </div>

        {/* Right Column - Recipients Preview */}
        <div>
          {recipients.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No recipients yet</h3>
              <p className="text-sm text-muted-foreground">Upload a CSV to start adding recipients to this batch call</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded border border-red-200">
                <span className="text-sm">
                  The following requested overrides are not enabled: Language, Voice_id, First_message, System prompt. Please enable them in the agent settings, or remove the corresponding columns and upload again.
                </span>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted/50 p-3 border-b">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Phone
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Override
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Dynamic Variable
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Dynamic Variable
                    </div>
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {recipients.slice(0, 5).map((recipient, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-3 border-b text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{recipient.phone_number}</span>
                        <Badge variant="outline" className="text-xs">
                          {recipient.language}
                        </Badge>
                      </div>
                      <div>--</div>
                      <div>{recipient.city || '--'}</div>
                      <div>--</div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Showing first 5 of {recipients.length} recipients
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDetailsView = () => {
    if (!selectedBatch) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setCurrentView('list')}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="text-sm text-muted-foreground">Batch Calling / {selectedBatch.name}</div>
              <h1 className="text-2xl font-semibold">{selectedBatch.name}</h1>
              <Badge variant="outline" className="mt-1">{selectedBatch.agent_name}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-red-600">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="outline">
              Retry
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-600">Completed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Total recipients</div>
                <div className="text-xl font-bold mt-1">{selectedBatch.recipients_count}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Started</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-sm">acum 18 secunde</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Progress</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Phone className="h-3 w-3" />
                  <span className="font-bold">{selectedBatch.progress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Call Recipients</h3>
          <Card>
            <CardContent className="p-0">
              <div className="bg-muted/50 p-3 border-b">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Override
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Dynamic Variable
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Status
                  </div>
                </div>
              </div>
              <div className="divide-y">
                <div className="grid grid-cols-5 gap-4 p-3 text-sm">
                  <div className="font-mono">+1 234 567 8900</div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">en</Badge>
                  </div>
                  <div>London</div>
                  <div>
                    <Badge variant="destructive" className="text-xs">
                      <X className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-4 p-3 text-sm">
                  <div className="font-mono">+48 517 067 931</div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">pl</Badge>
                  </div>
                  <div>Warsaw</div>
                  <div>
                    <Badge variant="destructive" className="text-xs">
                      <X className="h-3 w-3 mr-1" />
                      Failed
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentView === 'list' && renderListView()}
        {currentView === 'create' && renderCreateView()}
        {currentView === 'details' && renderDetailsView()}
      </motion.div>

      {/* Terms and Conditions Modal */}
      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Batch Call Terms and Conditions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To continue, please review and agree to the terms and conditions outlined below.
            </p>
            <div className="p-4 bg-muted/50 rounded text-sm">
              <p>
                By proceeding, you confirm that you have obtained all legally required 
                consents for outbound calls you place through this Service, and that you have 
                provided all legally required disclosures related to automated or AI-generated 
                voice calls. You are solely responsible for ensuring compliance with all 
                applicable laws, regulations, and industry standards, such as the TCPA, in 
                connection with your use of this Service. You can learn more about the TCPA 
                here.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <label htmlFor="terms" className="text-sm">
                By checking this box, I confirm that I have read and agree to the above terms and conditions.
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTermsModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmSubmitBatch}
                className="bg-black text-white hover:bg-black/90"
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};