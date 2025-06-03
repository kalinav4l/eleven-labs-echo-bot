
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code } from 'lucide-react';
import EmbedWidget from './EmbedWidget';

interface EmbedCodeModalProps {
  agent: any;
  isOpen: boolean;
  onClose: () => void;
}

const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ agent, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!agent) return null;

  // URL-ul corect pentru script-ul Speek embed widget
  const scriptUrl = `${window.location.origin}/speek-embed-widget.js`;
  
  const embedCode = `<speek-convai agent-id="${agent.id}" agent-name="${agent.name}"></speek-convai>
<script src="${scriptUrl}" async type="text/javascript"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-black flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Cod Embed pentru {agent.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Partea stângă - Codul și instrucțiunile */}
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Copiază codul de mai jos și plasează-l pe site-ul tău pentru a integra agentul {agent.name}.
            </p>

            <div className="bg-gray-50 border rounded p-4 relative">
              <Button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 bg-black hover:bg-gray-800 text-white"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiat!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiază
                  </>
                )}
              </Button>

              <pre className="text-sm text-gray-800 overflow-x-auto pr-20">
                <code>{embedCode}</code>
              </pre>
            </div>

            <div className="bg-white border border-gray-200 rounded p-4">
              <h3 className="text-black font-medium mb-2">Instrucțiuni de integrare:</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li>1. Copiază codul embed de mai sus</li>
                <li>2. Plasează codul în orice pagină HTML unde vrei să apară agentul</li>
                <li>3. Widgetul va apărea automat în colțul din dreapta jos</li>
                <li>4. Agentul {agent.name} va fi disponibil pentru conversații pe site-ul tău</li>
                <li>5. Script-ul se încarcă de la: <code className="text-xs bg-gray-100 px-1 rounded">{scriptUrl}</code></li>
              </ol>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <h3 className="text-black font-medium mb-2">Detalii Agent:</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID Agent:</span>
                  <span className="text-black font-mono text-xs">{agent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nume:</span>
                  <span className="text-black">{agent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Limbă:</span>
                  <span className="text-black">{agent.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Voce:</span>
                  <span className="text-black">{agent.voice}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="text-blue-800 font-medium mb-2">📋 Exemplu complet de integrare:</h3>
              <pre className="text-xs text-blue-700 bg-blue-100 p-2 rounded overflow-x-auto">
{`<!DOCTYPE html>
<html>
<head>
  <title>Site-ul meu</title>
</head>
<body>
  <!-- Conținutul site-ului tău -->
  
  <!-- Embed widget Speek -->
  <speek-convai agent-id="${agent.id}" agent-name="${agent.name}"></speek-convai>
  <script src="${scriptUrl}" async type="text/javascript"></script>
</body>
</html>`}
              </pre>
            </div>
          </div>

          {/* Partea dreaptă - Preview-ul widgetului */}
          <div className="space-y-4">
            <h3 className="text-black font-medium">Preview Widget:</h3>
            <div className="bg-gray-100 border rounded-lg p-4 min-h-[300px] relative">
              <p className="text-gray-600 text-sm mb-4">
                Așa va arăta widgetul pe site-ul tău:
              </p>
              <div className="relative">
                <EmbedWidget agentId={agent.id} agentName={agent.name} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Închide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedCodeModal;
