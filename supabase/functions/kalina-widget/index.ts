
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const widgetScript = `
(function() {
  'use strict';
  
  // Kalina Widget Configuration
  const KALINA_API_BASE = 'https://pwfczzxwjfxomqzhhwvj.supabase.co/functions/v1';
  
  // Web Component Definition
  class KalinaChatWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.isOpen = false;
      this.messages = [];
      this.isLoading = false;
      this.conversationHistory = [];
      this.agentData = null;
    }
    
    connectedCallback() {
      const agentId = this.getAttribute('agent-id');
      if (!agentId) {
        console.error('Kalina Widget: agent-id attribute is required');
        return;
      }
      
      this.render();
      this.setupEventListeners();
      this.loadAgentData(agentId);
    }
    
    async loadAgentData(agentId) {
      try {
        // Load agent configuration if needed
        this.agentData = { 
          name: 'Kalina AI', 
          avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop&crop=face'
        };
        this.updateHeader();
        this.addWelcomeMessage();
      } catch (error) {
        console.error('Failed to load agent data:', error);
      }
    }
    
    render() {
      this.shadowRoot.innerHTML = \`
        <style>
          :host {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          }
          
          .kalina-floating-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          
          .kalina-floating-button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
          }
          
          .kalina-floating-button.open {
            transform: scale(0.9);
          }
          
          .kalina-floating-button svg {
            width: 24px;
            height: 24px;
            transition: transform 0.3s ease;
          }
          
          .kalina-floating-button.open svg {
            transform: rotate(180deg);
          }
          
          .kalina-chat-window {
            position: absolute;
            bottom: 80px;
            right: 0;
            width: 380px;
            height: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.1);
            display: none;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease-out;
          }
          
          .kalina-chat-window.open {
            display: flex;
          }
          
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .kalina-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 16px 16px 0 0;
          }
          
          .kalina-agent-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .kalina-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
          }
          
          .kalina-agent-details h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }
          
          .kalina-agent-details p {
            margin: 0;
            font-size: 12px;
            opacity: 0.8;
          }
          
          .kalina-close-btn {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 24px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
          }
          
          .kalina-close-btn:hover {
            background: rgba(255,255,255,0.1);
          }
          
          .kalina-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          
          .kalina-messages::-webkit-scrollbar {
            width: 4px;
          }
          
          .kalina-messages::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .kalina-messages::-webkit-scrollbar-thumb {
            background: rgba(102, 126, 234, 0.3);
            border-radius: 2px;
          }
          
          .kalina-message {
            display: flex;
            align-items: flex-end;
            gap: 8px;
            max-width: 85%;
          }
          
          .kalina-message.user {
            align-self: flex-end;
            flex-direction: row-reverse;
          }
          
          .kalina-message.assistant {
            align-self: flex-start;
          }
          
          .kalina-message-bubble {
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 14px;
            line-height: 1.4;
            position: relative;
          }
          
          .kalina-message.user .kalina-message-bubble {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 4px;
          }
          
          .kalina-message.assistant .kalina-message-bubble {
            background: white;
            color: #333;
            border: 1px solid #e9ecef;
            border-bottom-left-radius: 4px;
          }
          
          .kalina-message-avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            flex-shrink: 0;
          }
          
          .kalina-typing-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 18px;
            border-bottom-left-radius: 4px;
          }
          
          .kalina-typing-dots {
            display: flex;
            gap: 4px;
          }
          
          .kalina-typing-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #667eea;
            animation: kalina-bounce 1.4s infinite ease-in-out both;
          }
          
          .kalina-typing-dot:nth-child(1) { animation-delay: -0.32s; }
          .kalina-typing-dot:nth-child(2) { animation-delay: -0.16s; }
          .kalina-typing-dot:nth-child(3) { animation-delay: 0s; }
          
          @keyframes kalina-bounce {
            0%, 80%, 100% { 
              transform: scale(0);
              opacity: 0.5;
            }
            40% { 
              transform: scale(1);
              opacity: 1;
            }
          }
          
          .kalina-input-container {
            padding: 20px;
            border-top: 1px solid #e9ecef;
            background: white;
            border-radius: 0 0 16px 16px;
          }
          
          .kalina-input-wrapper {
            display: flex;
            gap: 12px;
            align-items: flex-end;
          }
          
          .kalina-input {
            flex: 1;
            padding: 12px 16px;
            border: 1px solid #e9ecef;
            border-radius: 24px;
            outline: none;
            font-size: 14px;
            resize: none;
            max-height: 120px;
            min-height: 44px;
            font-family: inherit;
            transition: border-color 0.2s ease;
          }
          
          .kalina-input:focus {
            border-color: #667eea;
          }
          
          .kalina-send-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          
          .kalina-send-btn:hover:not(:disabled) {
            transform: scale(1.05);
          }
          
          .kalina-send-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          
          .kalina-send-btn svg {
            width: 18px;
            height: 18px;
          }
          
          .kalina-audio-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
          }
          
          .kalina-play-btn {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
          }
          
          .kalina-audio-wave {
            flex: 1;
            height: 2px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 1px;
            position: relative;
            overflow: hidden;
          }
          
          .kalina-audio-wave::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
            animation: kalina-wave 2s infinite;
          }
          
          @keyframes kalina-wave {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          @media (max-width: 480px) {
            .kalina-chat-window {
              width: calc(100vw - 40px);
              height: calc(100vh - 100px);
              bottom: 80px;
              right: 20px;
            }
          }
        </style>
        
        <button class="kalina-floating-button" id="kalina-toggle">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
        
        <div class="kalina-chat-window" id="kalina-chat">
          <div class="kalina-header">
            <div class="kalina-agent-info">
              <div class="kalina-avatar" id="kalina-avatar">K</div>
              <div class="kalina-agent-details">
                <h3 id="kalina-agent-name">Kalina AI</h3>
                <p>Asistent virtual inteligent</p>
              </div>
            </div>
            <button class="kalina-close-btn" id="kalina-close">×</button>
          </div>
          
          <div class="kalina-messages" id="kalina-messages"></div>
          
          <div class="kalina-input-container">
            <div class="kalina-input-wrapper">
              <textarea 
                class="kalina-input" 
                id="kalina-input" 
                placeholder="Scrie mesajul tău aici..."
                rows="1"
              ></textarea>
              <button class="kalina-send-btn" id="kalina-send">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      \`;
    }
    
    setupEventListeners() {
      const toggle = this.shadowRoot.getElementById('kalina-toggle');
      const close = this.shadowRoot.getElementById('kalina-close');
      const send = this.shadowRoot.getElementById('kalina-send');
      const input = this.shadowRoot.getElementById('kalina-input');
      const chatWindow = this.shadowRoot.getElementById('kalina-chat');
      
      toggle.addEventListener('click', () => this.toggleChat());
      close.addEventListener('click', () => this.closeChat());
      send.addEventListener('click', () => this.sendMessage());
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      input.addEventListener('input', () => {
        this.autoResizeTextarea(input);
      });
    }
    
    autoResizeTextarea(textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = newHeight + 'px';
    }
    
    toggleChat() {
      this.isOpen = !this.isOpen;
      const chatWindow = this.shadowRoot.getElementById('kalina-chat');
      const toggle = this.shadowRoot.getElementById('kalina-toggle');
      
      if (this.isOpen) {
        chatWindow.classList.add('open');
        toggle.classList.add('open');
        this.shadowRoot.getElementById('kalina-input').focus();
      } else {
        this.closeChat();
      }
    }
    
    closeChat() {
      this.isOpen = false;
      const chatWindow = this.shadowRoot.getElementById('kalina-chat');
      const toggle = this.shadowRoot.getElementById('kalina-toggle');
      
      chatWindow.classList.remove('open');
      toggle.classList.remove('open');
    }
    
    updateHeader() {
      if (this.agentData) {
        const nameElement = this.shadowRoot.getElementById('kalina-agent-name');
        const avatarElement = this.shadowRoot.getElementById('kalina-avatar');
        
        nameElement.textContent = this.agentData.name;
        
        if (this.agentData.avatar) {
          avatarElement.innerHTML = \`<img src="\${this.agentData.avatar}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Avatar">\`;
        } else {
          avatarElement.textContent = this.agentData.name.charAt(0).toUpperCase();
        }
      }
    }
    
    addWelcomeMessage() {
      const welcomeMessage = "Bună! Sunt Kalina, asistentul tău virtual. Cu ce te pot ajuta astăzi?";
      this.addMessage(welcomeMessage, 'assistant', true);
    }
    
    addMessage(text, sender, withAudio = false) {
      const messagesContainer = this.shadowRoot.getElementById('kalina-messages');
      const messageDiv = document.createElement('div');
      messageDiv.className = \`kalina-message \${sender}\`;
      
      let avatarHtml = '';
      if (sender === 'assistant') {
        avatarHtml = '<div class="kalina-message-avatar">K</div>';
      }
      
      messageDiv.innerHTML = \`
        \${avatarHtml}
        <div class="kalina-message-bubble">
          <div class="kalina-message-text">\${text}</div>
          \${withAudio && sender === 'assistant' ? \`
            <div class="kalina-audio-controls">
              <button class="kalina-play-btn">▶</button>
              <div class="kalina-audio-wave"></div>
            </div>
          \` : ''}
        </div>
      \`;
      
      messagesContainer.appendChild(messageDiv);
      this.scrollToBottom();
      
      // Store message in conversation history
      this.conversationHistory.push({ role: sender === 'user' ? 'user' : 'assistant', content: text });
    }
    
    addTypingIndicator() {
      const messagesContainer = this.shadowRoot.getElementById('kalina-messages');
      const typingDiv = document.createElement('div');
      typingDiv.className = 'kalina-message assistant';
      typingDiv.id = 'kalina-typing';
      
      typingDiv.innerHTML = \`
        <div class="kalina-message-avatar">K</div>
        <div class="kalina-typing-indicator">
          <div class="kalina-typing-dots">
            <div class="kalina-typing-dot"></div>
            <div class="kalina-typing-dot"></div>
            <div class="kalina-typing-dot"></div>
          </div>
        </div>
      \`;
      
      messagesContainer.appendChild(typingDiv);
      this.scrollToBottom();
    }
    
    removeTypingIndicator() {
      const typing = this.shadowRoot.getElementById('kalina-typing');
      if (typing) {
        typing.remove();
      }
    }
    
    scrollToBottom() {
      const messagesContainer = this.shadowRoot.getElementById('kalina-messages');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    async sendMessage() {
      const input = this.shadowRoot.getElementById('kalina-input');
      const message = input.value.trim();
      
      if (!message || this.isLoading) return;
      
      // Add user message
      this.addMessage(message, 'user');
      input.value = '';
      input.style.height = 'auto';
      
      // Set loading state
      this.isLoading = true;
      this.addTypingIndicator();
      
      try {
        const agentId = this.getAttribute('agent-id');
        const response = await fetch(\`\${KALINA_API_BASE}/kalina-chat\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_id: agentId,
            message: message,
            conversation_history: this.conversationHistory.slice(-10) // Keep last 10 messages for context
          })
        });
        
        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }
        
        const data = await response.json();
        
        this.removeTypingIndicator();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Add assistant response
        this.addMessage(data.text, 'assistant', !!data.audio);
        
        // Play audio if available
        if (data.audio) {
          try {
            const audio = new Audio(data.audio);
            audio.play().catch(e => {
              console.log('Audio autoplay was prevented by browser policy');
            });
          } catch (audioError) {
            console.warn('Audio playback failed:', audioError);
          }
        }
        
      } catch (error) {
        this.removeTypingIndicator();
        this.addMessage('Ne pare rău, a apărut o eroare. Te rog să încerci din nou.', 'assistant');
        console.error('Kalina Widget Error:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
  
  // Register the custom element
  if (!customElements.get('kalina-chat-widget')) {
    customElements.define('kalina-chat-widget', KalinaChatWidget);
  }
  
  // Initialize any existing widgets on the page
  document.addEventListener('DOMContentLoaded', function() {
    const widgets = document.querySelectorAll('kalina-chat-widget');
    widgets.forEach(widget => {
      if (!widget.shadowRoot) {
        widget.connectedCallback();
      }
    });
  });
})();
`;

  return new Response(widgetScript, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600'
    },
  });
});
