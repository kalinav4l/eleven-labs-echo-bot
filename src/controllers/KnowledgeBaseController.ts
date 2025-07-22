
import { CreateTextDocumentRequest, CreateDocumentResponse, KnowledgeBaseResponse } from '../types/dtos';
import { ENV } from '../config/environment';

export class KnowledgeBaseController {
  static async createTextDocument(request: CreateTextDocumentRequest): Promise<CreateDocumentResponse> {
    const response = await fetch(`${ENV.BACKEND_URL}/knowledge-base-operations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': ENV.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        ...request,
        // Adăugăm un identificator pentru utilizator în numele documentului pentru a-l putea filtra mai târziu
        name: `${request.name} (User Document)`
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create text document error:', errorText);
      throw new Error(`Create text document failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  static async uploadFileDocument(name: string, file: File): Promise<CreateDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Adăugăm un identificator în numele fișierului pentru a-l putea identifica ca aparținând utilizatorului
    const userFileName = `${name} (User Document)`;
    
    const response = await fetch(`${ENV.BACKEND_URL}/knowledge-base-operations?name=${encodeURIComponent(userFileName)}`, {
      method: 'POST',
      headers: {
        'X-API-KEY': ENV.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('File upload error:', errorText);
      throw new Error(`File upload failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  static async getExistingDocuments(): Promise<KnowledgeBaseResponse> {
    const response = await fetch(`${ENV.BACKEND_URL}/knowledge-base-operations`, {
      method: 'GET',
      headers: {
        'X-API-KEY': ENV.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${ENV.SUPABASE_ANON_KEY}`,
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get existing documents error:', errorText);
      throw new Error(`Get existing documents failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }
}
