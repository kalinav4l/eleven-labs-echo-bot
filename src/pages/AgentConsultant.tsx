import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { DEFAULT_VALUES } from '../constants/constants';
import { usePromptGeneration } from '../hooks/usePromptGeneration';
import { useAgentCreation } from '../hooks/useAgentCreation';
import { useCallInitiation } from '../hooks/useCallInitiation';
import { StepIndicator } from '../components/StepIndicator';
import { Step1PromptGeneration } from '../components/Step1PromptGeneration';
import { Step2AgentCreation } from '../components/Step2AgentCreation';
import { Step3AgentEditing } from '../components/Step3AgentEditing';
import { Step4CallInitiation } from '../components/Step4CallInitiation';
const AgentConsultant: React.FC = () => {
  const {
    user
  } = useAuth();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const stepTitles = ['Prompt', 'Agent', 'Editare', 'Apeluri'];

  // Step 1 - Prompt Generation
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Step 2 - Agent Creation
  const [agentName, setAgentName] = useState('');
  const [agentLanguage, setAgentLanguage] = useState(DEFAULT_VALUES.LANGUAGE);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VALUES.VOICE_ID);

  // Step 3 - Agent Editing
  const [agentIdForEdit, setAgentIdForEdit] = useState('');

  // Step 4 - Call Initiation
  const [phoneNumber, setPhoneNumber] = useState('');
  const [finalAgentId, setFinalAgentId] = useState('');
  const [isOnlineCallActive, setIsOnlineCallActive] = useState(false);

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
  const {
    initiateCall,
    isInitiating: isInitiatingCall
  } = useCallInitiation();

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
  };
  const handleStep1Next = () => {
    setCurrentStep(2);
  };
  const handleStep2Next = () => {
    setAgentIdForEdit(createdAgentId);
    setFinalAgentId(createdAgentId);
    setCurrentStep(3);
  };
  const handleStep3Next = () => {
    setCurrentStep(4);
  };
  const handleInitiateOnlineCall = () => {
    setIsOnlineCallActive(!isOnlineCallActive);
    // Here you would implement the actual online call functionality
  };
  const handleInitiateCall = async () => {
    if (!finalAgentId.trim() || !phoneNumber.trim()) return;
    await initiateCall(finalAgentId, phoneNumber, 'Test Agent Consultant');
  };
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PromptGeneration websiteUrl={websiteUrl} setWebsiteUrl={setWebsiteUrl} agentRole={agentRole} setAgentRole={setAgentRole} additionalPrompt={additionalPrompt} setAdditionalPrompt={setAdditionalPrompt} generatedPrompt={generatedPrompt} setGeneratedPrompt={setGeneratedPrompt} onGeneratePrompt={handleGeneratePrompt} onNextStep={handleStep1Next} isGenerating={isGeneratingPrompt} />;
      case 2:
        return <Step2AgentCreation agentName={agentName} setAgentName={setAgentName} agentLanguage={agentLanguage} setAgentLanguage={setAgentLanguage} selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice} createdAgentId={createdAgentId} onCreateAgent={handleCreateAgentWithPrompt} onCopyAgentId={handleCopyAgentId} onNextStep={handleStep2Next} isCreating={isCreatingAgent} />;
      case 3:
        return <Step3AgentEditing agentIdForEdit={agentIdForEdit} setAgentIdForEdit={setAgentIdForEdit} onNextStep={handleStep3Next} />;
      case 4:
        return <Step4CallInitiation phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber} finalAgentId={finalAgentId} setFinalAgentId={setFinalAgentId} onInitiateCall={handleInitiateCall} onInitiateOnlineCall={handleInitiateOnlineCall} isInitiatingCall={isInitiatingCall} isOnlineCallActive={isOnlineCallActive} />;
      default:
        return null;
    }
  };
  return <DashboardLayout>
      <div className="p-6 my-[60px]">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Agent Consultant AI
            </h1>
            <p className="text-muted-foreground">
              Creează automat un agent consultant pentru orice site web în 4 pași simpli
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={4} stepTitles={stepTitles} onStepClick={setCurrentStep} />

          {/* Current Step */}
          {renderCurrentStep()}

          {/* Navigation */}
          {currentStep > 1 && <div className="flex justify-center">
              <button onClick={() => setCurrentStep(currentStep - 1)} className="text-accent hover:text-accent/80 font-medium">
                ← Înapoi la pasul anterior
              </button>
            </div>}
        </div>
      </div>
    </DashboardLayout>;
};
export default AgentConsultant;
