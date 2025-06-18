
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, Loader2 } from 'lucide-react';
import { LANGUAGES } from '@/constants/constants';
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

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (isOpen && !selectedLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [isOpen, defaultLanguage]);

  const getLanguageLabel = (value: string) => {
    return LANGUAGES.find(lang => lang.value === value)?.label || value;
  };

  const allLanguages = [defaultLanguage, ...additionalLanguages];

  const handleMessageChange = (language: string, message: string) => {
    const updatedMessages = { ...localMessages, [language]: message };
    setLocalMessages(updatedMessages);
    onMessagesUpdate(updatedMessages);
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
      onMessagesUpdate(updatedMessages);
      
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Primul mesaj - Suport multilingual
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configurează primul mesaj pentru fiecare limbă disponibilă. Folosește traducerea automată pentru a genera mesajele în toate limbile.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-foreground">Limba selectată:</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[200px] glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allLanguages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {getLanguageLabel(language)}
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

          <div>
            <Label htmlFor="multilingual-message" className="text-foreground">
              Mesaj pentru {getLanguageLabel(selectedLanguage)}
              {selectedLanguage === defaultLanguage && " (limba principală)"}
            </Label>
            <Textarea
              id="multilingual-message"
              value={localMessages[selectedLanguage] || ''}
              onChange={(e) => handleMessageChange(selectedLanguage, e.target.value)}
              className="glass-input min-h-[100px] mt-2"
              placeholder={`Introdu primul mesaj în ${getLanguageLabel(selectedLanguage).toLowerCase()}...`}
            />
            {selectedLanguage === defaultLanguage && additionalLanguages.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Acest mesaj va fi folosit ca sursă pentru traducerea automată în celelalte limbi.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allLanguages.map((language) => (
              <div key={language} className="p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {getLanguageLabel(language)}
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

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Închide
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultilingualFirstMessageModal;
