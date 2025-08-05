

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { LANGUAGES } from '@/constants/constants';

interface AdditionalLanguagesSectionProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  currentLanguage?: string;
}

const AdditionalLanguagesSection: React.FC<AdditionalLanguagesSectionProps> = ({
  selectedLanguages,
  onLanguagesChange,
  currentLanguage,
}) => {
  const addLanguage = (languageValue: string) => {
    if (languageValue && !selectedLanguages.includes(languageValue)) {
      onLanguagesChange([...selectedLanguages, languageValue]);
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    onLanguagesChange(selectedLanguages.filter(lang => lang !== languageToRemove));
  };

  const getLanguageLabel = (value: string) => {
    return LANGUAGES.find(lang => lang.value === value)?.label || value;
  };

  // Filter out already selected languages and the current agent language
  const availableLanguages = LANGUAGES.filter(lang => 
    !selectedLanguages.includes(lang.value) && 
    lang.value !== currentLanguage
  );

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
          <Select value="" onValueChange={addLanguage}>
            <SelectTrigger className="glass-input flex-1">
              <SelectValue placeholder="Selectează o limbă pentru a o adăuga..." />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      </CardContent>
    </Card>
  );
};

export default AdditionalLanguagesSection;
