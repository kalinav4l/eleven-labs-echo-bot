import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Mic, Phone, MessageSquare } from 'lucide-react';

const Demo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentDemo, setCurrentDemo] = useState(0);
  
  const demoData = [
    {
      title: "Customer Support Agent",
      description: "Handle customer inquiries with natural conversation",
      transcript: [
        { role: "customer", text: "Hi, I need help with my order status" },
        { role: "agent", text: "I'd be happy to help you check your order status. Could you please provide your order number?" },
        { role: "customer", text: "It's #12345" },
        { role: "agent", text: "Thank you! I can see your order is currently being prepared and will ship tomorrow. You'll receive tracking information via email." }
      ],
      metrics: {
        "Response Time": "< 2 seconds",
        "Accuracy": "99.2%",
        "Customer Satisfaction": "4.8/5"
      }
    },
    {
      title: "Sales Assistant",
      description: "Convert leads into customers with personalized pitches",
      transcript: [
        { role: "customer", text: "I'm interested in your product but have some questions" },
        { role: "agent", text: "Excellent! I'd love to help you find the perfect solution. What specific challenges are you looking to solve?" },
        { role: "customer", text: "We need to improve our customer response times" },
        { role: "agent", text: "Perfect! Our AI agents can reduce response times by up to 90%. Would you like to see how this works with a personalized demo?" }
      ],
      metrics: {
        "Conversion Rate": "32%",
        "Lead Qualification": "95%",
        "Revenue Impact": "+$150K/month"
      }
    },
    {
      title: "Appointment Scheduler",
      description: "Automate scheduling with smart calendar integration",
      transcript: [
        { role: "customer", text: "I'd like to schedule a consultation" },
        { role: "agent", text: "I'd be happy to schedule that for you. What type of consultation are you looking for?" },
        { role: "customer", text: "A product demo, preferably next week" },
        { role: "agent", text: "I have several slots available next week. Would Tuesday at 2 PM or Thursday at 10 AM work better for you?" }
      ],
      metrics: {
        "Booking Rate": "78%",
        "No-shows": "-65%",
        "Time Saved": "20 hours/week"
      }
    }
  ];

  const currentDemoData = demoData[currentDemo];

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <section id="demo" className="section-padding bg-gradient-to-br from-[var(--brand-100)] to-white">
      <div className="container-width px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            See AI Voice Agents in Action
          </h2>
          <p className="text-xl text-[var(--brand-300)] max-w-3xl mx-auto">
            Experience how our AI agents handle real conversations with natural language understanding and human-like responses.
          </p>
        </div>

        {/* Demo Selection Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {demoData.map((demo, index) => (
            <button
              key={index}
              onClick={() => setCurrentDemo(index)}
              className={`px-6 py-3 rounded-xl font-medium transition-all btn-magnetic ${
                currentDemo === index
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {demo.title}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Demo Player */}
          <div className="space-y-6">
            {/* Video/Audio Player Mockup */}
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="morph-shape-1 w-full h-full"></div>
              </div>
              
              <div className="relative z-10">
                {/* Player Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[var(--brand-300)]">
                    <Phone className="w-4 h-4" />
                    <span>Live Call Simulation</span>
                  </div>
                </div>

                {/* Waveform Visualization */}
                <div className="mb-8">
                  <div className="flex items-center justify-center h-32 bg-gradient-to-r from-[var(--brand-100)] to-[var(--brand-200)] rounded-xl">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className={`bg-[var(--brand-400)] rounded-full transition-all duration-75 ${
                            isPlaying ? 'animate-pulse' : ''
                          }`}
                          style={{
                            width: '3px',
                            height: `${Math.random() * 60 + 10}px`,
                            animationDelay: `${i * 50}ms`,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlayback}
                      className="btn-primary w-12 h-12 rounded-full flex items-center justify-center btn-magnetic"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                    </button>
                    
                    <button
                      onClick={toggleMute}
                      className="btn-secondary w-10 h-10 rounded-full flex items-center justify-center btn-magnetic"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-[var(--brand-300)]">
                    <Mic className={`w-4 h-4 ${isPlaying ? 'text-green-500 animate-pulse' : ''}`} />
                    <span>AI Agent Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Info */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-xl font-semibold text-[var(--brand-400)] mb-2">
                {currentDemoData.title}
              </h3>
              <p className="text-[var(--brand-300)]">
                {currentDemoData.description}
              </p>
            </div>
          </div>

          {/* Conversation Transcript */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 h-96 overflow-y-auto custom-scrollbar">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="w-5 h-5 text-[var(--brand-300)]" />
                <span className="font-medium text-[var(--brand-400)]">Live Conversation</span>
              </div>
              
              <div className="space-y-4">
                {currentDemoData.transcript.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'customer' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-xl ${
                        message.role === 'customer'
                          ? 'bg-white border border-[var(--brand-200)] text-[var(--brand-400)]'
                          : 'btn-primary text-white'
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">
                        {message.role === 'customer' ? 'Customer' : 'AI Agent'}
                      </div>
                      <div className="text-sm">{message.text}</div>
                    </div>
                  </div>
                ))}
                
                {isPlaying && (
                  <div className="flex justify-end">
                    <div className="bg-[var(--brand-300)] text-white p-3 rounded-xl max-w-[80%]">
                      <div className="text-xs opacity-70 mb-1">AI Agent</div>
                      <div className="text-sm flex items-center space-x-1">
                        <span>Typing</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="glass-card rounded-xl p-6">
              <h4 className="font-semibold text-[var(--brand-400)] mb-4">Performance Metrics</h4>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(currentDemoData.metrics).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-[var(--brand-300)] text-sm">{key}</span>
                    <span className="font-semibold text-[var(--brand-400)]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Try Demo CTA */}
        <div className="text-center mt-16">
          <a
            href="/auth"
            className="btn-primary btn-magnetic text-lg px-8 py-4 inline-flex items-center space-x-2"
          >
            <span>Try Your Own Demo</span>
            <Play className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Demo;
