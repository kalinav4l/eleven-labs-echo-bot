
(function() {
  // Funcție pentru a încărca CSS-ul necesar
  function loadCSS() {
    if (document.getElementById('speek-widget-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'speek-widget-styles';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.tailwindcss.com';
    document.head.appendChild(link);
  }

  // Funcție pentru a crea widget-ul
  function createWidget(agentId) {
    // Verifică dacă widget-ul există deja
    if (document.getElementById('speek-widget-' + agentId)) return;

    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'speek-widget-' + agentId;
    widgetContainer.innerHTML = `
      <div id="speek-widget-${agentId}" class="fixed bottom-4 right-4 z-50 font-sans">
        <button id="speek-toggle-${agentId}" class="bg-white border-2 border-black rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-3">
          <div class="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-bold">S</span>
          </div>
          <span class="text-black font-medium">Need help?</span>
        </button>
        
        <div id="speek-chat-${agentId}" class="bg-white border-2 border-black rounded-lg shadow-xl w-80 h-96 flex-col hidden">
          <!-- Header -->
          <div class="bg-black text-white p-4 rounded-t-md flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span class="text-black text-xs font-bold">S</span>
              </div>
              <span class="font-medium">Speek Assistant</span>
            </div>
            <button id="speek-close-${agentId}" class="text-white hover:text-gray-300 transition-colors">
              ✕
            </button>
          </div>

          <!-- Messages -->
          <div id="speek-messages-${agentId}" class="flex-1 p-4 overflow-y-auto space-y-3">
            <div class="flex justify-start">
              <div class="bg-gray-100 text-black border border-gray-200 p-3 rounded-lg text-sm max-w-xs">
                Salut! Sunt asistentul tău AI. Cum te pot ajuta?
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="border-t border-gray-200 p-4">
            <div class="flex space-x-2">
              <input
                type="text"
                id="speek-input-${agentId}"
                placeholder="Scrie mesajul tău..."
                class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                id="speek-send-${agentId}"
                class="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widgetContainer);

    // Event listeners
    const toggleBtn = document.getElementById('speek-toggle-' + agentId);
    const closeBtn = document.getElementById('speek-close-' + agentId);
    const chatDiv = document.getElementById('speek-chat-' + agentId);
    const sendBtn = document.getElementById('speek-send-' + agentId);
    const input = document.getElementById('speek-input-' + agentId);
    const messagesDiv = document.getElementById('speek-messages-' + agentId);

    toggleBtn.addEventListener('click', function() {
      toggleBtn.style.display = 'none';
      chatDiv.style.display = 'flex';
    });

    closeBtn.addEventListener('click', function() {
      chatDiv.style.display = 'none';
      toggleBtn.style.display = 'flex';
    });

    function sendMessage() {
      const message = input.value.trim();
      if (!message) return;

      // Adaugă mesajul utilizatorului
      const userMsgDiv = document.createElement('div');
      userMsgDiv.className = 'flex justify-end';
      userMsgDiv.innerHTML = `
        <div class="bg-black text-white p-3 rounded-lg text-sm max-w-xs">
          ${message}
        </div>
      `;
      messagesDiv.appendChild(userMsgDiv);

      input.value = '';

      // Simulează răspuns bot
      setTimeout(function() {
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'flex justify-start';
        botMsgDiv.innerHTML = `
          <div class="bg-gray-100 text-black border border-gray-200 p-3 rounded-lg text-sm max-w-xs">
            Mulțumesc pentru mesaj! Aceasta este o versiune demo a widget-ului nostru Speek.
          </div>
        `;
        messagesDiv.appendChild(botMsgDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }, 1000);

      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  // Inițializează widget-ul când DOM-ul este gata
  function initWidget() {
    loadCSS();
    
    // Găsește toate elementele speek-convai
    const widgets = document.querySelectorAll('speek-convai');
    widgets.forEach(function(widget) {
      const agentId = widget.getAttribute('agent-id');
      if (agentId) {
        createWidget(agentId);
      }
    });
  }

  // Pornește inițializarea
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
