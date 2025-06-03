
(function() {
  // Configurare widget
  const WIDGET_CONFIG = {
    agentId: 'agent_01jws2mjsjeh398vfnfd6k5hq0', // Setează agent ID-ul aici
    position: 'bottom-right'
  };

  // Verifică dacă widget-ul a fost deja inițializat
  if (window.BoreaWidgetLoaded) {
    return;
  }
  window.BoreaWidgetLoaded = true;

  // Creează stilurile CSS pentru widget
  const styles = `
    #borea-voice-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    #borea-call-button {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    #borea-call-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 25px rgba(0,0,0,0.2);
    }
    
    #borea-call-button.calling {
      background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
      animation: pulse 2s infinite;
    }
    
    #borea-call-button.speaking {
      background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
      animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7); }
      70% { box-shadow: 0 0 0 20px rgba(102, 126, 234, 0); }
      100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
    }
    
    #borea-call-button svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    
    #borea-voice-status {
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 300px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      display: none;
      padding: 20px;
      z-index: 999999;
    }
    
    #borea-status-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    #borea-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }
    
    #borea-status-text {
      flex: 1;
    }
    
    #borea-status-title {
      font-weight: 600;
      font-size: 16px;
      color: #333;
      margin: 0;
    }
    
    #borea-status-subtitle {
      font-size: 14px;
      color: #666;
      margin: 4px 0 0 0;
    }
    
    #borea-end-call {
      background: #e53e3e;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    
    #borea-end-call:hover {
      background: #c53030;
    }
    
    #borea-wave-animation {
      height: 40px;
      margin: 16px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
    }
    
    .borea-wave-bar {
      width: 4px;
      background: #667eea;
      border-radius: 2px;
      animation: wave 1.5s ease-in-out infinite;
    }
    
    .borea-wave-bar:nth-child(1) { height: 10px; animation-delay: 0s; }
    .borea-wave-bar:nth-child(2) { height: 20px; animation-delay: 0.1s; }
    .borea-wave-bar:nth-child(3) { height: 15px; animation-delay: 0.2s; }
    .borea-wave-bar:nth-child(4) { height: 25px; animation-delay: 0.3s; }
    .borea-wave-bar:nth-child(5) { height: 12px; animation-delay: 0.4s; }
    
    @keyframes wave {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.3); }
    }
    
    @media (max-width: 480px) {
      #borea-voice-status {
        width: calc(100vw - 40px);
        right: 20px;
        bottom: 100px;
      }
    }
  `;

  // Adaugă stilurile în document
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Creează HTML-ul widget-ului
  const widgetHTML = `
    <div id="borea-voice-widget">
      <button id="borea-call-button">
        <svg viewBox="0 0 24 24">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      </button>
      
      <div id="borea-voice-status">
        <div id="borea-status-header">
          <div id="borea-avatar">B</div>
          <div id="borea-status-text">
            <h3 id="borea-status-title">Borea AI</h3>
            <p id="borea-status-subtitle">Inițializare...</p>
          </div>
          <button id="borea-end-call">Închide</button>
        </div>
        
        <div id="borea-wave-animation">
          <div class="borea-wave-bar"></div>
          <div class="borea-wave-bar"></div>
          <div class="borea-wave-bar"></div>
          <div class="borea-wave-bar"></div>
          <div class="borea-wave-bar"></div>
        </div>
      </div>
    </div>
  `;

  // Adaugă widget-ul în pagină
  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  // Variabile pentru funcționalitatea vocală
  let isCallActive = false;
  let isListening = false;
  let isSpeaking = false;
  let mediaRecorder = null;
  let audioStream = null;
  let audioContext = null;

  // Elemente DOM
  const callButton = document.getElementById('borea-call-button');
  const statusWindow = document.getElementById('borea-voice-status');
  const endCallButton = document.getElementById('borea-end-call');
  const statusTitle = document.getElementById('borea-status-title');
  const statusSubtitle = document.getElementById('borea-status-subtitle');

  // Funcții helper
  function updateStatus(title, subtitle) {
    statusTitle.textContent = title;
    statusSubtitle.textContent = subtitle;
  }

  function updateButtonState(state) {
    callButton.className = '';
    callButton.classList.add(state);
  }

  async function startCall() {
    if (isCallActive) {
      endCall();
      return;
    }

    try {
      isCallActive = true;
      statusWindow.style.display = 'block';
      updateButtonState('calling');
      updateStatus('Borea AI', 'Conectare...');

      // Solicită permisiunea pentru microfon
      audioStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      updateStatus('Borea AI', 'Conectat - Vorbește acum');
      updateButtonState('speaking');

      // Simulează procesarea vocii
      startVoiceProcessing();

    } catch (error) {
      console.error('Eroare la inițierea apelului:', error);
      updateStatus('Borea AI', 'Eroare: Microfon inaccesibil');
      endCall();
    }
  }

  function startVoiceProcessing() {
    // Simulează detectarea vocii și răspunsul
    let isUserSpeaking = false;
    
    const voiceDetectionInterval = setInterval(() => {
      if (!isCallActive) {
        clearInterval(voiceDetectionInterval);
        return;
      }

      // Simulează detectarea vocii utilizatorului
      if (Math.random() > 0.8 && !isUserSpeaking && !isSpeaking) {
        isUserSpeaking = true;
        isListening = true;
        updateStatus('Borea AI', 'Te ascult...');
        
        setTimeout(() => {
          if (isCallActive) {
            isUserSpeaking = false;
            isListening = false;
            processUserInput();
          }
        }, 2000 + Math.random() * 3000);
      }
    }, 1000);
  }

  async function processUserInput() {
    if (!isCallActive) return;

    isSpeaking = true;
    updateStatus('Borea AI', 'Răspund...');

    try {
      // Simulează trimiterea la API și primirea răspunsului
      const response = await fetch(`${window.location.origin}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Utilizatorul a vorbit',
          agentId: WIDGET_CONFIG.agentId,
          isVoiceCall: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Simulează redarea audio
        updateStatus('Borea AI', 'Vorbesc...');
        
        setTimeout(() => {
          if (isCallActive) {
            isSpeaking = false;
            updateStatus('Borea AI', 'Te ascult...');
          }
        }, 3000 + Math.random() * 2000);
      }
    } catch (error) {
      console.error('Eroare la procesarea input-ului:', error);
      updateStatus('Borea AI', 'Eroare de conexiune');
    }

    isSpeaking = false;
  }

  function endCall() {
    isCallActive = false;
    isListening = false;
    isSpeaking = false;

    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      audioStream = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    statusWindow.style.display = 'none';
    updateButtonState('');
    updateStatus('Borea AI', 'Apel încheiat');
  }

  // Event listeners
  callButton.addEventListener('click', startCall);
  endCallButton.addEventListener('click', endCall);

  // Mesaj de succes în consolă
  console.log('Borea Voice Widget loaded successfully!');
})();
