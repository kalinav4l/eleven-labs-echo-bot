
class SpeekConvai extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const agentId = this.getAttribute('agent-id') || 'default';
    const agentName = this.getAttribute('agent-name') || 'Agent AI';
    
    this.shadowRoot.innerHTML = `
      <style>
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
        }
        img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        .text {
          display: flex;
          flex-direction: column;
          font-size: 14px;
        }
        .text strong {
          color: black;
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
        }
        button:hover {
          background-color: #222;
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
    `;

    const btn = this.shadowRoot.querySelector('#startBtn');
    btn.addEventListener('click', () => this.startCall(agentId));
  }

  startCall(agentId) {
    console.log(`Se pornește apelul cu agentul: ${agentId}`);
    // Aici poți adăuga logica pentru chat/video
    // De exemplu:
    // window.open(`https://your-domain.com/chat?agent=${agentId}`, '_blank');
    // sau deschide un modal cu chat
    
    alert(`Se pornește apelul cu agentul: ${agentId}`);
  }
}

// Verifică dacă elementul nu este deja definit
if (!customElements.get('speek-convai')) {
  customElements.define('speek-convai', SpeekConvai);
}
