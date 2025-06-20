
import { useKnowledgeDocuments } from './useKnowledgeDocuments';
import { useDocumentCreation } from './useDocumentCreation';
import { useKnowledgeBaseUpdate } from './useKnowledgeBaseUpdate';
import { AgentResponse } from '../components/AgentResponse';

interface UseEnhancedKnowledgeBaseProps {
  agentId: string;
  onAgentRefresh?: (agentData: AgentResponse) => void;
}

export const useEnhancedKnowledgeBase = ({ agentId, onAgentRefresh }: UseEnhancedKnowledgeBaseProps) => {
  const {
    documents,
    setDocuments,
    existingDocuments,
    selectedExistingDocuments,
    isLoadingExisting,
    processAgentKnowledgeBase,
    loadExistingDocuments,
    addExistingDocument,
    removeDocument
  } = useKnowledgeDocuments();

  const { addTextDocument, addFileDocument } = useDocumentCreation({ setDocuments });

  const { isUpdating, updateAgentKnowledgeBase } = useKnowledgeBaseUpdate({
    agentId,
    documents,
    onAgentRefresh,
    processAgentKnowledgeBase
  });

  return {
    documents,
    existingDocuments,
    selectedExistingDocuments,
    isUpdating,
    isLoadingExisting,
    loadExistingDocuments,
    addExistingDocument,
    addTextDocument,
    addFileDocument,
    removeDocument,
    updateAgentKnowledgeBase,
    processAgentKnowledgeBase
  };
};
