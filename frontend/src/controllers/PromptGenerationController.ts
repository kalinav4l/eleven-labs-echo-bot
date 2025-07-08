import { PromptGenerationRequest, PromptGenerationResponse } from '../types/dtos';
import { API_CONFIG } from '../constants/constants';

export class PromptGenerationController {
  static async generatePrompt(request: PromptGenerationRequest): Promise<PromptGenerationResponse> {
    const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/prompt-generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_CONFIG.BACKEND_API_KEY
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      throw new Error('Prompt generation failed');
    }
    return response.json();
  }
}