import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Plus, 
  Loader2
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  content?: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

interface KnowledgeBaseManagementProps {
  documents: Document[];
  selectedAgent: Agent | null;
  onTextDocumentAdd: (name: string, content: string) => Promise<void>;
  onFileUpload: (file: File) => Promise<void>;
  onDocumentRemove: (id: string) => Promise<void>;
  onDocumentLinkToAgent: (agentId: string, documentId: string) => Promise<void>;
  isProcessingDocument?: boolean;
}

export const KnowledgeBaseManagement: React.FC<KnowledgeBaseManagementProps> = ({
  documents,
  selectedAgent,
  onTextDocumentAdd,
  onFileUpload,
  onDocumentRemove,
  onDocumentLinkToAgent,
  isProcessingDocument = false,
}) => {
  const [textDocumentName, setTextDocumentName] = useState('');
  const [textDocumentContent, setTextDocumentContent] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const handleAddTextDocument = async () => {
    if (!textDocumentName.trim() || !textDocumentContent.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog completează numele și conținutul documentului.",
        variant: "destructive",
      });
      return;
    }

    await onTextDocumentAdd(textDocumentName, textDocumentContent);
    setTextDocumentName('');
    setTextDocumentContent('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast({
        title: "Eroare",
        description: "Te rog selectează un fișier.",
        variant: "destructive",
      });
      return;
    }

    await onFileUpload(uploadFile);
    setUploadFile(null);
    
    // Reset file input
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Knowledge Base
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Add Text Document */}
        <div className="space-y-2">
          <Label className="text-xs">Adaugă Document Text</Label>
          <Input
            value={textDocumentName}
            onChange={(e) => setTextDocumentName(e.target.value)}
            placeholder="Numele documentului"
          />
          <Textarea
            value={textDocumentContent}
            onChange={(e) => setTextDocumentContent(e.target.value)}
            placeholder="Conținutul documentului..."
            rows={3}
          />
          <Button
            size="sm"
            onClick={handleAddTextDocument}
            disabled={!textDocumentName.trim() || !textDocumentContent.trim()}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-1" />
            Adaugă Text
          </Button>
        </div>

        <Separator />

        {/* File Upload */}
        <div className="space-y-2">
          <Label className="text-xs">Upload Fișier (RAG cu AI)</Label>
          <Input
            id="file-upload-input"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.txt,.docx"
          />
          {uploadFile && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground truncate">
                {uploadFile.name}
              </span>
              <Button
                size="sm"
                onClick={handleFileUpload}
                disabled={isProcessingDocument || !selectedAgent}
              >
                {isProcessingDocument ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3 mr-1" />
                )}
                {isProcessingDocument ? 'Procesez...' : 'Upload'}
              </Button>
            </div>
          )}
          {!selectedAgent && (
            <p className="text-xs text-muted-foreground text-orange-600">
              ⚠️ Selectează un agent pentru a putea încărca documente
            </p>
          )}
        </div>

        <Separator />

        {/* Documents List */}
        <div className="space-y-2">
          <Label className="text-xs">Documente Curente</Label>
          <ScrollArea className="max-h-40">
            <div className="space-y-1">
               {documents.map((doc) => (
                 <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                   <span className="truncate">{doc.name}</span>
                   <div className="flex gap-1">
                     {selectedAgent && (
                       <Button
                         size="sm"
                         variant="ghost"
                         onClick={async () => {
                           await onDocumentLinkToAgent(selectedAgent.id, doc.id);
                           toast({
                             title: "Document legat",
                             description: `Documentul "${doc.name}" a fost legat la agentul ${selectedAgent.name}`,
                           });
                         }}
                         title="Leagă la agent"
                       >
                         <Plus className="h-3 w-3" />
                       </Button>
                     )}
                     <Button
                       size="sm"
                       variant="ghost"
                       onClick={() => onDocumentRemove(doc.id)}
                     >
                       <Trash2 className="h-3 w-3" />
                     </Button>
                   </div>
                 </div>
               ))}
              {documents.length === 0 && (
                <p className="text-xs text-muted-foreground">Nu sunt documente încărcate</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};