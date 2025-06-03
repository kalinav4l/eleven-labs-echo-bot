
class SpeekConvai extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
    this.messages = [];
    this.isListening = false;
    this.mediaRecorder = null;
    this.audioContext = null;
  }

  connectedCallback() {
    const agentId = this.getAttribute('agent-id') || 'default';
    const agentName = this.getAttribute('agent-name') || 'Agent AI';
    
    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
        }
        
        #widget {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 9999;
          font-family: Arial, sans-serif;
          max-width: 320px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        #widget:hover {
          transform: scale(1.02);
        }
        
        #widget img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .text {
          display: flex;
          flex-direction: column;
          font-size: 14px;
        }
        
        .text strong {
          color: black;
          margin-bottom: 2px;
        }
        
        .text span {
          color: #666;
          font-size: 12px;
        }
        
        button {
          background-color: black;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background-color 0.2s;
        }
        
        button:hover {
          background-color: #222;
        }
        
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        /* Modal Styles */
        #modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 10000;
          display: none;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
        }
        
        #modal.open {
          display: flex;
        }
        
        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          height: 600px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h3 {
          margin: 0;
          color: black;
          font-size: 18px;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          color: #666;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .close-btn:hover {
          color: black;
          background: #f5f5f5;
          border-radius: 4px;
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .message {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .message.user {
          background: black;
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        
        .message.assistant {
          background: #f1f1f1;
          color: black;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        
        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 4px;
        }
        
        .input-container {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 12px;
        }
        
        .text-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          font-family: Arial, sans-serif;
        }
        
        .text-input:focus {
          border-color: black;
        }
        
        .voice-controls {
          display: flex;
          justify-content: center;
          padding: 20px;
          border-top: 1px solid #eee;
        }
        
        .voice-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: all 0.2s;
        }
        
        .voice-btn.listening {
          background: #ff4444;
          animation: pulse 1.5s infinite;
        }
        
        .voice-btn:not(.listening) {
          background: black;
          color: white;
        }
        
        .voice-btn:not(.listening):hover {
          background: #333;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #666;
          text-align: center;
          padding: 40px;
        }
        
        .loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #f1f1f1;
          border-radius: 12px;
          align-self: flex-start;
          font-size: 14px;
          color: #666;
        }
        
        .loading::after {
          content: '...';
          animation: dots 1.5s infinite;
        }
        
        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
      </style>
      
      <div id="widget">
        <img src="https://ik.imagekit.io/2eeuoo797/Group%2064.png?updatedAt=1748951277306" alt="Speek Logo" />
        <div class="text">
          <strong>Ai nevoie de ajutor?</strong>
          <span>Vorbește cu ${agentName}</span>
        </div>
        <button id="startBtn">📞 Start apel</button>
      </div>
      
      <div id="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Chat cu ${agentName}</h3>
            <button class="close-btn">×</button>
          </div>
          
          <div class="messages-container" id="messagesContainer">
            <div class="empty-state">
              <p>Începe o conversație cu ${agentName}</p>
              <p style="font-size: 12px; margin-top: 8px;">Folosește microfonul sau scrie un mesaj</p>
            </div>
          </div>
          
          <div class="voice-controls">
            <button class="voice-btn" id="voiceBtn">🎤</button>
          </div>
          
          <div class="input-container">
            <input type="text" class="text-input" id="textInput" placeholder="Scrie un mesaj..." />
            <button id="sendBtn">Trimite</button>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners(agentId, agentName);
  }

  setupEventListeners(agentId, agentName) {
    const widget = this.shadowRoot.querySelector('#widget');
    const modal = this.shadowRoot.querySelector('#modal');
    const closeBtn = this.shadowRoot.querySelector('.close-btn');
    const textInput = this.shadowRoot.querySelector('#textInput');
    const sendBtn = this.shadowRoot.querySelector('#sendBtn');
    const voiceBtn = this.shadowRoot.querySelector('#voiceBtn');

    widget.addEventListener('click', () => this.openModal());
    closeBtn.addEventListener('click', () => this.closeModal());
    sendBtn.addEventListener('click', () => this.sendTextMessage(agentId, agentName));
    voiceBtn.addEventListener('click', () => this.toggleVoiceRecording(agentId, agentName));
    
    textInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendTextMessage(agentId, agentName);
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
  }

  openModal() {
    const modal = this.shadowRoot.querySelector('#modal');
    modal.classList.add('open');
    this.isOpen = true;
    
    // Focus pe input
    setTimeout(() => {
      const textInput = this.shadowRoot.querySelector('#textInput');
      textInput?.focus();
    }, 100);
  }

  closeModal() {
    const modal = this.shadowRoot.querySelector('#modal');
    modal.classList.remove('open');
    this.isOpen = false;
    
    // Stop voice recording dacă este activ
    if (this.isListening) {
      this.stopVoiceRecording();
    }
  }

  addMessage(text, isUser, agentName) {
    const messagesContainer = this.shadowRoot.querySelector('#messagesContainer');
    const emptyState = messagesContainer.querySelector('.empty-state');
    
    if (emptyState) {
      emptyState.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = \`message \${isUser ? 'user' : 'assistant'}\`;
    
    const time = new Date().toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    messageEl.innerHTML = \`
      <div>\${text}</div>
      <div class="message-time">\${time}</div>
    \`;

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    this.messages.push({
      text,
      isUser,
      timestamp: new Date()
    });
  }

  showLoading() {
    const messagesContainer = this.shadowRoot.querySelector('#messagesContainer');
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading';
    loadingEl.id = 'loadingMessage';
    loadingEl.textContent = 'Scriu răspunsul';
    
    messagesContainer.appendChild(loadingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideLoading() {
    const loadingEl = this.shadowRoot.querySelector('#loadingMessage');
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  async sendTextMessage(agentId, agentName) {
    const textInput = this.shadowRoot.querySelector('#textInput');
    const message = textInput.value.trim();
    
    if (!message) return;

    // Adaugă mesajul utilizatorului
    this.addMessage(message, true, agentName);
    textInput.value = '';

    // Afișează loading
    this.showLoading();

    try {
      // Simulează răspuns AI cu GPT
      const response = await fetch('https://pwfczzxwjfxomqzhhwvj.functions.supabase.co/chat-with-gpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          agentName: agentName
        })
      });

      const data = await response.json();
      
      this.hideLoading();

      if (data.response) {
        this.addMessage(data.response, false, agentName);
      } else {
        this.addMessage('Scuze, am întâmpinat o problemă. Te rog încearcă din nou.', false, agentName);
      }
    } catch (error) {
      this.hideLoading();
      console.error('Error sending message:', error);
      this.addMessage('Scuze, am întâmpinat o problemă de conexiune.', false, agentName);
    }
  }

  async toggleVoiceRecording(agentId, agentName) {
    if (this.isListening) {
      this.stopVoiceRecording();
    } else {
      await this.startVoiceRecording(agentId, agentName);
    }
  }

  async startVoiceRecording(agentId, agentName) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm;codecs=opus' 
      });
      
      const audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await this.processVoiceInput(audioBlob, agentId, agentName);
        
        // Oprește stream-ul
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isListening = true;
      
      const voiceBtn = this.shadowRoot.querySelector('#voiceBtn');
      voiceBtn.classList.add('listening');
      voiceBtn.textContent = '🛑';

    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Nu pot accesa microfonul. Te rog verifică permisiunile.');
    }
  }

  stopVoiceRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    this.isListening = false;
    const voiceBtn = this.shadowRoot.querySelector('#voiceBtn');
    voiceBtn.classList.remove('listening');
    voiceBtn.textContent = '🎤';
  }

  async processVoiceInput(audioBlob, agentId, agentName) {
    this.showLoading();

    try {
      // Convert audioBlob to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        try {
          // Speech to text
          const sttResponse = await fetch('https://pwfczzxwjfxomqzhhwvj.functions.supabase.co/speech-to-text', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audio: base64Audio })
          });

          const sttData = await sttResponse.json();
          const userText = sttData.text || 'Nu am înțeles';
          
          this.hideLoading();
          this.addMessage(userText, true, agentName);

          // Generate AI response
          this.showLoading();
          const chatResponse = await fetch('https://pwfczzxwjfxomqzhhwvj.functions.supabase.co/chat-with-gpt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: userText,
              agentName: agentName
            })
          });

          const chatData = await chatResponse.json();
          this.hideLoading();
          
          if (chatData.response) {
            this.addMessage(chatData.response, false, agentName);
            
            // Text to speech
            try {
              const ttsResponse = await fetch('https://pwfczzxwjfxomqzhhwvj.functions.supabase.co/text-to-speech', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  text: chatData.response,
                  voice: 'onwK4e9ZLuTAKqWW03F9' // Daniel voice
                })
              });

              const ttsData = await ttsResponse.json();
              if (ttsData.audioContent) {
                this.playAudio(ttsData.audioContent);
              }
            } catch (ttsError) {
              console.error('TTS Error:', ttsError);
            }
          }

        } catch (error) {
          this.hideLoading();
          console.error('Voice processing error:', error);
          this.addMessage('Scuze, am întâmpinat o problemă cu procesarea vocii.', false, agentName);
        }
      };
      
      reader.readAsDataURL(audioBlob);

    } catch (error) {
      this.hideLoading();
      console.error('Error processing voice input:', error);
      this.addMessage('Scuze, am întâmpinat o problemă tehnică.', false, agentName);
    }
  }

  playAudio(base64Audio) {
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play().catch(error => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }
}

// Verifică dacă elementul nu este deja definit
if (!customElements.get('speek-convai')) {
  customElements.define('speek-convai', SpeekConvai);
}
