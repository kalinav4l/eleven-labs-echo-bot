
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, MessageSquare, X } from 'lucide-react';
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
          <MessageSquare className="w-5 h-5 mr-2" />
          Test Chat Widget - {agent.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-4">
          Testează cum va arăta și funcționa chat widget-ul pe site-ul tău. 
          Apasă butonul de mai jos pentru a afișa widget-ul în colțul din dreapta jos.
        </p>
        
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
                Ascunde Widget
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
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-blue-800 font-medium">Widget activ în colțul din dreapta jos</span>
            </div>
            <p className="text-blue-700 text-sm">
              Widget-ul este acum vizibil pe această pagină. Poți interacționa cu el pentru a testa funcționalitatea.
            </p>
          </div>
        )}

        {/* Widget-ul va apărea în colțul din dreapta jos când este activat */}
        {isWidgetVisible && (
          <div className="fixed bottom-5 right-5 z-50">
            <EmbedWidget agentId={agent.id} agentName={agent.name} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WidgetTestSection;
