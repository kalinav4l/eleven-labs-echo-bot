import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Brain, Sparkles, History, Copy, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import DashboardLayout from '@/components/DashboardLayout';

interface PromptHistoryItem {
  id: string;
  agent_name: string;
  agent_type: string;
  website_url?: string;
  company_name?: string;
  contact_number?: string;
  domain?: string;
  additional_info?: string;
  generated_prompt: string;
  created_at: string;
}

const AgentPrompts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    agentName: '',
    agentType: '',
    websiteUrl: '',
    companyName: '',
    contactNumber: '',
    domain: '',
    additionalInfo: ''
  });
  
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch prompt history
  const { data: promptHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['prompt-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prompt history:', error);
        return [];
      }

      return data as PromptHistoryItem[];
    },
    enabled: !!user,
  });

  const agentTypes = [
    { value: 'sales', label: 'Agent Vânzări' },
    { value: 'customer_service', label: 'Customer Service' },
    { value: 'lead_qualification', label: 'Calificare Lead-uri' },
    { value: 'appointment_booking', label: 'Programări' },
    { value: 'support', label: 'Suport Tehnic' },
    { value: 'follow_up', label: 'Follow-up' },
  ];

  const domains = [
    { value: 'imobiliare', label: 'Imobiliare' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'health', label: 'Sănătate' },
    { value: 'fitness', label: 'Fitness & Wellness' },
    { value: 'education', label: 'Educație' },
    { value: 'finance', label: 'Financiar' },
    { value: 'technology', label: 'Tehnologie' },
    { value: 'retail', label: 'Retail' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'beauty', label: 'Beauty & Cosmetice' },
    { value: 'construction', label: 'Construcții' },
    { value: 'legal', label: 'Juridic' },
    { value: 'travel', label: 'Turism' },
    { value: 'other', label: 'Altul' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGeneratePrompt = async () => {
    if (!user) {
      toast({
        title: "Eroare",
        description: "Trebuie să fiți autentificat pentru a genera prompt-uri.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agentName || !formData.agentType) {
      toast({
        title: "Eroare",
        description: "Numele agentului și tipul sunt obligatorii.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-agent-prompt', {
        body: {
          ...formData,
          userId: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setGeneratedPrompt(data.prompt);
        queryClient.invalidateQueries({ queryKey: ['prompt-history', user.id] });
        
        toast({
          title: "Succes!",
          description: "Prompt-ul a fost generat cu succes și salvat în istoric.",
        });
      } else {
        throw new Error(data.error || 'Eroare necunoscută');
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Eroare",
        description: `Eroare la generarea prompt-ului: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copiat!",
      description: "Prompt-ul a fost copiat în clipboard.",
    });
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('prompt_history')
        .delete()
        .eq('id', promptId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      queryClient.invalidateQueries({ queryKey: ['prompt-history', user.id] });
      
      toast({
        title: "Șters!",
        description: "Prompt-ul a fost șters din istoric.",
      });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: "Eroare",
        description: "Eroare la ștergerea prompt-ului.",
        variant: "destructive",
      });
    }
  };

  const handleUseHistoryPrompt = (prompt: string) => {
    setGeneratedPrompt(prompt);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acces Restricționat</CardTitle>
            <CardDescription>
              Trebuie să fiți autentificat pentru a accesa generatorul de prompt-uri.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <Brain className="inline-block mr-2 h-8 w-8" />
            Generator Prompt-uri AI
          </h1>
          <p className="text-muted-foreground">
            Creează prompt-uri profesionale pentru agenții conversaționali ElevenLabs
          </p>
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Istoric ({promptHistory?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurare Agent</CardTitle>
                  <CardDescription>
                    Completează informațiile pentru a genera un prompt personalizat
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="agentName">Nume Agent *</Label>
                    <Input
                      id="agentName"
                      value={formData.agentName}
                      onChange={(e) => handleInputChange('agentName', e.target.value)}
                      placeholder="ex: Maria Ionescu"
                    />
                  </div>

                  <div>
                    <Label htmlFor="agentType">Tip Agent *</Label>
                    <Select value={formData.agentType} onValueChange={(value) => handleInputChange('agentType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează tipul agentului" />
                      </SelectTrigger>
                      <SelectContent>
                        {agentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="companyName">Nume Companie</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="ex: SC Example SRL"
                    />
                  </div>

                  <div>
                    <Label htmlFor="domain">Domeniu Activitate</Label>
                    <Select value={formData.domain} onValueChange={(value) => handleInputChange('domain', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează domeniul" />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map((domain) => (
                          <SelectItem key={domain.value} value={domain.value}>
                            {domain.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="websiteUrl">URL Website</Label>
                    <Input
                      id="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      placeholder="https://www.example.ro"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactNumber">Număr Contact</Label>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="ex: 0721234567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Informații Suplimentare</Label>
                    <Textarea
                      id="additionalInfo"
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                      placeholder="Orice informații suplimentare despre companie, servicii, obiective..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={handleGeneratePrompt} 
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Generez prompt-ul...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generează Prompt
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generated Prompt Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Prompt Generat</CardTitle>
                  <CardDescription>
                    Prompt-ul va apărea aici după generare
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedPrompt ? (
                    <div className="space-y-4">
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyPrompt(generatedPrompt)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copiază
                        </Button>
                      </div>
                      <ScrollArea className="h-[500px] w-full border rounded-md p-4">
                        <pre className="whitespace-pre-wrap text-sm font-mono">
                          {generatedPrompt}
                        </pre>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Completează formularul și apasă "Generează Prompt" pentru a crea un prompt personalizat</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Istoric Prompt-uri</CardTitle>
                <CardDescription>
                  Toate prompt-urile generate anterior
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : promptHistory && promptHistory.length > 0 ? (
                  <div className="space-y-4">
                    {promptHistory.map((item) => (
                      <Card key={item.id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{item.agent_name}</CardTitle>
                              <CardDescription>
                                {item.agent_type} • {item.company_name || 'Fără companie'} • {' '}
                                {new Date(item.created_at).toLocaleDateString('ro-RO')}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUseHistoryPrompt(item.generated_prompt)}
                              >
                                Folosește
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyPrompt(item.generated_prompt)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePrompt(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-32 w-full">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {item.generated_prompt.substring(0, 300)}...
                            </p>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Nu aveți încă prompt-uri generate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AgentPrompts;