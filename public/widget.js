
(function() {
  // Configurare widget
  const WIDGET_CONFIG = {
    agentId: 'agent_01jws2mjsjeh398vfnfd6k5hq0', // Setează agent ID-ul aici
    apiUrl: window.location.origin + '/api/chat', // Va folosi endpoint-ul nostru
    position: 'bottom-right'
  };

  // Verifică dacă widget-ul a fost deja inițializat
  if (window.BoreaWidgetLoaded) {
    return;
  }
  window.BoreaWidgetLoaded = true;

  // Creează stilurile CSS pentru widget
  const styles = `
    #borea-chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #borea-chat-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    #borea-chat-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 25px rgba(0,0,0,0.2);
    }
    
    #borea-chat-button svg {
      width: 24px;
      height: 24px;
      fill: white;
    }
    
    #borea-chat-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
    }
    
    #borea-chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    #borea-chat-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    #borea-chat-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #borea-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .borea-message {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .borea-message.user {
      background: #667eea;
      color: white;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    
    .borea-message.agent {
      background: #f1f3f4;
      color: #333;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    
    .borea-typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
    }
    
    .borea-typing span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ccc;
      animation: typing 1.4s infinite ease-in-out;
    }
    
    .borea-typing span:nth-child(1) { animation-delay: -0.32s; }
    .borea-typing span:nth-child(2) { animation-delay: -0.16s; }
    
    @keyframes typing {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }
    
    #borea-chat-input-container {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 8px;
    }
    
    #borea-chat-input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      padding: 10px 16px;
      font-size: 14px;
      outline: none;
      resize: none;
      max-height: 100px;
    }
    
    #borea-chat-input:focus {
      border-color: #667eea;
    }
    
    #borea-chat-send {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #667eea;
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    
    #borea-chat-send:hover {
      background: #5a67d8;
    }
    
    #borea-chat-send:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    @media (max-width: 480px) {
      #borea-chat-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 140px);
        right: 20px;
        bottom: 90px;
      }
    }
  `;

  // Adaugă stilurile în document
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Creează HTML-ul widget-ului
  const widgetHTML = `
    <div id="borea-chat-widget">
      <button id="borea-chat-button">
        <svg viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </button>
      
      <div id="borea-chat-window">
        <div id="borea-chat-header">
          <h3>Chat cu Borea AI</h3>
          <button id="borea-chat-close">×</button>
        </div>
        
        <div id="borea-chat-messages">
          <div class="borea-message agent">
            Salut! Sunt Borea AI. Cu ce te pot ajuta astăzi?
          </div>
        </div>
        
        <div id="borea-chat-input-container">
          <textarea id="borea-chat-input" placeholder="Scrie mesajul tău aici..." rows="1"></textarea>
          <button id="borea-chat-send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Adaugă widget-ul în pagină
  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // Variabile pentru funcționalitate
  let isOpen = false;
  let isLoading = false;

  // Elemente DOM
  const chatButton = document.getElementById('borea-chat-button');
  const chatWindow = document.getElementById('borea-chat-window');
  const closeButton = document.getElementById('borea-chat-close');
  const messagesContainer = document.getElementById('borea-chat-messages');
  const inputField = document.getElementById('borea-chat-input');
  const sendButton = document.getElementById('borea-chat-send');

  // Funcții helper
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.style.display = isOpen ? 'flex' : 'none';
    
    if (isOpen) {
      inputField.focus();
    }
  }

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `borea-message ${isUser ? 'user' : 'agent'}`;
    messageDiv.textContent = text;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'borea-message agent';
    typingDiv.innerHTML = '<div class="borea-typing"><span></span><span></span><span></span></div>';
    typingDiv.id = 'typing-indicator';
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  async function sendMessage(message) {
    if (isLoading || !message.trim()) return;
    
    isLoading = true;
    sendButton.disabled = true;
    
    // Adaugă mesajul utilizatorului
    addMessage(message, true);
    
    // Curăță input-ul
    inputField.value = '';
    
    // Arată typing indicator
    showTyping();
    
    try {
      const response = await fetch(`${window.location.origin}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          agentId: WIDGET_CONFIG.agentId
        })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      hideTyping();
      addMessage(data.response || 'Îmi pare rău, nu am putut procesa mesajul.');
      
    } catch (error) {
      hideTyping();
      addMessage('Îmi pare rău, a apărut o eroare. Te rog încearcă din nou.');
      console.error('Chat error:', error);
    } finally {
      isLoading = false;
      sendButton.disabled = false;
      inputField.focus();
    }
  }

  // Event listeners
  chatButton.addEventListener('click', toggleChat);
  closeButton.addEventListener('click', toggleChat);
  
  sendButton.addEventListener('click', () => {
    sendMessage(inputField.value);
  });
  
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputField.value);
    }
  });

  // Auto-resize textarea
  inputField.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
  });

  console.log('Borea Chat Widget loaded successfully!');
})();
