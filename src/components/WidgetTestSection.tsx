
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, MessageSquare, X, Eye } from 'lucide-react';
import EmbedWidget from './EmbedWidget';

interface WidgetTestSectionProps {
  agent: any;
}

const WidgetTestSection: React.FC<WidgetTestSectionProps> = ({ agent }) => {
  const [isWidgetVisible, setIsWidgetVisible] = useState(false);

  const toggleWidget = () => {
    setIsWidgetVisible(!isWidgetVisible);
  };

  return (
    <Card className="bg-white border-gray-200 mb-6">
      <CardHeader>
        <CardTitle className="text-black flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Testează Widget Chat - {agent.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-4">
          Testează cum va arăta și funcționa chat widget-ul pe site-ul tău. 
          Widget-ul va avea funcționalitate completă de chat cu agentul {agent.name}.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h4 className="font-medium text-blue-800 mb-2">✅ Funcții disponibile:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Chat text în timp real</li>
              <li>• Interfață intuitivă</li>
              <li>• Răspunsuri AI de la {agent.name}</li>
              <li>• Design responsive</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <h4 className="font-medium text-yellow-800 mb-2">🔧 Pentru dezvoltare:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Funcția vocală (demo)</li>
              <li>• Personalizare culori</li>
              <li>• Poziționare widget</li>
              <li>• Integrare site extern</li>
            </ul>
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <Button
            onClick={toggleWidget}
            className={`${
              isWidgetVisible 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-black hover:bg-gray-800'
            } text-white`}
          >
            {isWidgetVisible ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Închide Widget
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Afișează Widget
              </>
            )}
          </Button>
        </div>

        {isWidgetVisible && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-800 font-medium">Widget activ în colțul din dreapta jos</span>
            </div>
            <p className="text-green-700 text-sm">
              Widget-ul este acum funcțional pe această pagină. Poți testa chat-ul, 
              să trimiți mesaje și să vezi cum răspunde agentul {agent.name}.
            </p>
            <div className="mt-3 p-3 bg-white border border-green-200 rounded">
              <p className="text-sm text-gray-600">
                <strong>Cum să testezi:</strong><br/>
                1. Apasă pe widget-ul din colțul din dreapta jos<br/>
                2. Scrie un mesaj în chat<br/>
                3. Apasă pe butonul de microfon pentru test vocal<br/>
                4. Observă cum răspunde agentul {agent.name}
              </p>
            </div>
          </div>
        )}

        {/* Widget-ul va apărea în colțul din dreapta jos când este activat */}
        {isWidgetVisible && (
          <EmbedWidget agentId={agent.id} agentName={agent.name} />
        )}
      </CardContent>
    </Card>
  );
};

export default WidgetTestSection;
