import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Upload, FileText, Trash2, Save, Database, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useEnhancedKnowledgeBase } from '../hooks/useEnhancedKnowledgeBase';

interface Step3Props {
  agentIdForEdit: string;
  setAgentIdForEdit: (id: string) => void;
  onNextStep: () => void;
}

export const Step3AgentEditing: React.FC<Step3Props> = ({
  agentIdForEdit,
  setAgentIdForEdit,
  onNextStep,
}) => {
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocName, setNewDocName] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [selectedExistingDocId, setSelectedExistingDocId] = useState<string>('');

  const {
    documents,
    existingDocuments,
    selectedExistingDocuments,
    isUpdating,
    isLoadingExisting,
    loadExistingDocuments,
    addExistingDocument,
    addTextDocument,
    addFileDocument,
    removeDocument,
    updateAgentKnowledgeBase
  } = useEnhancedKnowledgeBase({ 
    agentId: agentIdForEdit 
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await addFileDocument(file);
    if (success) {
      event.target.value = '';
    }
  };

  const addManualDocument = async () => {
    if (!newDocName.trim() || !newDocContent.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează numele și conținutul documentului.",
        variant: "destructive",
      });
      return;
    }

    const success = await addTextDocument(newDocName, newDocContent);
    if (success) {
      setNewDocName('');
      setNewDocContent('');
      setIsAddingDoc(false);
    }
  };

  const handleRemoveDocument = (id: string) => {
    removeDocument(id);
  };

  const handleUpdateKnowledgeBase = async () => {
    await updateAgentKnowledgeBase(false);
  };

  const handleAddExistingDocument = () => {
    if (!selectedExistingDocId) {
      toast({
        title: "Eroare",
        description: "Te rog selectează un document.",
        variant: "destructive",
      });
      return;
    }

    addExistingDocument(selectedExistingDocId);
    setSelectedExistingDocId('');
  };

  const getAvailableExistingDocuments = () => {
    return existingDocuments.filter(doc => !selectedExistingDocuments.has(doc.id));
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
            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadExistingDocuments}
                disabled={isLoadingExisting}
                className="elevenlabs-button elevenlabs-button-secondary flex items-center gap-2 px-3 py-2 text-sm"
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isLoadingExisting ? 'Se încarcă...' : 'Selectează Existente'}
                </span>
                <span className="sm:hidden">Existente</span>
              </button>
              <button
                onClick={() => setIsAddingDoc(true)}
                className="elevenlabs-button elevenlabs-button-secondary flex items-center gap-2 px-3 py-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Adaugă Manual</span>
                <span className="sm:hidden">Manual</span>
              </button>
              <label className="cursor-pointer">
                <span className="elevenlabs-button elevenlabs-button-secondary flex items-center gap-2 px-3 py-2 text-sm">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Încarcă Fișier</span>
                  <span className="sm:hidden">Fișier</span>
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Existing Documents Selection */}
          {existingDocuments.length > 0 && (
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
              <Label className="text-foreground font-medium">Documente Existente</Label>
              <div className="flex gap-2">
                <Select 
                  value={selectedExistingDocId} 
                  onValueChange={setSelectedExistingDocId}
                >
                  <SelectTrigger className="glass-input flex-1">
                    <SelectValue placeholder="Selectează un document existent" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    {getAvailableExistingDocuments().map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name} ({doc.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button 
                  onClick={handleAddExistingDocument}
                  disabled={!selectedExistingDocId}
                  className="elevenlabs-button elevenlabs-button-primary flex items-center gap-2 px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Adaugă
                </button>
              </div>
            </div>
          )}

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
                <button 
                  onClick={addManualDocument} 
                  className="elevenlabs-button elevenlabs-button-primary px-4 py-2 text-sm"
                >
                  Adaugă
                </button>
                <button 
                  onClick={() => setIsAddingDoc(false)}
                  className="elevenlabs-button elevenlabs-button-secondary px-4 py-2 text-sm"
                >
                  Anulează
                </button>
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
                    <h4 className="font-medium text-foreground">
                      {doc.name} 
                      <span className="text-xs text-muted-foreground ml-2">
                        ({doc.type === 'existing' ? 'existent' : doc.type})
                      </span>
                    </h4>
                    {doc.elevenLabsId && (
                      <p className="text-xs text-blue-600 mt-1">
                        ID: {doc.elevenLabsId}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="elevenlabs-button elevenlabs-button-danger p-2 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {documents.length > 0 && (
            <button
              onClick={handleUpdateKnowledgeBase}
              disabled={isUpdating || !agentIdForEdit.trim()}
              className="elevenlabs-button elevenlabs-button-primary w-full py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Se Actualizează Knowledge Base
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Actualizează Knowledge Base
                </>
              )}
            </button>
          )}
        </div>

        {canProceed && (
          <button
            onClick={onNextStep}
            className="elevenlabs-button elevenlabs-button-primary w-full py-3 text-sm font-medium"
          >
            Continuă la Pasul 4
          </button>
        )}
      </CardContent>
    </Card>
  );
};
