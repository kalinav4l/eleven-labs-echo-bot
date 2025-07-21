const io = require('socket.io-client');

// Test the complete audio conversation flow
async function testAudioConversation() {
    console.log('🧪 Testing complete audio conversation flow...');
    
    try {
        // Step 1: Start conversation
        console.log('1. Starting conversation...');
        const response = await fetch('http://localhost:8081/api/start-conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voiceId: 'hnrrfdVZhpEHlvvBppOW' })
        });
        
        const conversationData = await response.json();
        console.log('✅ Conversation started:', conversationData.conversation_id);
        
        // Step 2: Connect to Socket.IO
        console.log('2. Connecting to Socket.IO...');
        const socket = io('http://localhost:8081');
        
        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            
            // Join conversation
            socket.emit('join-conversation', {
                conversationId: conversationData.conversation_id,
                voiceId: 'hnrrfdVZhpEHlvvBppOW'
            });
        });
        
        socket.on('conversation-ready', (data) => {
            console.log('✅ Conversation ready:', data);
            
            // Step 3: Send test audio
            console.log('3. Sending test audio...');
            const testAudioData = 'dGVzdCBhdWRpbyBkYXRh'; // base64 for "test audio data"
            
            socket.emit('send-audio', {
                audioData: testAudioData
            });
        });
        
        socket.on('ai-message', (data) => {
            console.log('🎵 AI message received:');
            console.log('  Type:', data.type);
            console.log('  Agent:', data.agent);
            console.log('  Transcript:', data.transcript);
            console.log('  Message:', data.message);
            console.log('  Has audio data:', !!data.audio_data);
            console.log('  Audio data length:', data.audio_data ? data.audio_data.length : 0);
            
            if (data.audio_data) {
                console.log('✅ SUCCESS: Audio data received! The voice system is working.');
            } else {
                console.log('❌ No audio data in response');
            }
            
            // Close after test
            socket.disconnect();
            process.exit(0);
        });
        
        socket.on('conversation-error', (error) => {
            console.error('❌ Conversation error:', error);
            socket.disconnect();
            process.exit(1);
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
testAudioConversation();
