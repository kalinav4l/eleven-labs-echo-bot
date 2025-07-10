
import { CreateTextDocumentRequest, CreateDocumentResponse, KnowledgeBaseResponse } from '../types/dtos';
import { API_CONFIG } from '../constants/constants';

export class KnowledgeBaseController {
  static async createTextDocument(request: CreateTextDocumentRequest): Promise<CreateDocumentResponse> {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/knowledge-base/documents/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_CONFIG.BACKEND_API_KEY,
      },
      body: JSON.stringify({
        ...request,
        // Adăugăm un identificator pentru utilizator în numele documentului pentru a-l putea filtra mai târziu
        name: `${request.name} (User Document)`
      }),
    });
    if (!response.ok) {
      throw new Error('Create text document failed');
    }
    return response.json();
  }

  static async uploadFileDocument(name: string, file: File): Promise<CreateDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Adăugăm un identificator în numele fișierului pentru a-l putea identifica ca aparținând utilizatorului
    const userFileName = `${name} (User Document)`;
    
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/knowledge-base/documents/file?name=${encodeURIComponent(userFileName)}`, {
      method: 'POST',
       headers: {
          'X-API-KEY': API_CONFIG.BACKEND_API_KEY,
      },
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
      headers: {
          'X-API-KEY': API_CONFIG.BACKEND_API_KEY,
      },
    });
    if (!response.ok) {
      throw new Error('Get existing documents failed');
    }
    return response.json();
  }
}
