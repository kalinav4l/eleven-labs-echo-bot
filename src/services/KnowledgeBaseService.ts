
import { API_CONFIG } from '@/constants/constants';

export interface ExistingDocument {
  id: string;
  name: string;
  type: 'file' | 'text';
  metadata: {
    created_at_unix_secs: number;
    last_updated_at_unix_secs: number;
    size_bytes?: number;
  };
  supported_usages: string[];
  access_info: {
    is_creator: boolean;
    creator_name: string;
    creator_email: string;
    role: string;
  };
  dependent_agents: any[];
}

export interface KnowledgeBaseResponse {
  documents: ExistingDocument[];
  next_cursor: string | null;
  has_more: boolean;
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
}

export class KnowledgeBaseService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = API_CONFIG.ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
  }

  private getHeaders(): HeadersInit {
    return {
      'Xi-Api-Key': this.apiKey,
      'Api-Key': 'xi-api-key',
    };
  }

  async getExistingDocuments(): Promise<KnowledgeBaseResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/convai/knowledge-base?show_only_owned_documents=true`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as KnowledgeBaseResponse;
      console.log('Fetched existing documents:', data);
      return data;
    } catch (error) {
      console.error('Error fetching existing documents:', error);
      throw error;
    }
  }

  async createTextDocument(request: CreateTextDocumentRequest): Promise<CreateDocumentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/convai/knowledge-base/text`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as CreateDocumentResponse;
      console.log('Created text document:', data);
      return data;
    } catch (error) {
      console.error('Error creating text document:', error);
      throw error;
    }
  }

  async uploadFileDocument(file: File, name: string): Promise<CreateDocumentResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);

      const response = await fetch(`${this.baseUrl}/convai/knowledge-base/file`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as CreateDocumentResponse;
      console.log('Uploaded file document:', data);
      return data;
    } catch (error) {
      console.error('Error uploading file document:', error);
      throw error;
    }
  }

  async updateAgentKnowledgeBase(agentId: string, knowledgeBase: KnowledgeBaseDocument[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/convai/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_config: {
            agent: {
              prompt: {
                knowledge_base: knowledgeBase
              }
            }
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Updated agent knowledge base:', data);
      return true;
    } catch (error) {
      console.error('Error updating agent knowledge base:', error);
      throw error;
    }
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
