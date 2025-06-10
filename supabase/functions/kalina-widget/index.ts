
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
  
  // Find all kalina-widget elements
  const widgets = document.querySelectorAll('kalina-widget');
  
  widgets.forEach(function(widgetElement) {
    const agentId = widgetElement.getAttribute('agent-id');
    if (!agentId) {
      console.error('Kalina Widget: agent-id attribute is required');
      return;
    }
    
    // Create widget container
    const container = document.createElement('div');
    container.style.cssText = \`
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    \`;
    
    // Widget state
    let isOpen = false;
    let messages = [];
    let isLoading = false;
    
    // Create chat button
    const chatButton = document.createElement('button');
    chatButton.innerHTML = \`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    \`;
    chatButton.style.cssText = \`
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    \`;
    
    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.style.cssText = \`
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      display: none;
      flex-direction: column;
      overflow: hidden;
    \`;
    
    // Chat header
    const chatHeader = document.createElement('div');
    chatHeader.style.cssText = \`
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    \`;
    chatHeader.innerHTML = \`
      <div>
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Kalina AI</h3>
        <p style="margin: 0; font-size: 12px; opacity: 0.8;">Asistent virtual</p>
      </div>
      <button id="kalina-close-btn" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
    \`;
    
    // Messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.style.cssText = \`
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f8f9fa;
    \`;
    
    // Input container
    const inputContainer = document.createElement('div');
    inputContainer.style.cssText = \`
      padding: 16px;
      border-top: 1px solid #e9ecef;
      background: white;
      display: flex;
      gap: 8px;
    \`;
    
    const messageInput = document.createElement('input');
    messageInput.type = 'text';
    messageInput.placeholder = 'Scrie un mesaj...';
    messageInput.style.cssText = \`
      flex: 1;
      padding: 12px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      outline: none;
      font-size: 14px;
    \`;
    
    const sendButton = document.createElement('button');
    sendButton.innerHTML = '→';
    sendButton.style.cssText = \`
      padding: 12px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
    \`;
    
    // Assemble chat window
    inputContainer.appendChild(messageInput);
    inputContainer.appendChild(sendButton);
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(messagesContainer);
    chatWindow.appendChild(inputContainer);
    
    // Assemble container
    container.appendChild(chatButton);
    container.appendChild(chatWindow);
    
    // Add initial welcome message
    addMessage('Bună! Sunt Kalina, asistentul tău virtual. Cu ce te pot ajuta?', false);
    
    // Event listeners
    chatButton.addEventListener('click', toggleChat);
    chatHeader.querySelector('#kalina-close-btn').addEventListener('click', toggleChat);
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });
    
    function toggleChat() {
      isOpen = !isOpen;
      chatWindow.style.display = isOpen ? 'flex' : 'none';
      chatButton.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)';
    }
    
    function addMessage(text, isUser) {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = \`
        margin-bottom: 12px;
        display: flex;
        justify-content: \${isUser ? 'flex-end' : 'flex-start'};
      \`;
      
      const messageBubble = document.createElement('div');
      messageBubble.style.cssText = \`
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.4;
        \${isUser 
          ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;' 
          : 'background: white; color: #333; border: 1px solid #e9ecef;'
        }
      \`;
      messageBubble.textContent = text;
      
      messageDiv.appendChild(messageBubble);
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function addTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.id = 'kalina-typing';
      typingDiv.style.cssText = \`
        margin-bottom: 12px;
        display: flex;
        justify-content: flex-start;
      \`;
      
      const typingBubble = document.createElement('div');
      typingBubble.style.cssText = \`
        padding: 12px 16px;
        border-radius: 16px;
        background: white;
        border: 1px solid #e9ecef;
        font-size: 14px;
      \`;
      typingBubble.innerHTML = \`
        <div style="display: flex; gap: 4px;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #ccc; animation: kalina-bounce 1.4s infinite ease-in-out both;"></div>
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #ccc; animation: kalina-bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></div>
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #ccc; animation: kalina-bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></div>
        </div>
      \`;
      
      typingDiv.appendChild(typingBubble);
      messagesContainer.appendChild(typingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function removeTypingIndicator() {
      const typing = document.getElementById('kalina-typing');
      if (typing) typing.remove();
    }
    
    async function sendMessage() {
      const message = messageInput.value.trim();
      if (!message || isLoading) return;
      
      addMessage(message, true);
      messageInput.value = '';
      isLoading = true;
      addTypingIndicator();
      
      try {
        const response = await fetch(\`\${KALINA_API_BASE}/kalina-chat\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_id: agentId,
            message: message
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Network error');
        }
        
        removeTypingIndicator();
        addMessage(data.text, false);
        
        // Play audio if available
        if (data.audio) {
          const audio = new Audio(data.audio);
          audio.play().catch(e => console.log('Audio autoplay blocked'));
        }
        
      } catch (error) {
        removeTypingIndicator();
        addMessage('Ne pare rău, a apărut o eroare. Încearcă din nou.', false);
        console.error('Kalina Widget Error:', error);
      } finally {
        isLoading = false;
      }
    }
    
    // Add CSS animations
    if (!document.getElementById('kalina-animations')) {
      const style = document.createElement('style');
      style.id = 'kalina-animations';
      style.textContent = \`
        @keyframes kalina-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      \`;
      document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(container);
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
