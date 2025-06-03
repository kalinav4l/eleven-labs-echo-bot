
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code } from 'lucide-react';

interface EmbedCodeModalProps {
  agent: any;
  isOpen: boolean;
  onClose: () => void;
}

const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({ agent, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!agent) return null;

  const embedCode = `<speek-convai agent-id="${agent.id}"></speek-convai>
<script src="${window.location.origin}/embed-widget.js" async type="text/javascript"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-black flex items-center">
            <Code className="w-5 h-5 mr-2" />
            Cod Embed Speek pentru {agent.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Copiază codul de mai jos și plasează-l pe site-ul tău pentru a integra widget-ul Speek cu agentul {agent.name}.
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
              <li>2. Plasează codul în orice pagină HTML unde vrei să apară widget-ul</li>
              <li>3. Widget-ul Speek va apărea automat în colțul din dreapta jos</li>
              <li>4. Agentul {agent.name} va fi disponibil pentru conversații pe site-ul tău</li>
              <li>5. Widget-ul folosește logo-ul și stilul Speek pentru o experiență consistentă</li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <h3 className="text-black font-medium mb-2">Detalii Agent:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID Agent:</span>
                <span className="text-black font-mono">{agent.id}</span>
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

          <div className="bg-white border border-gray-200 rounded p-4">
            <h3 className="text-black font-medium mb-2">Preview Widget:</h3>
            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
              <div className="inline-flex items-center space-x-2 bg-white border-2 border-black rounded-full px-4 py-2">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
                <span className="text-black font-medium">Need help?</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Așa va arăta widget-ul pe site-ul tău</p>
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
