
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Loader2, Save } from 'lucide-react';
import { LANGUAGE_MAP } from '@/constants/constants';
import { toast } from '@/components/ui/use-toast';
import { translationService } from '@/services/TranslationService';

interface MultilingualFirstMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLanguage: string;
  additionalLanguages: string[];
  messages: Record<string, string>;
  onMessagesUpdate: (messages: Record<string, string>) => void;
}

const MultilingualFirstMessageModal: React.FC<MultilingualFirstMessageModalProps> = ({
  isOpen,
  onClose,
  defaultLanguage,
  additionalLanguages,
  messages,
  onMessagesUpdate,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [isTranslating, setIsTranslating] = useState(false);
  const [localMessages, setLocalMessages] = useState<Record<string, string>>(messages);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalMessages(messages);
    setHasChanges(false);
  }, [messages]);

  useEffect(() => {
    if (isOpen && !selectedLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [isOpen, defaultLanguage]);

  const getLanguageLabel = (languageId: string) => {
    return LANGUAGE_MAP[languageId as keyof typeof LANGUAGE_MAP] || languageId;
  };

  const getLanguageDisplayName = (languageId: string) => {
    const languageName = getLanguageLabel(languageId);
    return `• ${languageId.toUpperCase()} ${languageName}`;
  };

  const allLanguages = [defaultLanguage, ...additionalLanguages];

  const handleMessageChange = (language: string, message: string) => {
    const updatedMessages = { ...localMessages, [language]: message };
    setLocalMessages(updatedMessages);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    onMessagesUpdate(localMessages);
    setHasChanges(false);
    toast({
      title: "Succes!",
      description: "Mesajele multilinguale au fost actualizate.",
    });
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        "Ai modificări nesalvate. Ești sigur că vrei să închizi fără să salvezi?"
      );
      if (!confirmClose) return;
    }
    setHasChanges(false);
    onClose();
  };

  const translateToAllLanguages = async () => {
    const defaultMessage = localMessages[defaultLanguage];
    if (!defaultMessage?.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog introdu un mesaj în limba principală pentru a-l traduce.",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    
    try {
      const translations = await translationService.translateToMultipleLanguages(
        defaultMessage,
        defaultLanguage,
        additionalLanguages
      );
      
      const updatedMessages = { ...localMessages, ...translations };
      setLocalMessages(updatedMessages);
      setHasChanges(true);
      
      toast({
        title: "Succes!",
        description: "Mesajele au fost traduse în toate limbile.",
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la traducere. Te rog încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Primul mesaj - Suport multilingual
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configurează primul mesaj pentru fiecare limbă disponibilă. Folosește traducerea automată pentru a genera mesajele în toate limbile.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-foreground">Limba selectată:</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[250px] glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allLanguages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {getLanguageDisplayName(language)}
                      {language === defaultLanguage && " (principală)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {additionalLanguages.length > 0 && (
              <Button
                onClick={translateToAllLanguages}
                disabled={isTranslating || !localMessages[defaultLanguage]?.trim()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4" />
                )}
                Tradu automat în toate limbile
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Edit Panel */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="multilingual-message" className="text-foreground font-semibold">
                  Editează mesajul pentru {getLanguageDisplayName(selectedLanguage)}
                  {selectedLanguage === defaultLanguage && " (limba principală)"}
                </Label>
                <Textarea
                  id="multilingual-message"
                  value={localMessages[selectedLanguage] || ''}
                  onChange={(e) => handleMessageChange(selectedLanguage, e.target.value)}
                  className="glass-input min-h-[150px] mt-2"
                  placeholder={`Introdu primul mesaj în ${getLanguageLabel(selectedLanguage).toLowerCase()}...`}
                />
                {selectedLanguage === defaultLanguage && additionalLanguages.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Acest mesaj va fi folosit ca sursă pentru traducerea automată în celelalte limbi.
                  </p>
                )}
              </div>

              {hasChanges && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Ai modificări nesalvate. Apasă "Salvează modificările" pentru a le aplica.
                  </p>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            <div className="space-y-4">
              <Label className="text-foreground font-semibold">Previzualizare toate limbile</Label>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {allLanguages.map((language) => (
                  <div key={language} className="p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {getLanguageDisplayName(language)}
                        {language === defaultLanguage && " (principală)"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLanguage(language)}
                        className="text-xs"
                      >
                        Editează
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground break-words">
                      {localMessages[language] || "Niciun mesaj configurat"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              {hasChanges ? "Anulează" : "Închide"}
            </Button>
            
            <div className="flex gap-2">
              {hasChanges && (
                <Button 
                  onClick={handleSaveChanges}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvează modificările
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultilingualFirstMessageModal;
