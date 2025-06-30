
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bot, BrainCircuit, Wand2, Lightbulb, Target, Phone, MessageSquare, Users } from 'lucide-react';

interface CalendarAITaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (instruction: string, agentId?: string) => Promise<void>;
  userAgents: any[];
  isProcessing: boolean;
}

const CalendarAITaskDialog = ({ 
  isOpen, 
  onClose, 
  onCreateTask, 
  userAgents, 
  isProcessing 
}: CalendarAITaskDialogProps) => {
  const [instruction, setInstruction] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [taskType, setTaskType] = useState<'automatic' | 'specific'>('automatic');

  const predefinedInstructions = [
    {
      title: "Campanie Promoțională",
      instruction: "Sună toți clienții din lista de contacte și oferă-le reducerea de 20% la produsele noastre. Programează apelurile pentru mâine între orele 10:00-18:00.",
      icon: <Target className="h-4 w-4" />,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "Follow-up Clienți",
      instruction: "Contactează clienții cu care nu am vorbit în ultimele 30 de zile și întreabă-i despre satisfacția lor cu serviciile noastre.",
      icon: <MessageSquare className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "Sondaj Satisfacție",
      instruction: "Apelează ultimii 20 de clienți și realizează un scurt sondaj de satisfacție cu 3 întrebări despre experiența lor.",
      icon: <Users className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "Reactivare Clienți",
      instruction: "Identifică clienții inactivi de peste 60 de zile și contactează-i cu o ofertă specială de revenire.",
      icon: <Phone className="h-4 w-4" />,
      color: "bg-orange-100 text-orange-800"
    }
  ];

  const handleSubmit = async () => {
    if (!instruction.trim()) return;
    
    await onCreateTask(instruction, selectedAgent);
    setInstruction('');
    setSelectedAgent('');
    onClose();
  };

  const useTemplate = (template: string) => {
    setInstruction(template);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-lg"></div>
        <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <BrainCircuit className="h-6 w-6 mr-3 text-indigo-600" />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Instrucțiuni Avansate pentru Agentul AI
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-6">
            {/* Task Type Selection */}
            <div className="flex space-x-4">
              <Button
                variant={taskType === 'automatic' ? 'default' : 'outline'}
                onClick={() => setTaskType('automatic')}
                className={taskType === 'automatic' ? 'bg-indigo-600' : ''}
              >
                <Bot className="h-4 w-4 mr-2" />
                Automat (AI decide)
              </Button>
              <Button
                variant={taskType === 'specific' ? 'default' : 'outline'}
                onClick={() => setTaskType('specific')}
                className={taskType === 'specific' ? 'bg-indigo-600' : ''}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Agent Specific
              </Button>
            </div>

            {/* Agent Selection */}
            {taskType === 'specific' && (
              <div>
                <Label className="text-gray-700 font-medium">Selectează Agentul</Label>
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="bg-white/70 border-white/30 backdrop-blur-sm">
                    <SelectValue placeholder="Alege agentul pentru această sarcină" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md">
                    {userAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.agent_id}>
                        <div className="flex items-center">
                          <Bot className="h-4 w-4 mr-2 text-indigo-600" />
                          {agent.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Predefined Templates */}
            <div>
              <Label className="text-gray-700 font-medium mb-3 block">Șabloane Rapide</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {predefinedInstructions.map((template, index) => (
                  <div
                    key={index}
                    onClick={() => useTemplate(template.instruction)}
                    className="p-4 border border-white/30 rounded-xl bg-white/50 hover:bg-white/70 cursor-pointer transition-all duration-200 hover:shadow-md group"
                  >
                    <div className="flex items-center mb-2">
                      <Badge className={`${template.color} border-0`}>
                        {template.icon}
                        <span className="ml-1">{template.title}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      {template.instruction.substring(0, 120)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Instruction Input */}
            <div>
              <Label className="text-gray-700 font-medium">Instrucțiuni Personalizate</Label>
              <Textarea
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Scrie instrucțiuni detaliate pentru agentul AI..."
                className="h-40 resize-none bg-white/70 border-white/30 backdrop-blur-sm"
              />
              <div className="mt-2 text-xs text-gray-500">
                <strong>Sfat:</strong> Fii specific cu numerele de telefon, intervalele de timp și mesajele care trebuie transmise.
              </div>
            </div>

            {/* AI Capabilities Info */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-200">
              <h4 className="font-medium text-indigo-900 mb-2 flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Capabilități AI Avansate
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-800">
                <div>
                  <p className="font-medium">📞 Procesare Apeluri:</p>
                  <p>Recunoaște și extrage automat numerele de telefon din text</p>
                </div>
                <div>
                  <p className="font-medium">⏰ Planificare Inteligentă:</p>
                  <p>Programează automat taskurile în intervalele optime</p>
                </div>
                <div>
                  <p className="font-medium">🎯 Campanii Personalizate:</p>
                  <p>Creează mesaje adaptate pentru fiecare tip de client</p>
                </div>
                <div>
                  <p className="font-medium">📊 Analiză Context:</p>
                  <p>Folosește istoricul conversațiilor pentru personalizare</p>
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-3">Exemple de instrucțiuni eficiente:</h4>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="bg-white p-3 rounded-lg border">
                  <p><strong>Pentru apeluri multiple:</strong></p>
                  <p className="italic">"Sună aceste numere: +373xxxxxxxx, +373yyyyyyyy și spune-le că avem o promoție specială de Black Friday cu 30% reducere. Programează apelurile mâine între 14:00-17:00."</p>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <p><strong>Pentru campanii complexe:</strong></p>
                  <p className="italic">"Creează o campanie de reactivare pentru toți clienții care nu au fost contactați în ultimele 45 de zile. Folosește un ton prietenos și oferă-le un discount de 15% pentru a reveni."</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={isProcessing || !instruction.trim()}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2 animate-pulse" />
                    Procesez instrucțiunile...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Creează Taskuri AI
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="px-6"
              >
                Anulează
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarAITaskDialog;
