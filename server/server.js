const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const WebSocket = require('ws');
const axios = require('axios');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8080;

// Store active WebSocket connections
const activeConnections = new Map();

// Voice options matching frontend
const voiceOptions = [
  { id: 'vrlYThSLKW8zkmzKp6HB', name: 'Lili' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric' },
  { id: 'hnrrfdVZhpEHlvvBppOW', name: 'Kalina' },
  { id: 'YKAmPotHIjfmLzh5daE4', name: 'Andreea' },
  { id: 'kdmDKE6EkgrWrrykO9Qt', name: 'Alexandra' },
  { id: 'GRHbHyXbUO8nF4YexVTa', name: 'Anca' },
  { id: 'sGcPNcpR5PikknzyXcy7', name: 'Cristi' }
];

// Middleware
app.use(cors());
app.use(express.json());

// Demo responses for AI simulation
const demoResponses = [
  'Salut! Sunt Kalina AI. Cum te pot ajuta astăzi?',
  'Înțeleg perfect ceea ce îmi spui. Este foarte interesant!',
  'Da, pot să te ajut cu asta. Să analizez situația...',
  'Perfect! Cred că am o soluție bună pentru tine.',
  'Mulțumesc pentru întrebare. Iată ce propun...',
  'Interesant punct de vedere! Să explorăm asta împreună.',
  'Sunt aici să te ajut cu orice ai nevoie!',
  'Excelentă întrebare! Să vedem ce opțiuni avem.',
  'Înțeleg situația. Pot să îți ofer câteva sugestii.',
  'Foarte bine! Să continuăm conversația.'
];

// API Routes
app.post('/api/start-conversation', async (req, res) => {
  const { voiceId } = req.body;
  
  if (!voiceId) {
    return res.status(400).json({ error: 'Voice ID is required' });
  }

  console.log('Starting conversation with voice ID:', voiceId);

  try {
    // Try to start real ElevenLabs conversation
    const response = await axios.post(
      'https://api.elevenlabs.io/v1/convai/conversation',
      {
        agent_id: process.env.ELEVENLABS_AGENT_ID,
        voice_id: voiceId,
        require_authorization: false,
        conversation_config: {
          audio_encoding: 'pcm_16000',
          audio_channels: 1,
          sample_rate: 16000
        }
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const conversationId = response.data.conversation_id;
    console.log(`✅ Real conversation started: ${conversationId}`);
    
    res.json({
      success: true,
      conversation_id: conversationId,
      voice_id: voiceId,
      demo_mode: false
    });
    
  } catch (error) {
    console.error('❌ ElevenLabs API Error:', error.response?.data || error.message);
    
    // Always fallback to demo mode
    const simulatedId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🎭 Starting DEMO conversation: ${simulatedId} with voice ${voiceId}`);
    
    res.json({
      success: true,
      conversation_id: simulatedId,
      voice_id: voiceId,
      demo_mode: true,
      message: 'Demo mode activated - AI responses will be simulated'
    });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join-conversation', ({ conversationId, voiceId }) => {
    console.log(`👥 Client ${socket.id} joining conversation ${conversationId} with voice ${voiceId}`);
    
    const isDemoMode = conversationId.startsWith('demo_');
    
    if (isDemoMode) {
      // Demo mode
      console.log(`🎭 Demo mode conversation: ${conversationId}`);
      
      activeConnections.set(socket.id, {
        conversationId,
        voiceId,
        isDemoMode: true
      });
      
      socket.emit('conversation-ready', { 
        conversationId, 
        voiceId,
        demo_mode: true 
      });
      
    } else {
      // Real ElevenLabs conversation
      try {
        const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation/${conversationId}/websocket?xi-api-key=${process.env.ELEVENLABS_API_KEY}`;
        const elevenLabsWs = new WebSocket(wsUrl);
        
        activeConnections.set(socket.id, {
          conversationId,
          voiceId,
          elevenLabsWs,
          isDemoMode: false
        });
        
        elevenLabsWs.on('open', () => {
          console.log(`✅ Connected to ElevenLabs WebSocket for conversation ${conversationId}`);
          socket.emit('conversation-ready', { conversationId, voiceId, demo_mode: false });
        });
        
        elevenLabsWs.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            console.log('📨 Received from ElevenLabs:', message.type);
            socket.emit('ai-message', message);
          } catch (error) {
            console.error('❌ Error parsing ElevenLabs message:', error);
          }
        });
        
        elevenLabsWs.on('close', () => {
          console.log(`🔌 ElevenLabs WebSocket closed for conversation ${conversationId}`);
          socket.emit('conversation-ended');
        });
        
        elevenLabsWs.on('error', (error) => {
          console.error('❌ ElevenLabs WebSocket error:', error);
          socket.emit('conversation-error', { error: error.message });
        });
        
      } catch (error) {
        console.error('❌ Error connecting to ElevenLabs WebSocket:', error);
        socket.emit('conversation-error', { error: 'Failed to connect to AI service' });
      }
    }
  });

  // Handle audio data from client
  socket.on('send-audio', ({ audioData }) => {
    const connection = activeConnections.get(socket.id);
    
    if (!connection) {
      console.error('❌ No active connection found for socket:', socket.id);
      return;
    }
    
    if (connection.isDemoMode) {
      // Demo mode - simulate AI response
      console.log(`🎭 Demo: Received audio, simulating AI response...`);
      
      // Simulate processing time
      setTimeout(() => {
        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        
        socket.emit('ai-message', {
          type: 'transcript',
          message: randomResponse,
          demo: true
        });
        
        console.log(`🎭 Demo response sent: "${randomResponse}"`);
      }, 800 + Math.random() * 1500); // Random delay 0.8-2.3 seconds
      
    } else {
      // Real ElevenLabs WebSocket
      if (connection.elevenLabsWs && connection.elevenLabsWs.readyState === WebSocket.OPEN) {
        const audioMessage = JSON.stringify({
          type: 'audio',
          audio_data: audioData
        });
        
        connection.elevenLabsWs.send(audioMessage);
        console.log('📤 Audio data forwarded to ElevenLabs');
      } else {
        console.error('❌ ElevenLabs WebSocket not ready');
        socket.emit('conversation-error', { error: 'AI service not available' });
      }
    }
  });

  // Handle conversation end
  socket.on('end-conversation', () => {
    const connection = activeConnections.get(socket.id);
    
    if (connection) {
      if (connection.elevenLabsWs) {
        connection.elevenLabsWs.close();
      }
      activeConnections.delete(socket.id);
      console.log(`🔚 Conversation ended for client ${socket.id}`);
    }
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    const connection = activeConnections.get(socket.id);
    
    if (connection && connection.elevenLabsWs) {
      connection.elevenLabsWs.close();
    }
    
    activeConnections.delete(socket.id);
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    active_connections: activeConnections.size,
    demo_mode: !process.env.ELEVENLABS_API_KEY
  });
});

// Get available voices
app.get('/api/voices', (req, res) => {
  res.json(voiceOptions);
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Kalina AI Server running on port ${PORT}`);
  console.log(`📡 Socket.IO endpoint: ws://localhost:${PORT}`);
  console.log(`🎯 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🎭 Demo mode: ${!process.env.ELEVENLABS_API_KEY ? 'ENABLED' : 'Available as fallback'}`);
});
