
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { value: 'ro', label: t('language.ro'), flag: '🇷🇴' },
    { value: 'en', label: t('language.en'), flag: '🇺🇸' },
    { value: 'ru', label: t('language.ru'), flag: '🇷🇺' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={language} onValueChange={(value: 'en' | 'ru' | 'ro') => setLanguage(value)}>
        <SelectTrigger className="w-[140px] liquid-glass border-gray-200/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="liquid-glass border-gray-200/50">
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
