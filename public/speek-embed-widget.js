
(function() {
  // Găsește toate elementele speek-convai de pe pagină
  const speekElements = document.querySelectorAll('speek-convai');
  
  speekElements.forEach(function(element) {
    const agentId = element.getAttribute('agent-id');
    const agentName = element.getAttribute('agent-name') || 'Agent AI';
    
    if (!agentId) {
      console.error('speek-convai: agent-id este necesar');
      return;
    }

    // Creează widgetul
    const widget = document.createElement('div');
    widget.id = 'speek-widget-' + agentId;
    widget.innerHTML = `
      <div style="
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
      ">
        <img 
          src="https://cdn.jsdelivr.net/gh/yourusername/speek-assets@main/logo.png" 
          alt="Speek Logo" 
          style="width: 32px; height: 32px; border-radius: 50%;"
        />
        <div style="display: flex; flex-direction: column; font-size: 14px;">
          <strong style="color: black;">Ai nevoie de ajutor?</strong>
          <span style="color: #666; font-size: 12px;">Vorbește cu ${agentName}</span>
        </div>
        <button 
          onclick="startSpeekCall('${agentId}')" 
          style="
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
          "
          onmouseover="this.style.backgroundColor='#222'"
          onmouseout="this.style.backgroundColor='black'"
        >
          📞 Start apel
        </button>
      </div>
    `;

    // Adaugă widgetul în body
    document.body.appendChild(widget);
    
    // Ascunde elementul original
    element.style.display = 'none';
  });

  // Funcția globală pentru pornirea apelului
  window.startSpeekCall = function(agentId) {
    console.log('Se pornește apelul cu agentul:', agentId);
    
    // Aici poți adăuga logica pentru chat/video
    // De exemplu:
    // window.open(`https://your-domain.com/chat?agent=${agentId}`, '_blank');
    // sau deschide un modal cu chat
    
    alert('Se pornește apelul cu agentul: ' + agentId);
  };
})();
