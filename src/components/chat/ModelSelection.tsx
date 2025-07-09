import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain } from 'lucide-react';

// Modelele GPT disponibile
const GPT_MODELS = [
  { value: 'gpt-4o', label: 'GPT-4o (Recomandată)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Rapidă)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
];

interface ModelSelectionProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export const ModelSelection: React.FC<ModelSelectionProps> = ({
  selectedModel,
  onModelChange,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Model GPT
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selectează modelul" />
          </SelectTrigger>
          <SelectContent>
            {GPT_MODELS.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};