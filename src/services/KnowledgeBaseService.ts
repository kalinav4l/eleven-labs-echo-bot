
import { BACKEND_CONFIG, getBackendHeaders } from '@/config/backendConfig';

export interface ExistingDocument {
  id: string;
  name: string;
  type: 'file' | 'text';
  usage_mode: string;
}

export interface KnowledgeBaseResponse {
  documents: ExistingDocument[];
}

export interface KnowledgeBaseDocument {
  type: 'text' | 'file';
  name: string;
  id: string;
  usage_mode: 'auto';
}

export interface CreateTextDocumentRequest {
  text: string;
  name: string;
}

export interface CreateDocumentResponse {
  id: string;
  name: string;
}

export class KnowledgeBaseService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = BACKEND_CONFIG.BASE_URL;
  }

  private getHeaders(): HeadersInit {
    return getBackendHeaders();
  }

  async getExistingDocuments(): Promise<KnowledgeBaseResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-base/documents`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as KnowledgeBaseResponse;
      console.log('Fetched existing documents from backend:', data);
      return data;
    } catch (error) {
      console.error('Error fetching existing documents from backend:', error);
      throw error;
    }
  }

  async createTextDocument(request: CreateTextDocumentRequest): Promise<CreateDocumentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/knowledge-base/documents/text`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as CreateDocumentResponse;
      console.log('Created text document via backend:', data);
      return data;
    } catch (error) {
      console.error('Error creating text document via backend:', error);
      throw error;
    }
  }

  async uploadFileDocument(file: File, name: string): Promise<CreateDocumentResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/api/knowledge-base/documents/file?name=${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: {
          // Don't set Content-Type for FormData, let the browser set it
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as CreateDocumentResponse;
      console.log('Uploaded file document via backend:', data);
      return data;
    } catch (error) {
      console.error('Error uploading file document via backend:', error);
      throw error;
    }
  }

  async updateAgentKnowledgeBase(agentId: string, knowledgeBase: KnowledgeBaseDocument[]): Promise<boolean> {
    try {
      const updateData = {
        conversation_config: {
          agent: {
            prompt: {
              knowledge_base: knowledgeBase
            }
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/api/eleven-labs/agent/${agentId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Updated agent knowledge base via backend:', data);
      return true;
    } catch (error) {
      console.error('Error updating agent knowledge base via backend:', error);
      throw error;
    }
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
