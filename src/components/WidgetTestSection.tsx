
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
  const [isElevenLabsVisible, setIsElevenLabsVisible] = useState(false);

  // Load ElevenLabs script
  useEffect(() => {
    if (isElevenLabsVisible) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      document.head.appendChild(script);

      return () => {
        // Cleanup script when component unmounts or widget is hidden
        const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    }
  }, [isElevenLabsVisible]);

  const toggleWidget = () => {
    setIsWidgetVisible(!isWidgetVisible);
  };

  const toggleElevenLabsWidget = () => {
    setIsElevenLabsVisible(!isElevenLabsVisible);
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

          {/* ElevenLabs Official Widget */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-black mb-3 flex items-center">
              <Mic className="w-5 h-5 mr-2" />
              Widget ElevenLabs Official
            </h3>
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
              <h4 className="font-medium text-green-800 mb-2">⭐ Funcții avansate:</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Conversații vocale complete</li>
                <li>• Recunoaștere vocală în timp real</li>
                <li>• Răspunsuri audio naturale</li>
                <li>• Tehnologie ElevenLabs</li>
              </ul>
            </div>
            <Button
              onClick={toggleElevenLabsWidget}
              className={`w-full ${
                isElevenLabsVisible 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isElevenLabsVisible ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Închide Widget ElevenLabs
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Testează Widget ElevenLabs
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

        {isElevenLabsVisible && (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-800 font-medium">Widget ElevenLabs activ în colțul din dreapta jos</span>
            </div>
            <p className="text-green-700 text-sm">
              Widget-ul oficial ElevenLabs este acum funcțional. Poți avea conversații vocale complete cu agentul {agent.name}.
            </p>
            <div className="mt-3 p-3 bg-white border border-green-200 rounded">
              <p className="text-sm text-gray-600">
                <strong>Cum să testezi widget-ul ElevenLabs:</strong><br/>
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

        {/* Widget-ul ElevenLabs oficial */}
        {isElevenLabsVisible && (
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
