import { CreateTextDocumentRequest, CreateDocumentResponse, KnowledgeBaseResponse } from '../types/dtos';
import { API_CONFIG } from '../constants/constants';

export class KnowledgeBaseController {
  static async createTextDocument(request: CreateTextDocumentRequest): Promise<CreateDocumentResponse> {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/knowledge-base/documents/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Create text document failed');
    }
    return response.json();
  }

  static async uploadFileDocument(name: string, file: File): Promise<CreateDocumentResponse> {
    // The API expects a JSON body with a base64-encoded file string, but the OpenAPI spec says format: binary
    // Here, we use FormData for file upload, but you may need to adjust if the backend expects base64 in JSON
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/knowledge-base/documents/file?name=${encodeURIComponent(name)}`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('File upload failed');
    }
    return response.json();
  }

  static async getExistingDocuments(): Promise<KnowledgeBaseResponse> {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/knowledge-base/documents`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error('Get existing documents failed');
    }
    return response.json();
  }
}
