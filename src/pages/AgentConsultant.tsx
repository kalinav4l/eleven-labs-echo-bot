import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { DEFAULT_VALUES } from '../constants/constants';
import { usePromptGeneration } from '../hooks/usePromptGeneration';
import { useAgentCreation } from '../hooks/useAgentCreation';
import { useCallInitiation } from '../hooks/useCallInitiation';
import { PromptGenerationSection } from '../components/PromptGenerationSection';
import { CallInitiationSection } from '../components/CallInitiationSection';

const AgentConsultant: React.FC = () => {
  const { user } = useAuth();

  // Form state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentLanguage, setAgentLanguage] = useState(DEFAULT_VALUES.LANGUAGE);
  const [selectedVoice, setSelectedVoice] = useState(DEFAULT_VALUES.VOICE_ID);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customAgentId, setCustomAgentId] = useState('');

  // Custom hooks
  const { generatePrompt, isGenerating: isGeneratingPrompt } = usePromptGeneration();

  const {
    isCreating: isCreatingAgent,
    createdAgentId,
    handleCreateAgent,
    handleCopyAgentId,
  } = useAgentCreation({
    websiteUrl,
    additionalPrompt,
    agentName,
    agentLanguage,
    selectedVoice,
    generatePrompt,
  });

  const { isInitiating: isInitiatingCall, handleInitiateCall } = useCallInitiation({
    customAgentId,
    createdAgentId,
    phoneNumber,
  });

  // Authentication guard - moved after hooks to comply with rules of hooks
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Agent Consultant AI
              </h1>
              <p className="text-muted-foreground">
                Creează automat un agent consultant pentru orice site web
              </p>
            </div>

            {/* Section 1: Generate Agent */}
            <PromptGenerationSection
                websiteUrl={websiteUrl}
                setWebsiteUrl={setWebsiteUrl}
                additionalPrompt={additionalPrompt}
                setAdditionalPrompt={setAdditionalPrompt}
                agentName={agentName}
                setAgentName={setAgentName}
                agentLanguage={agentLanguage}
                setAgentLanguage={setAgentLanguage}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                onCreateAgent={handleCreateAgent}
                onCopyAgentId={handleCopyAgentId}
                isCreatingAgent={isCreatingAgent}
                isGeneratingPrompt={isGeneratingPrompt}
                createdAgentId={createdAgentId}
            />

            {/* Section 2: Initiate Call */}
            <CallInitiationSection
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                customAgentId={customAgentId}
                setCustomAgentId={setCustomAgentId}
                createdAgentId={createdAgentId}
                onInitiateCall={handleInitiateCall}
                isInitiatingCall={isInitiatingCall}
            />
          </div>
        </div>
      </DashboardLayout>
  );
};

export default AgentConsultant;