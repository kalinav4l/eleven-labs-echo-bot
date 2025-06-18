
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { LANGUAGES } from '@/constants/constants';

interface AdditionalLanguagesSectionProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
}

const AdditionalLanguagesSection: React.FC<AdditionalLanguagesSectionProps> = ({
  selectedLanguages,
  onLanguagesChange,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const addLanguage = () => {
    if (selectedLanguage && !selectedLanguages.includes(selectedLanguage)) {
      onLanguagesChange([...selectedLanguages, selectedLanguage]);
      setSelectedLanguage('');
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    onLanguagesChange(selectedLanguages.filter(lang => lang !== languageToRemove));
  };

  const getLanguageLabel = (value: string) => {
    return LANGUAGES.find(lang => lang.value === value)?.label || value;
  };

  const getLanguageFlag = (value: string) => {
    const flags: Record<string, string> = {
      'ro': '🇷🇴',
      'ru': '🇷🇺',
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷',
    };
    return flags[value] || '🌐';
  };

  const availableLanguages = LANGUAGES.filter(lang => !selectedLanguages.includes(lang.value));

  return (
    <Card className="liquid-glass">
      <CardHeader>
        <CardTitle className="text-foreground">Limbi Adiționale</CardTitle>
        <p className="text-sm text-muted-foreground">
          Specifică limbile adiționale din care apelantul poate alege.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="glass-input flex-1">
              <SelectValue placeholder="Selectează o limbă..." />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  <div className="flex items-center gap-2">
                    <span>{getLanguageFlag(language.value)}</span>
                    <span>{language.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={addLanguage}
            disabled={!selectedLanguage}
            variant="outline"
            size="icon"
            className="glass-button border-border"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {selectedLanguages.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nu ai adăugat încă limbi adiționale.
            </p>
          ) : (
            selectedLanguages.map((language) => (
              <div
                key={language}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getLanguageFlag(language)}</span>
                  <span className="font-medium text-foreground">
                    {getLanguageLabel(language)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {language}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeLanguage(language)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {selectedLanguages.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Pentru a suporta limbile adiționale, override-urile de limbă vor fi activate. 
              Poți vizualiza și configura toate override-urile în tab-ul "Security".
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdditionalLanguagesSection;
