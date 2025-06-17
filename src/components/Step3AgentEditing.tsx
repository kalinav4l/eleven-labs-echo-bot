
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Upload, FileText, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Step3Props {
  agentIdForEdit: string;
  setAgentIdForEdit: (id: string) => void;
  onNextStep: () => void;
}

interface KnowledgeDocument {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
}

export const Step3AgentEditing: React.FC<Step3Props> = ({
  agentIdForEdit,
  setAgentIdForEdit,
  onNextStep,
}) => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const newDoc: KnowledgeDocument = {
        id: Date.now().toString(),
        name: file.name,
        content,
        uploadedAt: new Date(),
      };
      setDocuments(prev => [...prev, newDoc]);
      toast({
        title: "Succes!",
        description: `Documentul "${file.name}" a fost încărcat cu succes.`,
      });
    };
    reader.readAsText(file);
  };

  const addManualDocument = () => {
    if (!newDocName.trim() || !newDocContent.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează numele și conținutul documentului.",
        variant: "destructive",
      });
      return;
    }

    const newDoc: KnowledgeDocument = {
      id: Date.now().toString(),
      name: newDocName,
      content: newDocContent,
      uploadedAt: new Date(),
    };
    setDocuments(prev => [...prev, newDoc]);
    setNewDocName('');
    setNewDocContent('');
    setIsAddingDoc(false);
    
    toast({
      title: "Succes!",
      description: `Documentul "${newDocName}" a fost adăugat cu succes.`,
    });
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Succes!",
      description: "Documentul a fost șters.",
    });
  };

  const canProceed = agentIdForEdit.trim() !== '';

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Edit className="w-5 h-5 text-accent" />
          Pas 3: Editare Agent și Knowledge Base
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="agent-id-edit" className="text-foreground">
            ID Agent pentru Editare
          </Label>
          <Input
            id="agent-id-edit"
            value={agentIdForEdit}
            onChange={(e) => setAgentIdForEdit(e.target.value)}
            placeholder="Introdu ID-ul agentului"
            className="glass-input"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-medium">Knowledge Base</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingDoc(true)}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Adaugă Manual
              </Button>
              <label className="cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4" />
                    Încarcă Fișier
                  </span>
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {isAddingDoc && (
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <Input
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Numele documentului"
                className="glass-input"
              />
              <Textarea
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                placeholder="Conținutul documentului..."
                className="glass-input min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button onClick={addManualDocument} size="sm">
                  Adaugă
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingDoc(false)}
                >
                  Anulează
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {documents.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nu ai adăugat încă documente în Knowledge Base.
                <br />
                Adaugă documente pentru a îmbunătăți răspunsurile agentului.
              </p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Adăugat: {doc.uploadedAt.toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doc.content.length > 100 
                        ? `${doc.content.substring(0, 100)}...` 
                        : doc.content}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeDocument(doc.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {canProceed && (
          <Button
            onClick={onNextStep}
            className="bg-accent text-white hover:bg-accent/90 w-full"
          >
            Continuă la Pasul 4
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
