import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { DEFAULT_VALUES } from '../constants/constants';
import { usePromptGeneration } from '../hooks/usePromptGeneration';
import { useAgentCreation } from '../hooks/useAgentCreation';
import { StepIndicator } from '../components/StepIndicator';
import { Step1PromptGeneration } from '../components/Step1PromptGeneration';
import { Step2AgentCreation } from '../components/Step2AgentCreation';

const AgentConsultant: React.FC = () => {
  const { user } = useAuth();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const stepTitles = ['Prompt', 'Agent'];

  // Step 1 - Prompt Generation
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Step 2 - Agent Creation
  const [agentName, setAgentName] = useState('');
  const [agentLanguage, setAgentLanguage] = useState(DEFAULT_VALUES.LANGUAGE);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VALUES.VOICE_ID);

  // Custom hooks
  const {
    generatePrompt,
    isGenerating: isGeneratingPrompt
  } = usePromptGeneration();
  
  const {
    isCreating: isCreatingAgent,
    createdAgentId,
    handleCreateAgent,
    handleCopyAgentId
  } = useAgentCreation({
    websiteUrl,
    additionalPrompt,
    agentName,
    agentLanguage,
    selectedVoice,
    generatePrompt: () => Promise.resolve(generatedPrompt)
  });

  // Authentication guard
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Step handlers
  const handleGeneratePrompt = async () => {
    const prompt = await generatePrompt({
      websiteUrl,
      agentRole,
      additionalPrompt
    });
    if (prompt) {
      setGeneratedPrompt(prompt);
    }
  };

  const handleCreateAgentWithPrompt = async () => {
    await handleCreateAgent();
    // Agent creation hook will automatically redirect to edit page
  };

  const handleStep1Next = () => {
    setCurrentStep(2);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PromptGeneration
            websiteUrl={websiteUrl}
            setWebsiteUrl={setWebsiteUrl}
            agentRole={agentRole}
            setAgentRole={setAgentRole}
            additionalPrompt={additionalPrompt}
            setAdditionalPrompt={setAdditionalPrompt}
            generatedPrompt={generatedPrompt}
            setGeneratedPrompt={setGeneratedPrompt}
            onGeneratePrompt={handleGeneratePrompt}
            onNextStep={handleStep1Next}
            isGenerating={isGeneratingPrompt}
          />
        );
      case 2:
        return (
          <Step2AgentCreation
            agentName={agentName}
            setAgentName={setAgentName}
            agentLanguage={agentLanguage}
            setAgentLanguage={setAgentLanguage}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            createdAgentId={createdAgentId}
            onCreateAgent={handleCreateAgentWithPrompt}
            onCopyAgentId={handleCopyAgentId}
            onNextStep={() => {}} // Not needed anymore
            isCreating={isCreatingAgent}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 my-[60px]">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Agent Consultant AI
            </h1>
            <p className="text-muted-foreground">
              Creează automat un agent consultant pentru orice site web în 2 pași simpli
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator 
            currentStep={currentStep} 
            totalSteps={2} 
            stepTitles={stepTitles} 
            onStepClick={setCurrentStep} 
          />

          {/* Current Step */}
          {renderCurrentStep()}

          {/* Navigation */}
          {currentStep > 1 && (
            <div className="flex justify-center">
              <button 
                onClick={() => setCurrentStep(currentStep - 1)} 
                className="text-accent hover:text-accent/80 font-medium"
              >
                ← Înapoi la pasul anterior
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentConsultant;