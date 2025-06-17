
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Globe, Edit } from 'lucide-react';

interface Step1Props {
  websiteUrl: string;
  setWebsiteUrl: (url: string) => void;
  agentRole: string;
  setAgentRole: (role: string) => void;
  additionalPrompt: string;
  setAdditionalPrompt: (prompt: string) => void;
  generatedPrompt: string;
  setGeneratedPrompt: (prompt: string) => void;
  onGeneratePrompt: () => void;
  onNextStep: () => void;
  isGenerating: boolean;
}

export const Step1PromptGeneration: React.FC<Step1Props> = ({
  websiteUrl,
  setWebsiteUrl,
  agentRole,
  setAgentRole,
  additionalPrompt,
  setAdditionalPrompt,
  generatedPrompt,
  setGeneratedPrompt,
  onGeneratePrompt,
  onNextStep,
  isGenerating,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const canProceed = generatedPrompt.trim() !== '';

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Globe className="w-5 h-5 text-accent" />
          Pas 1: Generare Prompt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="website-url" className="text-foreground">
            URL Site Web
          </Label>
          <Input
            id="website-url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="glass-input"
          />
        </div>

        <div>
          <Label htmlFor="agent-role" className="text-foreground">
            Rolul Agentului
          </Label>
          <Select value={agentRole} onValueChange={setAgentRole}>
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="Alege rolul agentului" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200">
              <SelectItem value="consultant">Consultant</SelectItem>
              <SelectItem value="vinzator">Vânzător</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="additional-prompt" className="text-foreground">
            Instrucțiuni Adiționale (opțional)
          </Label>
          <Input
            id="additional-prompt"
            value={additionalPrompt}
            onChange={(e) => setAdditionalPrompt(e.target.value)}
            placeholder="De exemplu: Atrage atenția că în următoarele 3 luni avem reducere 30%"
            className="glass-input"
          />
        </div>

        <Button
          onClick={onGeneratePrompt}
          disabled={!websiteUrl || !agentRole || isGenerating}
          className="bg-foreground text-background hover:bg-foreground/90 w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Se Generează Prompt
            </>
          ) : (
            'Generează Prompt'
          )}
        </Button>

        {generatedPrompt && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">Prompt Generat</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Previzualizare' : 'Editează'}
              </Button>
            </div>
            
            {isEditing ? (
              <Textarea
                value={generatedPrompt}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
                className="glass-input min-h-[200px]"
                placeholder="Editează promptul aici..."
              />
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm text-foreground">
                  {generatedPrompt}
                </pre>
              </div>
            )}
          </div>
        )}

        {canProceed && (
          <Button
            onClick={onNextStep}
            className="bg-accent text-white hover:bg-accent/90 w-full mt-4"
          >
            Continuă la Pasul 2
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
