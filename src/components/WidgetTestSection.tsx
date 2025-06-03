
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, MessageSquare, X, Eye, Mic } from 'lucide-react';
import EmbedWidget from './EmbedWidget';

interface WidgetTestSectionProps {
  agent: any;
}

const WidgetTestSection: React.FC<WidgetTestSectionProps> = ({ agent }) => {
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);
  const [isBoreaVoiceVisible, setIsBoreaVoiceVisible] = useState(false);

  // Load ElevenLabs script for Borea Voice Widget and apply custom styling
  useEffect(() => {
    if (isBoreaVoiceVisible) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      
      script.onload = () => {
        // Apply custom styling to override ElevenLabs branding with Borea
        const style = document.createElement('style');
        style.textContent = `
          elevenlabs-convai {
            --elevenlabs-primary-color: #000000 !important;
            --elevenlabs-background-color: #ffffff !important;
          }
          
          elevenlabs-convai .widget-button {
            background-color: #000000 !important;
            border-color: #000000 !important;
          }
          
          elevenlabs-convai .widget-button:hover {
            background-color: #333333 !important;
          }
          
          /* Override logo */
          elevenlabs-convai img[src*="elevenlabs"] {
            content: url('https://ik.imagekit.io/2eeuoo797/Group%2064.png?updatedAt=1748951277306') !important;
            width: 32px !important;
            height: 32px !important;
            border-radius: 50% !important;
          }
          
          /* Change text content */
          elevenlabs-convai .call-text::before {
            content: "Davai" !important;
          }
          
          elevenlabs-convai .call-text {
            font-size: 0 !important;
          }
          
          /* Hide ElevenLabs branding */
          elevenlabs-convai [class*="elevenlabs"],
          elevenlabs-convai [class*="ElevenLabs"] {
            display: none !important;
          }
          
          /* Custom Borea styling */
          elevenlabs-convai::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 1000;
          }
        `;
        document.head.appendChild(style);
      };
      
      document.head.appendChild(script);

      return () => {
        // Cleanup script and styles when component unmounts or widget is hidden
        const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
        
        const customStyles = document.querySelectorAll('style');
        customStyles.forEach(style => {
          if (style.textContent?.includes('elevenlabs-convai')) {
            document.head.removeChild(style);
          }
        });
      };
    }
  }, [isBoreaVoiceVisible]);

  const toggleWidget = () => {
    setIsWidgetVisible(!isWidgetVisible);
  };

  const toggleBoreaVoiceWidget = () => {
    setIsBoreaVoiceVisible(!isBoreaVoiceVisible);
  };

  return (
    <Card className="bg-white border-gray-200 mb-6">
      <CardHeader>
        <CardTitle className="text-black flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Testează Widget-uri Chat - {agent.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-6">
          Testează cum vor arăta și funcționa widget-urile de chat pe site-ul tău. 
          Ai două opțiuni disponibile pentru agentul {agent.name}.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Custom Chat Widget */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-black mb-3 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Widget Chat Custom
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <h4 className="font-medium text-blue-800 mb-2">✅ Funcții:</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Chat text în timp real</li>
                <li>• Interfață personalizabilă</li>
                <li>• Design responsive</li>
                <li>• Integrare ușoară</li>
              </ul>
            </div>
            <Button
              onClick={toggleWidget}
              className={`w-full ${
                isWidgetVisible 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-black hover:bg-gray-800'
              } text-white`}
            >
              {isWidgetVisible ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Închide Widget Custom
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Testează Widget Custom
                </>
              )}
            </Button>
          </div>

          {/* Borea Voice Widget */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-black mb-3 flex items-center">
              <img 
                src="https://ik.imagekit.io/2eeuoo797/Group%2064.png?updatedAt=1748951277306" 
                alt="Borea Logo" 
                className="w-5 h-5 mr-2 rounded-full object-cover"
              />
              Widget Borea Voice
            </h3>
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
              <h4 className="font-medium text-green-800 mb-2">⭐ Funcții avansate Borea:</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Conversații vocale complete</li>
                <li>• Recunoaștere vocală în timp real</li>
                <li>• Răspunsuri audio naturale</li>
                <li>• Tehnologie Borea AI</li>
              </ul>
            </div>
            <Button
              onClick={toggleBoreaVoiceWidget}
              className={`w-full ${
                isBoreaVoiceVisible 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isBoreaVoiceVisible ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Închide Widget Borea Voice
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Testează Widget Borea Voice
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {isWidgetVisible && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-blue-800 font-medium">Widget Custom activ în colțul din dreapta jos</span>
            </div>
            <p className="text-blue-700 text-sm">
              Widget-ul custom este acum funcțional. Poți testa chat-ul prin text cu agentul {agent.name}.
            </p>
          </div>
        )}

        {isBoreaVoiceVisible && (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <div className="flex items-center mb-2">
              <img 
                src="https://ik.imagekit.io/2eeuoo797/Group%2064.png?updatedAt=1748951277306" 
                alt="Borea Logo" 
                className="w-3 h-3 mr-2 rounded-full object-cover"
              />
              <span className="text-green-800 font-medium">Widget Borea Voice activ în colțul din dreapta jos</span>
            </div>
            <p className="text-green-700 text-sm">
              Widget-ul Borea Voice este acum funcțional. Poți avea conversații vocale complete cu agentul {agent.name}.
            </p>
            <div className="mt-3 p-3 bg-white border border-green-200 rounded">
              <p className="text-sm text-gray-600">
                <strong>Cum să testezi widget-ul Borea Voice:</strong><br/>
                1. Caută widget-ul în colțul din dreapta jos<br/>
                2. Apasă pentru a începe conversația<br/>
                3. Permite accesul la microfon când este solicitat<br/>
                4. Vorbește direct cu agentul {agent.name}
              </p>
            </div>
          </div>
        )}

        {/* Widget-ul Custom va apărea în colțul din dreapta jos când este activat */}
        {isWidgetVisible && (
          <EmbedWidget agentId={agent.id} agentName={agent.name} />
        )}

        {/* Widget-ul Borea Voice (cu tehnologie avansată) */}
        {isBoreaVoiceVisible && (
          <div 
            dangerouslySetInnerHTML={{
              __html: `<elevenlabs-convai agent-id="${agent.id}"></elevenlabs-convai>`
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default WidgetTestSection;
