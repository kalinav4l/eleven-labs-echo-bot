import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { 
  Settings, 
  Upload, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Phone,
  Users,
  Target,
  BarChart3,
  Clock,
  DollarSign
} from 'lucide-react';
import { AgentSelector } from './AgentSelector';
import { PhoneSelector } from './PhoneSelector';
import { ContactsList } from './ContactsList';

interface Contact {
  id: string;
  name: string;
  phone: string;
  country: string;
  location: string;
}

interface CallsWizardProps {
  contacts: Contact[];
  selectedContacts: Set<string>;
  selectedAgentId: string;
  selectedPhoneId: string;
  isProcessingBatch: boolean;
  onContactSelect: (contactId: string, checked: boolean) => void;
  onSelectAll: () => void;
  onAgentSelect: (agentId: string) => void;
  onPhoneSelect: (phoneId: string) => void;
  onCSVUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBatchProcess: () => void;
  downloadTemplate: () => void;
}

type WizardStep = 'setup' | 'contacts' | 'review' | 'monitor';

export const CallsWizard: React.FC<CallsWizardProps> = ({
  contacts,
  selectedContacts,
  selectedAgentId,
  selectedPhoneId,
  isProcessingBatch,
  onContactSelect,
  onSelectAll,
  onAgentSelect,
  onPhoneSelect,
  onCSVUpload,
  onBatchProcess,
  downloadTemplate
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('setup');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation logic
  const isStep1Valid = selectedAgentId && selectedPhoneId;
  const isStep2Valid = contacts.length > 0 && selectedContacts.size > 0;
  const isStep3Valid = isStep1Valid && isStep2Valid;

  // Cost estimation (mock values - replace with real calculations)
  const estimatedCostPerCall = 0.05;
  const estimatedDurationPerCall = 2; // minutes
  const totalEstimatedCost = selectedContacts.size * estimatedCostPerCall;
  const totalEstimatedDuration = selectedContacts.size * estimatedDurationPerCall;

  const wizardSteps = [
    {
      id: 'setup',
      title: 'Configurare',
      description: 'Agent AI și număr telefon',
      icon: Settings,
      isValid: isStep1Valid,
      isCompleted: isStep1Valid && currentStep !== 'setup'
    },
    {
      id: 'contacts',
      title: 'Contacte',
      description: 'Încărcare și selecție',
      icon: Users,
      isValid: isStep2Valid,
      isCompleted: isStep2Valid && !['setup', 'contacts'].includes(currentStep)
    },
    {
      id: 'review',
      title: 'Revizie',
      description: 'Verificare și lansare',
      icon: Target,
      isValid: isStep3Valid,
      isCompleted: isStep3Valid && currentStep === 'monitor'
    },
    {
      id: 'monitor',
      title: 'Monitorizare',
      description: 'Progres în timp real',
      icon: BarChart3,
      isValid: true,
      isCompleted: false
    }
  ];

  const currentStepIndex = wizardSteps.findIndex(step => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / wizardSteps.length) * 100;

  const handleStepClick = (stepId: WizardStep) => {
    if (stepId === 'setup') {
      setCurrentStep('setup');
    } else if (stepId === 'contacts' && isStep1Valid) {
      setCurrentStep('contacts');
    } else if (stepId === 'review' && isStep2Valid) {
      setCurrentStep('review');
    } else if (stepId === 'monitor' && isStep3Valid) {
      setCurrentStep('monitor');
    }
  };

  const handleNext = () => {
    if (currentStep === 'setup' && isStep1Valid) {
      setCurrentStep('contacts');
    } else if (currentStep === 'contacts' && isStep2Valid) {
      setCurrentStep('review');
    } else if (currentStep === 'review' && isStep3Valid) {
      onBatchProcess();
      setCurrentStep('monitor');
    }
  };

  const handleBack = () => {
    if (currentStep === 'contacts') {
      setCurrentStep('setup');
    } else if (currentStep === 'review') {
      setCurrentStep('contacts');
    } else if (currentStep === 'monitor') {
      setCurrentStep('review');
    }
  };

  const getStepValidationMessage = () => {
    if (currentStep === 'setup') {
      if (!selectedAgentId && !selectedPhoneId) {
        return 'Selectează un agent AI și un număr de telefon pentru a continua';
      } else if (!selectedAgentId) {
        return 'Selectează un agent AI pentru a continua';
      } else if (!selectedPhoneId) {
        return 'Selectează un număr de telefon pentru a continua';
      }
    } else if (currentStep === 'contacts') {
      if (contacts.length === 0) {
        return 'Încarcă un fișier CSV cu contacte pentru a continua';
      } else if (selectedContacts.size === 0) {
        return 'Selectează cel puțin un contact pentru a continua';
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header with Steps */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Asistent Configurare Apeluri
            </CardTitle>
            <Badge variant={isStep3Valid ? 'default' : 'secondary'}>
              {isStep3Valid ? 'Gata pentru lansare' : 'În configurare'}
            </Badge>
          </div>
          <Progress value={progressPercentage} className="mb-4" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {wizardSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const canClick = step.isValid || step.isCompleted || step.id === 'setup';
              
              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => canClick && handleStepClick(step.id as WizardStep)}
                    disabled={!canClick}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : step.isCompleted
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : canClick
                            ? 'hover:bg-muted'
                            : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {step.isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{step.title}</div>
                      <div className="text-xs opacity-75">{step.description}</div>
                    </div>
                  </button>
                  {index < wizardSteps.length - 1 && (
                    <div className="w-8 h-px bg-border mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="min-h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(wizardSteps[currentStepIndex].icon, { className: "w-5 h-5" })}
                {wizardSteps[currentStepIndex].title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Setup */}
              {currentStep === 'setup' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Agent AI {selectedAgentId ? '✅' : '⚠️'}
                      </label>
                      <AgentSelector selectedAgentId={selectedAgentId} onAgentSelect={onAgentSelect} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Număr Telefon {selectedPhoneId ? '✅' : '⚠️'}
                      </label>
                      <PhoneSelector selectedPhoneId={selectedPhoneId} onPhoneSelect={onPhoneSelect} />
                    </div>
                  </div>
                  
                  {isStep1Valid && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                        <CheckCircle className="w-5 h-5" />
                        Configurarea este completă!
                      </div>
                      <p className="text-green-600 text-sm">
                        Agent și numărul de telefon sunt selectate. Poți trece la următorul pas.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Contacts */}
              {currentStep === 'contacts' && (
                <div className="space-y-6">
                  {contacts.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Încarcă contacte</h3>
                      <p className="text-muted-foreground mb-6">
                        Selectează un fișier CSV cu contactele tale
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                          <Upload className="w-4 h-4" />
                          Selectează CSV
                        </Button>
                        <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                          <Upload className="w-4 h-4" />
                          Descarcă template
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ContactsList 
                        contacts={contacts}
                        selectedContacts={selectedContacts}
                        onContactSelect={onContactSelect}
                        onSelectAll={onSelectAll}
                        isProcessingBatch={isProcessingBatch}
                      />
                      
                      {isStep2Valid && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                            <CheckCircle className="w-5 h-5" />
                            Contacte pregătite!
                          </div>
                          <p className="text-green-600 text-sm">
                            {selectedContacts.size} contacte selectate din {contacts.length} încărcate.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Configurație</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Agent AI:</span>
                          <span className="text-sm font-medium">{selectedAgentId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Telefon:</span>
                          <span className="text-sm font-medium">{selectedPhoneId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Contacte:</span>
                          <span className="text-sm font-medium">{selectedContacts.size}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Estimări</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Durată:
                          </span>
                          <span className="text-sm font-medium">{totalEstimatedDuration} min</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Cost:
                          </span>
                          <span className="text-sm font-medium">${totalEstimatedCost.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Per apel:</span>
                          <span className="text-sm font-medium">${estimatedCostPerCall.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                      <Target className="w-5 h-5" />
                      Gata pentru lansare!
                    </div>
                    <p className="text-blue-600 text-sm">
                      Toate configurațiile sunt complete. Apasă "Lansează Campania" pentru a începe apelurile.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Monitor */}
              {currentStep === 'monitor' && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Campania a fost lansată!</h3>
                    <p className="text-muted-foreground">
                      Monitorizează progresul în panoul de status de mai jos.
                    </p>
                  </div>
                </div>
              )}

              {/* Validation Message */}
              {getStepValidationMessage() && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-orange-700 font-medium">
                    <AlertCircle className="w-5 h-5" />
                    {getStepValidationMessage()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Progres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wizardSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2">
                    {step.isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : step.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-gray-300" />
                    )}
                    <span className={`text-sm ${step.isCompleted || step.isValid ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Acțiuni Rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                onClick={downloadTemplate}
              >
                <Upload className="w-4 h-4" />
                Template CSV
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                Încarcă CSV
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 'setup'}
        >
          Înapoi
        </Button>

        <div className="flex items-center gap-2">
          {currentStep === 'review' ? (
            <Button 
              onClick={handleNext}
              disabled={!isStep3Valid || isProcessingBatch}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Lansează Campania
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={
                (currentStep === 'setup' && !isStep1Valid) ||
                (currentStep === 'contacts' && !isStep2Valid) ||
                currentStep === 'monitor'
              }
            >
              Continuă
            </Button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept=".csv" 
        onChange={onCSVUpload} 
        className="hidden" 
      />
    </div>
  );
};