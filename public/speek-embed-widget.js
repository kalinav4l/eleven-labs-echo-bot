
class SpeekConvai extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
    this.messages = [];
    this.isListening = false;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.apiBaseUrl = 'https://pwfczzxwjfxomqzhhwvj.functions.supabase.co';
  }

  connectedCallback() {
    const agentId = this.getAttribute('agent-id') || 'default';
    const agentName = this.getAttribute('agent-name') || 'Agent AI';
    
    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
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
          z-index: 999999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          max-width: 320px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        
        #widget:hover {
          transform: scale(1.02);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        }
        
        #widget img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }
        
        .text {
          display: flex;
          flex-direction: column;
          font-size: 14px;
          min-width: 0;
          flex: 1;
        }
        
        .text strong {
          color: #1a1a1a;
          margin-bottom: 2px;
          font-weight: 600;
        }
        
        .text span {
          color: #666;
          font-size: 12px;
        }
        
        button {
          background-color: #1a1a1a;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
          flex-shrink: 0;
          font-family: inherit;
        }
        
        button:hover {
          background-color: #333;
          transform: translateY(-1px);
        }
        
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        
        /* Modal Styles */
        #modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1000000;
          display: none;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          backdrop-filter: blur(4px);
        }
        
        #modal.open {
          display: flex;
        }
        
        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          height: 80vh;
          max-height: 650px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
          overflow: hidden;
        }
        
        .modal-header {
          padding: 24px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .modal-header h3 {
          margin: 0;
          color: #1a1a1a;
          font-size: 18px;
          font-weight: 600;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          color: #666;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .close-btn:hover {
          color: #1a1a1a;
          background: rgba(0, 0, 0, 0.1);
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #fafbfc;
        }
        
        .message {
          max-width: 85%;
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          animation: messageSlide 0.3s ease-out;
        }
        
        @keyframes messageSlide {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .message.user {
          background: #1a1a1a;
          color: white;
          align-self: flex-end;
          border-bottom-right-radius: 6px;
        }
        
        .message.assistant {
          background: white;
          color: #1a1a1a;
          align-self: flex-start;
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .message-time {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 6px;
        }
        
        .input-container {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 12px;
          background: white;
        }
        
        .text-input {
          flex: 1;
          padding: 14px 18px;
          border: 2px solid #e1e5e9;
          border-radius: 25px;
          font-size: 14px;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s ease;
        }
        
        .text-input:focus {
          border-color: #1a1a1a;
        }
        
        .text-input::placeholder {
          color: #999;
        }
        
        .voice-controls {
          display: flex;
          justify-content: center;
          padding: 20px;
          border-top: 1px solid #eee;
          background: white;
        }
        
        .voice-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        .voice-btn.listening {
          background: linear-gradient(135deg, #ff4757 0%, #ff3838 100%);
          color: white;
          animation: pulse 2s infinite;
          box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4);
        }
        
        .voice-btn:not(.listening) {
          background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
          color: white;
        }
        
        .voice-btn:not(.listening):hover {
          background: linear-gradient(135deg, #333 0%, #555 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }
        
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 6px 25px rgba(255, 71, 87, 0.6); }
          100% { transform: scale(1); box-shadow: 0 4px 20px rgba(255, 71, 87, 0.4); }
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
        
        .empty-state p {
          margin-bottom: 8px;
        }
        
        .loading {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          background: white;
          border-radius: 18px;
          align-self: flex-start;
          font-size: 14px;
          color: #666;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(0, 0, 0, 0.05);
          animation: messageSlide 0.3s ease-out;
        }
        
        .loading-dots {
          display: flex;
          gap: 4px;
        }
        
        .loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #1a1a1a;
          animation: loadingDot 1.4s infinite ease-in-out;
        }
        
        .loading-dot:nth-child(1) { animation-delay: -0.32s; }
        .loading-dot:nth-child(2) { animation-delay: -0.16s; }
        .loading-dot:nth-child(3) { animation-delay: 0s; }
        
        @keyframes loadingDot {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        @media (max-width: 640px) {
          #widget {
            bottom: 15px;
            right: 15px;
            max-width: 280px;
            padding: 12px;
          }
          
          .modal-content {
            width: 95%;
            height: 85vh;
            margin: 10px;
          }
          
          .modal-header {
            padding: 20px;
          }
          
          .messages-container {
            padding: 15px;
          }
          
          .input-container {
            padding: 15px;
          }
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
              <p>🎙️ Începe o conversație cu ${agentName}</p>
              <p style="font-size: 12px; margin-top: 8px; opacity: 0.7;">Folosește microfonul sau scrie un mesaj</p>
            </div>
          </div>
          
          <div class="voice-controls">
            <button class="voice-btn" id="voiceBtn" title="Apasă pentru a vorbi">🎤</button>
          </div>
          
          <div class="input-container">
            <input type="text" class="text-input" id="textInput" placeholder="Scrie un mesaj..." />
            <button id="sendBtn">Trimite</button>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners(agentId, agentName);
    console.log(`Speek Widget initialized for agent: ${agentId} (${agentName})`);
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
    
    // Focus pe input după o scurtă întârziere
    setTimeout(() => {
      const textInput = this.shadowRoot.querySelector('#textInput');
      textInput?.focus();
    }, 150);
    
    console.log('Modal opened');
  }

  closeModal() {
    const modal = this.shadowRoot.querySelector('#modal');
    modal.classList.remove('open');
    this.isOpen = false;
    
    // Stop voice recording dacă este activ
    if (this.isListening) {
      this.stopVoiceRecording();
    }
    
    console.log('Modal closed');
  }

  addMessage(text, isUser, agentName) {
    const messagesContainer = this.shadowRoot.querySelector('#messagesContainer');
    const emptyState = messagesContainer.querySelector('.empty-state');
    
    if (emptyState) {
      emptyState.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    const time = new Date().toLocaleTimeString('ro-RO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    messageEl.innerHTML = `
      <div>${text}</div>
      <div class="message-time">${time}</div>
    `;

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    this.messages.push({
      text,
      isUser,
      timestamp: new Date()
    });

    console.log(`Message added: ${isUser ? 'User' : agentName} - ${text.substring(0, 50)}...`);
  }

  showLoading() {
    const messagesContainer = this.shadowRoot.querySelector('#messagesContainer');
    const loadingEl = document.createElement('div');
    loadingEl.className = 'loading';
    loadingEl.id = 'loadingMessage';
    loadingEl.innerHTML = `
      <span>Scriu răspunsul</span>
      <div class="loading-dots">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `;
    
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
      console.log(`Sending message to agent ${agentId}: ${message}`);
      
      const response = await fetch(`${this.apiBaseUrl}/chat-with-gpt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          agentName: agentName,
          agentId: agentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      this.hideLoading();

      if (data.response) {
        this.addMessage(data.response, false, agentName);
      } else {
        this.addMessage('Scuze, am întâmpinat o problemă. Te rog încearcă din nou.', false, agentName);
        console.error('No response from API:', data);
      }
    } catch (error) {
      this.hideLoading();
      console.error('Error sending message:', error);
      this.addMessage('Scuze, am întâmpinat o problemă de conexiune. Verifică conexiunea la internet.', false, agentName);
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
      console.log('Starting voice recording...');
      
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
      voiceBtn.title = 'Apasă pentru a opri înregistrarea';

      console.log('Voice recording started');

    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Nu pot accesa microfonul. Te rog verifică permisiunile browserului pentru microfon.');
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
    voiceBtn.title = 'Apasă pentru a vorbi';
    
    console.log('Voice recording stopped');
  }

  async processVoiceInput(audioBlob, agentId, agentName) {
    this.showLoading();

    try {
      console.log('Processing voice input...');
      
      // Convert audioBlob to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        try {
          // Speech to text
          console.log('Converting speech to text...');
          const sttResponse = await fetch(`${this.apiBaseUrl}/speech-to-text`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audio: base64Audio })
          });

          if (!sttResponse.ok) {
            throw new Error(`STT error! status: ${sttResponse.status}`);
          }

          const sttData = await sttResponse.json();
          const userText = sttData.text || 'Nu am înțeles';
          
          console.log('Transcribed text:', userText);
          
          this.hideLoading();
          this.addMessage(userText, true, agentName);

          // Generate AI response
          console.log('Generating AI response...');
          this.showLoading();
          
          const chatResponse = await fetch(`${this.apiBaseUrl}/chat-with-gpt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: userText,
              agentName: agentName,
              agentId: agentId
            })
          });

          if (!chatResponse.ok) {
            throw new Error(`Chat error! status: ${chatResponse.status}`);
          }

          const chatData = await chatResponse.json();
          this.hideLoading();
          
          if (chatData.response) {
            this.addMessage(chatData.response, false, agentName);
            
            // Text to speech
            try {
              console.log('Converting text to speech...');
              const ttsResponse = await fetch(`${this.apiBaseUrl}/text-to-speech`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  text: chatData.response,
                  voice: 'onwK4e9ZLuTAKqWW03F9' // Daniel voice
                })
              });

              if (ttsResponse.ok) {
                const ttsData = await ttsResponse.json();
                if (ttsData.audioContent) {
                  this.playAudio(ttsData.audioContent);
                }
              } else {
                console.warn('TTS failed, but continuing without audio');
              }
            } catch (ttsError) {
              console.error('TTS Error:', ttsError);
              // Nu afișăm eroare utilizatorului pentru TTS
            }
          } else {
            this.addMessage('Scuze, am întâmpinat o problemă cu generarea răspunsului.', false, agentName);
          }

        } catch (error) {
          this.hideLoading();
          console.error('Voice processing error:', error);
          this.addMessage('Scuze, am întâmpinat o problemă cu procesarea vocii. Încearcă din nou.', false, agentName);
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
      console.log('Playing audio response...');
      
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
        console.log('Audio playback completed');
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play().catch(error => {
        console.error('Audio play error:', error);
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
  console.log('Speek Convai widget registered successfully');
} else {
  console.log('Speek Convai widget already registered');
}

// Adaugă un event listener pentru a confirma că scriptul s-a încărcat
window.addEventListener('load', () => {
  console.log('Speek Convai widget script loaded successfully');
});
